import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  startAfter,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { DEFAULT_PAGE_SIZE } from "../../lib/constants";
import { requireDb } from "../../lib/firebase";
import { getFirestoreErrorMessage } from "../../lib/firestoreError";
import type { MaterialFormValues } from "./materialSchema";
import type {
  Material,
  MaterialPageCursor,
  MaterialPageResult,
} from "./materialTypes";

const MATERIALS_COLLECTION = "materials";

export class MaterialBusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaterialBusinessError";
  }
}

function toDateOrNow(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
}

function toIntOrZero(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.trunc(value))
    : 0;
}

function mapDocToMaterial(id: string, data: DocumentData): Material {
  const totalQuantity = toIntOrZero(data.totalQuantity);
  const availableQuantity = Math.min(
    totalQuantity,
    toIntOrZero(data.availableQuantity)
  );

  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    totalQuantity,
    availableQuantity,
    active: data.active !== false,
    createdAt: toDateOrNow(data.createdAt),
  };
}

function isDocumentSnapshot(
  cursor: MaterialPageCursor
): cursor is QueryDocumentSnapshot<DocumentData> {
  return (
    typeof cursor === "object" &&
    cursor !== null &&
    "id" in cursor &&
    "data" in cursor
  );
}

export async function listMaterials(params?: {
  cursor?: MaterialPageCursor | null;
  pageSize?: number;
}): Promise<MaterialPageResult> {
  const db = requireDb();
  const pageSize = params?.pageSize ?? DEFAULT_PAGE_SIZE;

  const constraints: QueryConstraint[] = [orderBy("name", "asc")];

  if (params?.cursor && isDocumentSnapshot(params.cursor)) {
    constraints.push(startAfter(params.cursor));
  }

  constraints.push(limit(pageSize + 1));

  const snapshot = await getDocs(
    query(collection(db, MATERIALS_COLLECTION), ...constraints)
  );

  const hasMore = snapshot.docs.length > pageSize;
  const pageDocs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
  const nextCursor = hasMore ? pageDocs[pageDocs.length - 1] ?? null : null;

  return {
    items: pageDocs.map((docSnap) =>
      mapDocToMaterial(docSnap.id, docSnap.data())
    ),
    nextCursor,
    hasMore,
  };
}

export async function createMaterial(values: MaterialFormValues): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, MATERIALS_COLLECTION), {
    name: values.name.trim(),
    totalQuantity: values.totalQuantity,
    availableQuantity: values.totalQuantity,
    active: values.active,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateMaterial(
  id: string,
  values: MaterialFormValues
): Promise<void> {
  const db = requireDb();
  const materialRef = doc(db, MATERIALS_COLLECTION, id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(materialRef);
    if (!snapshot.exists()) {
      throw new MaterialBusinessError("Material não encontrado.");
    }

    const current = mapDocToMaterial(snapshot.id, snapshot.data());
    const loanedCount = Math.max(
      0,
      current.totalQuantity - current.availableQuantity
    );

    if (values.totalQuantity < loanedCount) {
      throw new MaterialBusinessError(
        `Há ${loanedCount} ${loanedCount === 1 ? "unidade emprestada" : "unidades emprestadas"}. O total não pode ser menor que ${loanedCount}.`
      );
    }

    const nextAvailableQuantity = values.totalQuantity - loanedCount;

    transaction.update(materialRef, {
      name: values.name.trim(),
      totalQuantity: values.totalQuantity,
      availableQuantity: nextAvailableQuantity,
      active: values.active,
    });
  });
}

export function getMaterialErrorMessage(error: unknown): string {
  if (error instanceof MaterialBusinessError) {
    return error.message;
  }

  return getFirestoreErrorMessage(error, {
    permissionDenied: "Sem permissão para acessar ou salvar materiais.",
    fallback: "Não foi possível carregar ou salvar o material. Tente novamente.",
  });
}
