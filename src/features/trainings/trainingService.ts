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
  where,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { DEFAULT_PAGE_SIZE } from "../../lib/constants";
import { parseDateInput } from "../../lib/dates";
import { requireDb } from "../../lib/firebase";
import { getFirestoreErrorMessage } from "../../lib/firestoreError";
import type { TrainingFormValues } from "./trainingSchema";
import type {
  Training,
  TrainingPageCursor,
  TrainingPageResult,
} from "./trainingTypes";

const TRAININGS_COLLECTION = "trainings";
const ATTENDANCE_COLLECTION = "attendance";

function toDateOrNow(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
}

function mapDocToTraining(id: string, data: DocumentData): Training {
  const notes =
    typeof data.notes === "string" && data.notes.trim().length > 0
      ? data.notes.trim()
      : undefined;

  return {
    id,
    date: toDateOrNow(data.date),
    category: typeof data.category === "string" ? data.category : "",
    notes,
    attendanceDone: Boolean(data.attendanceDone),
    createdAt: toDateOrNow(data.createdAt),
  };
}

async function hasSavedAttendance(trainingId: string): Promise<boolean> {
  const db = requireDb();
  const snapshot = await getDocs(
    query(
      collection(db, ATTENDANCE_COLLECTION),
      where("trainingId", "==", trainingId),
      limit(1)
    )
  );
  return !snapshot.empty;
}

function isDocumentSnapshot(
  cursor: TrainingPageCursor
): cursor is QueryDocumentSnapshot<DocumentData> {
  return (
    typeof cursor === "object" &&
    cursor !== null &&
    "id" in cursor &&
    "data" in cursor
  );
}

export async function listTrainings(params: {
  category: string;
  cursor?: TrainingPageCursor | null;
  pageSize?: number;
}): Promise<TrainingPageResult> {
  const db = requireDb();
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;

  const constraints: QueryConstraint[] = [];

  if (params.category && params.category !== "all") {
    constraints.push(where("category", "==", params.category));
  }

  constraints.push(orderBy("date", "desc"));

  if (params.cursor && isDocumentSnapshot(params.cursor)) {
    constraints.push(startAfter(params.cursor));
  }

  constraints.push(limit(pageSize + 1));

  const snapshot = await getDocs(
    query(collection(db, TRAININGS_COLLECTION), ...constraints)
  );

  const hasMore = snapshot.docs.length > pageSize;
  const pageDocs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
  const nextCursor = hasMore ? pageDocs[pageDocs.length - 1] ?? null : null;

  const items = await Promise.all(
    pageDocs.map(async (docSnap) => {
      const training = mapDocToTraining(docSnap.id, docSnap.data());
      if (training.attendanceDone) {
        return training;
      }
      const hasAttendance = await hasSavedAttendance(training.id);
      return hasAttendance ? { ...training, attendanceDone: true } : training;
    })
  );

  return {
    items,
    nextCursor,
    hasMore,
  };
}

export async function getTrainingById(id: string): Promise<Training | null> {
  const db = requireDb();
  const snapshot = await getDoc(doc(db, TRAININGS_COLLECTION, id));
  if (!snapshot.exists()) {
    return null;
  }
  return mapDocToTraining(snapshot.id, snapshot.data());
}

export async function createTraining(values: TrainingFormValues): Promise<string> {
  const db = requireDb();
  const trimmedNotes = values.notes?.trim() ?? "";

  const docData: {
    date: Timestamp;
    category: string;
    attendanceDone: boolean;
    createdAt: ReturnType<typeof serverTimestamp>;
    notes?: string;
  } = {
    date: Timestamp.fromDate(parseDateInput(values.date)),
    category: values.category,
    attendanceDone: false,
    createdAt: serverTimestamp(),
  };

  if (trimmedNotes.length > 0) {
    docData.notes = trimmedNotes;
  }

  const docRef = await addDoc(collection(db, TRAININGS_COLLECTION), docData);
  return docRef.id;
}

export function getTrainingErrorMessage(error: unknown): string {
  return getFirestoreErrorMessage(error, {
    permissionDenied: "Sem permissão para acessar ou criar treinos.",
    fallback: "Não foi possível carregar ou salvar o treino. Tente novamente.",
  });
}
