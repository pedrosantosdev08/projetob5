import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  Timestamp,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { requireDb } from "../../lib/firebase";
import { getFirestoreErrorMessage } from "../../lib/firestoreError";
import { DEFAULT_PAGE_SIZE, LOAN_ALERT_DAYS } from "../../lib/constants";
import type { Loan, LoanPageCursor, LoanPageResult } from "./loanTypes";

const COL = "loans";

const MSGS = {
  permissionDenied: "Sem permissão para acessar os empréstimos.",
  fallback: "Erro ao acessar os empréstimos. Tente novamente.",
} as const;

function docToLoan(snap: QueryDocumentSnapshot | DocumentSnapshot): Loan {
  const d = snap.data();
  if (!d) throw new Error("Documento de empréstimo não encontrado");
  return {
    id: snap.id,
    materialId: d.materialId as string,
    materialName: d.materialName as string,
    playerId: d.playerId as string,
    playerName: d.playerName as string,
    quantity: d.quantity as number,
    status: d.status as "open" | "returned",
    loanedAt: (d.loanedAt as Timestamp).toDate(),
    returnedAt: d.returnedAt ? (d.returnedAt as Timestamp).toDate() : null,
    notes: (d.notes as string | undefined) ?? "",
    createdAt: (d.createdAt as Timestamp).toDate(),
  };
}

/** Alerta: empréstimos abertos com mais de LOAN_ALERT_DAYS dias. */
export function isLoanOverdue(loan: Loan): boolean {
  const ms = Date.now() - loan.loanedAt.getTime();
  return loan.status === "open" && ms > LOAN_ALERT_DAYS * 24 * 60 * 60 * 1000;
}

/** Lista empréstimos abertos (os mais recentes primeiro) com paginação. */
export async function listOpenLoans(
  cursor: LoanPageCursor | null
): Promise<LoanPageResult> {
  const db = requireDb();
  const pageSize = DEFAULT_PAGE_SIZE;

  let q = query(
    collection(db, COL),
    where("status", "==", "open"),
    orderBy("loanedAt", "desc"),
    limit(pageSize + 1)
  );

  if (cursor) {
    q = query(
      collection(db, COL),
      where("status", "==", "open"),
      orderBy("loanedAt", "desc"),
      startAfter(cursor as DocumentSnapshot),
      limit(pageSize + 1)
    );
  }

  try {
    const snap = await getDocs(q);
    const all = snap.docs.map(docToLoan);
    const hasMore = all.length > pageSize;
    const items = hasMore ? all.slice(0, pageSize) : all;
    const nextCursor = hasMore ? snap.docs[pageSize - 1] : null;
    return { items, nextCursor, hasMore };
  } catch (err) {
    throw new Error(getFirestoreErrorMessage(err, MSGS));
  }
}

/** Cria empréstimo via transaction: valida availableQuantity, cria loan, decrementa material. */
export async function createLoan(params: {
  materialId: string;
  materialName: string;
  playerId: string;
  playerName: string;
  quantity: number;
  notes: string;
}): Promise<string> {
  const db = requireDb();
  const materialRef = doc(db, "materials", params.materialId);
  const loanRef = doc(collection(db, COL));

  try {
    await runTransaction(db, async (tx) => {
      const materialSnap = await tx.get(materialRef);
      if (!materialSnap.exists()) throw new Error("Material não encontrado.");

      const available = materialSnap.data().availableQuantity as number;
      const active = materialSnap.data().active as boolean;

      if (!active) throw new Error("Este material está inativo.");
      if (available < params.quantity) {
        throw new Error(
          `Quantidade indisponível. Disponível: ${available}, Solicitado: ${params.quantity}.`
        );
      }

      const now = Timestamp.now();
      tx.set(loanRef, {
        materialId: params.materialId,
        materialName: params.materialName,
        playerId: params.playerId,
        playerName: params.playerName,
        quantity: params.quantity,
        status: "open",
        loanedAt: now,
        returnedAt: null,
        notes: params.notes,
        createdAt: now,
      });

      tx.update(materialRef, {
        availableQuantity: available - params.quantity,
      });
    });
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(getFirestoreErrorMessage(err, MSGS));
  }

  return loanRef.id;
}

/** Devolve um empréstimo aberto via transaction: marca returned, incrementa availableQuantity. */
export async function returnLoan(loanId: string): Promise<void> {
  const db = requireDb();
  const loanRef = doc(db, COL, loanId);

  try {
    await runTransaction(db, async (tx) => {
      const loanSnap = await tx.get(loanRef);
      if (!loanSnap.exists()) throw new Error("Empréstimo não encontrado.");

      const loan = loanSnap.data();
      if (loan.status !== "open") {
        throw new Error("Este empréstimo já foi devolvido.");
      }

      const materialRef = doc(db, "materials", loan.materialId as string);
      const materialSnap = await tx.get(materialRef);

      tx.update(loanRef, {
        status: "returned",
        returnedAt: Timestamp.now(),
      });

      if (materialSnap.exists()) {
        const available = materialSnap.data().availableQuantity as number;
        tx.update(materialRef, {
          availableQuantity: available + (loan.quantity as number),
        });
      }
    });
  } catch (err) {
    if (err instanceof Error) throw err;
    throw new Error(getFirestoreErrorMessage(err, MSGS));
  }
}

/** Busca um único empréstimo por ID. */
export async function getLoan(id: string): Promise<Loan | null> {
  const db = requireDb();
  try {
    const snap = await getDoc(doc(db, COL, id));
    return snap.exists() ? docToLoan(snap) : null;
  } catch (err) {
    throw new Error(getFirestoreErrorMessage(err, MSGS));
  }
}
