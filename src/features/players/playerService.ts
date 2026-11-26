import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { DEFAULT_PAGE_SIZE } from "../../lib/constants";
import { parseDateInput } from "../../lib/dates";
import { requireDb } from "../../lib/firebase";
import { getFirestoreErrorMessage } from "../../lib/firestoreError";
import type { EntityStatus } from "../../types";
import type { PlayerFormValues } from "./playerSchema";
import type { Player, PlayerPageCursor, PlayerPageResult } from "./playerTypes";

const PLAYERS_COLLECTION = "players";
const SEARCH_QUERY_LIMIT = 200;

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

function mapDocToPlayer(
  id: string,
  data: DocumentData
): Player {
  const status: EntityStatus =
    data.status === "inactive" ? "inactive" : "active";

  return {
    id,
    name: typeof data.name === "string" ? data.name : "",
    birthDate: toDateOrNow(data.birthDate),
    category: typeof data.category === "string" ? data.category : "",
    neighborhood: typeof data.neighborhood === "string" ? data.neighborhood : "",
    guardianName: typeof data.guardianName === "string" ? data.guardianName : "",
    guardianPhone: typeof data.guardianPhone === "string" ? data.guardianPhone : "",
    guardianConsent: Boolean(data.guardianConsent),
    status,
    createdAt: toDateOrNow(data.createdAt),
    updatedAt: toDateOrNow(data.updatedAt),
  };
}

function isDocumentSnapshot(
  cursor: PlayerPageCursor
): cursor is QueryDocumentSnapshot<DocumentData> {
  return (
    typeof cursor === "object" &&
    cursor !== null &&
    "id" in cursor &&
    "data" in cursor
  );
}

export async function listPlayers(params: {
  status: EntityStatus;
  category: string;
  search: string;
  cursor?: PlayerPageCursor | null;
  pageSize?: number;
}): Promise<PlayerPageResult> {
  const db = requireDb();
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const trimmedSearch = normalizeText(params.search);
  const isSearching = trimmedSearch.length > 0;

  const constraints: QueryConstraint[] = [
    where("status", "==", params.status),
  ];

  if (params.category && params.category !== "all") {
    constraints.push(where("category", "==", params.category));
  }

  constraints.push(orderBy("name", "asc"));

  if (!isSearching && params.cursor && isDocumentSnapshot(params.cursor)) {
    constraints.push(startAfter(params.cursor));
  }

  const fetchLimit = isSearching ? SEARCH_QUERY_LIMIT : pageSize + 1;
  constraints.push(limit(fetchLimit));

  const snapshot = await getDocs(
    query(collection(db, PLAYERS_COLLECTION), ...constraints)
  );

  if (isSearching) {
    const items = snapshot.docs
      .map((docSnap) => mapDocToPlayer(docSnap.id, docSnap.data()))
      .filter(
        (player) =>
          normalizeText(player.name).includes(trimmedSearch) ||
          normalizeText(player.neighborhood).includes(trimmedSearch)
      );

    return {
      items,
      nextCursor: null,
      hasMore: false,
    };
  }

  const hasMore = snapshot.docs.length > pageSize;
  const pageDocs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
  const nextCursor = hasMore ? pageDocs[pageDocs.length - 1] ?? null : null;

  return {
    items: pageDocs.map((docSnap) => mapDocToPlayer(docSnap.id, docSnap.data())),
    nextCursor,
    hasMore,
  };
}

export async function listActivePlayersByCategory(
  category: string
): Promise<Player[]> {
  const db = requireDb();
  const snapshot = await getDocs(
    query(
      collection(db, PLAYERS_COLLECTION),
      where("status", "==", "active"),
      where("category", "==", category),
      orderBy("name", "asc"),
      limit(SEARCH_QUERY_LIMIT)
    )
  );

  return snapshot.docs.map((docSnap) =>
    mapDocToPlayer(docSnap.id, docSnap.data())
  );
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const db = requireDb();
  const snapshot = await getDoc(doc(db, PLAYERS_COLLECTION, id));
  if (!snapshot.exists()) {
    return null;
  }
  return mapDocToPlayer(snapshot.id, snapshot.data());
}

export async function createPlayer(values: PlayerFormValues): Promise<string> {
  const db = requireDb();
  const docRef = await addDoc(collection(db, PLAYERS_COLLECTION), {
    name: values.name.trim(),
    birthDate: Timestamp.fromDate(parseDateInput(values.birthDate)),
    category: values.category,
    neighborhood: values.neighborhood.trim(),
    guardianName: values.guardianName.trim(),
    guardianPhone: values.guardianPhone.trim(),
    guardianConsent: values.guardianConsent,
    status: "active" satisfies EntityStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePlayer(
  id: string,
  values: PlayerFormValues
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, PLAYERS_COLLECTION, id), {
    name: values.name.trim(),
    birthDate: Timestamp.fromDate(parseDateInput(values.birthDate)),
    category: values.category,
    neighborhood: values.neighborhood.trim(),
    guardianName: values.guardianName.trim(),
    guardianPhone: values.guardianPhone.trim(),
    guardianConsent: values.guardianConsent,
    updatedAt: serverTimestamp(),
  });
}

export async function setPlayerStatus(
  id: string,
  status: EntityStatus
): Promise<void> {
  const db = requireDb();
  await updateDoc(doc(db, PLAYERS_COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

export function getPlayerErrorMessage(error: unknown): string {
  return getFirestoreErrorMessage(error, {
    permissionDenied: "Sem permissão para acessar ou salvar jogadores.",
    fallback: "Não foi possível concluir a operação. Tente novamente.",
  });
}
