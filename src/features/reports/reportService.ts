import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { daysAgo } from "../../lib/dates";
import { requireDb } from "../../lib/firebase";
import { getFirestoreErrorMessage } from "../../lib/firestoreError";
import type { PlayerReportItem, ReportFilter } from "./reportTypes";

const QUERY_LIMIT = 500;

/**
 * Sanitiza campos para evitar CSV Injection (Fórmula Injection).
 * Qualquer célula começando com =, +, -, @ ou tab/CR é prefixada com apóstrofo (')
 * e as aspas duplas internas são escapadas.
 */
export function sanitizeCsvCell(value: string | number): string {
  const str = String(value ?? "");
  const trimmed = str.trimStart();

  let safe = str;
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    safe = `'${str}`;
  }

  // Escapa aspas duplas duplicando-as e envolve a célula em aspas
  const escaped = safe.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Converte a lista de jogadores em conteúdo CSV sanitizado
 */
export function generatePlayersReportCsv(items: PlayerReportItem[]): string {
  const headers = [
    "Nome",
    "Categoria",
    "Status",
    "Total de Treinos",
    "Presenças",
    "Faltas",
    "% Presença",
  ];

  const headerRow = headers.map(sanitizeCsvCell).join(";");

  const rows = items.map((item) => {
    return [
      sanitizeCsvCell(item.name),
      sanitizeCsvCell(item.category),
      sanitizeCsvCell(item.status === "active" ? "Ativo" : "Inativo"),
      sanitizeCsvCell(item.totalTrainings),
      sanitizeCsvCell(item.presentCount),
      sanitizeCsvCell(item.absenceCount),
      sanitizeCsvCell(`${item.attendancePercentage}%`),
    ].join(";");
  });

  // Adiciona BOM UTF-8 (\uFEFF) para garantir abertura correta de acentos no Excel
  return "\uFEFF" + [headerRow, ...rows].join("\r\n");
}

export async function getPlayersParticipationReport(
  filter: ReportFilter
): Promise<PlayerReportItem[]> {
  const db = requireDb();

  try {
    // 1. Buscar jogadores
    const playerConstraints: QueryConstraint[] = [];
    if (filter.status !== "all") {
      playerConstraints.push(where("status", "==", filter.status));
    }
    if (filter.category !== "all") {
      playerConstraints.push(where("category", "==", filter.category));
    }
    playerConstraints.push(orderBy("name", "asc"));
    playerConstraints.push(limit(QUERY_LIMIT));

    const playersSnap = await getDocs(
      query(collection(db, "players"), ...playerConstraints)
    );

    const players = playersSnap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: docSnap.id,
        name: (d.name as string) || "Sem nome",
        category: (d.category as string) || "Geral",
        status: (d.status as "active" | "inactive") || "active",
      };
    });

    if (players.length === 0) {
      return [];
    }

    // 2. Buscar presenças respeitando o período
    const attendanceConstraints: QueryConstraint[] = [];
    if (filter.period === "30d") {
      attendanceConstraints.push(
        where("date", ">=", Timestamp.fromDate(daysAgo(30)))
      );
    } else if (filter.period === "90d") {
      attendanceConstraints.push(
        where("date", ">=", Timestamp.fromDate(daysAgo(90)))
      );
    }
    attendanceConstraints.push(orderBy("date", "desc"));
    attendanceConstraints.push(limit(QUERY_LIMIT));

    const attendanceSnap = await getDocs(
      query(collection(db, "attendance"), ...attendanceConstraints)
    );

    // Mapear registros de presença por jogador
    const attendanceMap = new Map<
      string,
      { total: number; present: number }
    >();

    attendanceSnap.docs.forEach((docSnap) => {
      const d = docSnap.data();
      const pId = d.playerId as string;
      if (!pId) return;

      const current = attendanceMap.get(pId) || { total: 0, present: 0 };
      current.total += 1;
      if (d.present) {
        current.present += 1;
      }
      attendanceMap.set(pId, current);
    });

    // 3. Montar o relatório consolidado
    return players.map((player) => {
      const stats = attendanceMap.get(player.id) || { total: 0, present: 0 };
      const percentage =
        stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

      return {
        id: player.id,
        name: player.name,
        category: player.category,
        status: player.status,
        totalTrainings: stats.total,
        presentCount: stats.present,
        absenceCount: stats.total - stats.present,
        attendancePercentage: percentage,
      };
    });
  } catch (error) {
    throw new Error(
      getFirestoreErrorMessage(error, {
        permissionDenied: "Sem permissão para gerar relatórios.",
        fallback: "Não foi possível carregar os dados do relatório.",
      })
    );
  }
}
