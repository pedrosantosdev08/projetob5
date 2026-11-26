import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import {
  ABSENCE_ALERT_STREAK,
  DASHBOARD_WINDOW_DAYS,
  LOAN_ALERT_DAYS,
  PLAYER_CATEGORIES,
} from "../../lib/constants";
import { daysAgo, daysBetween } from "../../lib/dates";
import { requireDb } from "../../lib/firebase";
import { getFirestoreErrorMessage } from "../../lib/firestoreError";
import type {
  AbsenceAlert,
  CategoryAttendanceRate,
  DashboardAlert,
  DashboardMetrics,
  OverdueLoanAlert,
} from "./dashboardTypes";

const QUERY_LIMIT = 500;

interface RawAttendance {
  trainingId: string;
  playerId: string;
  category: string;
  date: Date;
  present: boolean;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const db = requireDb();

  try {
    // 1. Jogadores ativos
    const playersSnap = await getDocs(
      query(
        collection(db, "players"),
        where("status", "==", "active"),
        limit(QUERY_LIMIT)
      )
    );
    const activePlayers = playersSnap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        name: (d.name as string) || "Sem nome",
        category: (d.category as string) || "",
      };
    });
    const activePlayersCount = activePlayers.length;

    // 2. Materiais (para calcular materiais em uso = totalQuantity - availableQuantity)
    const materialsSnap = await getDocs(
      query(collection(db, "materials"), limit(QUERY_LIMIT))
    );
    let materialsInUseCount = 0;
    materialsSnap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      const total = Number(d.totalQuantity) || 0;
      const available = Number(d.availableQuantity) || 0;
      materialsInUseCount += Math.max(0, total - available);
    });

    // 3. Empréstimos em aberto (para pendentes e alertas de atraso)
    const loansSnap = await getDocs(
      query(
        collection(db, "loans"),
        where("status", "==", "open"),
        orderBy("loanedAt", "desc"),
        limit(QUERY_LIMIT)
      )
    );
    const openLoansCount = loansSnap.docs.length;
    const now = new Date();
    const loanAlerts: OverdueLoanAlert[] = [];

    loansSnap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      const loanedAt =
        d.loanedAt instanceof Timestamp ? d.loanedAt.toDate() : new Date();
      const days = daysBetween(loanedAt, now);
      if (days >= LOAN_ALERT_DAYS) {
        loanAlerts.push({
          type: "loan",
          loanId: docSnap.id,
          materialName: (d.materialName as string) || "Material",
          playerName: (d.playerName as string) || "Jogador",
          loanedAt,
          daysOverdue: days,
        });
      }
    });

    // 4. Chamadas dos últimos 30 dias para frequência por categoria
    const windowStart = daysAgo(DASHBOARD_WINDOW_DAYS);
    const attendanceSnap = await getDocs(
      query(
        collection(db, "attendance"),
        where("date", ">=", Timestamp.fromDate(windowStart)),
        orderBy("date", "desc"),
        limit(QUERY_LIMIT)
      )
    );

    const attendancesInWindow: RawAttendance[] = attendanceSnap.docs.map(
      (docSnap) => {
        const d = docSnap.data();
        return {
          trainingId: (d.trainingId as string) || "",
          playerId: (d.playerId as string) || "",
          category: (d.category as string) || "",
          date:
            d.date instanceof Timestamp ? d.date.toDate() : new Date(),
          present: Boolean(d.present),
        };
      }
    );

    // Calcular frequência agregada por categoria
    const categoryStatsMap = new Map<
      string,
      { total: number; present: number }
    >();

    // Inicializar categorias padrão
    PLAYER_CATEGORIES.forEach((cat) => {
      categoryStatsMap.set(cat, { total: 0, present: 0 });
    });

    attendancesInWindow.forEach((att) => {
      const stat = categoryStatsMap.get(att.category) || {
        total: 0,
        present: 0,
      };
      stat.total += 1;
      if (att.present) stat.present += 1;
      categoryStatsMap.set(att.category, stat);
    });

    const categoryRates: CategoryAttendanceRate[] = Array.from(
      categoryStatsMap.entries()
    ).map(([category, stat]) => ({
      category,
      totalAttendances: stat.total,
      presentCount: stat.present,
      percentage: stat.total > 0 ? Math.round((stat.present / stat.total) * 100) : 0,
    }));

    const totalWindowAttendances = attendancesInWindow.length;
    const totalWindowPresents = attendancesInWindow.filter(
      (a) => a.present
    ).length;
    const overallAttendancePercentage =
      totalWindowAttendances > 0
        ? Math.round((totalWindowPresents / totalWindowAttendances) * 100)
        : 0;

    // 5. Alerta de evasão: jogadores com ABSENCE_ALERT_STREAK faltas consecutivas nos treinos mais recentes
    // Buscar histórico mais amplo de chamadas ordenadas por data desc para checar a sequência de cada jogador ativo
    const recentAttendanceSnap = await getDocs(
      query(
        collection(db, "attendance"),
        orderBy("date", "desc"),
        limit(QUERY_LIMIT)
      )
    );

    // Agrupar presenças por jogador em ordem decrescente de data
    const playerHistory = new Map<string, boolean[]>();
    recentAttendanceSnap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      const pId = (d.playerId as string) || "";
      if (!pId) return;
      const history = playerHistory.get(pId) || [];
      history.push(Boolean(d.present));
      playerHistory.set(pId, history);
    });

    const absenceAlerts: AbsenceAlert[] = [];
    activePlayers.forEach((player) => {
      const history = playerHistory.get(player.id);
      if (!history || history.length < ABSENCE_ALERT_STREAK) return;

      // Verificar as primeiras N presenças (sendo as mais recentes)
      let consecutiveAbsences = 0;
      for (const present of history) {
        if (!present) {
          consecutiveAbsences += 1;
        } else {
          break;
        }
      }

      if (consecutiveAbsences >= ABSENCE_ALERT_STREAK) {
        absenceAlerts.push({
          type: "absence",
          playerId: player.id,
          playerName: player.name,
          category: player.category,
          consecutiveAbsences,
        });
      }
    });

    const alerts: DashboardAlert[] = [...absenceAlerts, ...loanAlerts];

    return {
      activePlayersCount,
      categoryRates,
      overallAttendancePercentage,
      materialsInUseCount,
      openLoansCount,
      alerts,
    };
  } catch (error) {
    throw new Error(
      getFirestoreErrorMessage(error, {
        permissionDenied: "Sem permissão para carregar dados do painel.",
        fallback: "Não foi possível carregar os dados do painel.",
      })
    );
  }
}
