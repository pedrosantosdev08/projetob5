import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
  writeBatch,
  type DocumentData,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { requireDb } from "../../lib/firebase";
import { getFirestoreErrorMessage } from "../../lib/firestoreError";
import {
  saveAttendanceSchema,
  type SaveAttendanceInput,
} from "./trainingSchema";
import type {
  AttendancePageResult,
  AttendanceRecord,
  AttendanceSummary,
  TrainingPageCursor,
} from "./trainingTypes";

const ATTENDANCE_COLLECTION = "attendance";
const TRAININGS_COLLECTION = "trainings";
const ATTENDANCE_PAGE_SIZE = 10;
const SUMMARY_QUERY_LIMIT = 200;
const FIRESTORE_BATCH_LIMIT = 499;

function toDateOrNow(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  if (value instanceof Date) {
    return value;
  }
  return new Date();
}

function mapDocToAttendance(id: string, data: DocumentData): AttendanceRecord {
  return {
    id,
    trainingId: typeof data.trainingId === "string" ? data.trainingId : "",
    playerId: typeof data.playerId === "string" ? data.playerId : "",
    category: typeof data.category === "string" ? data.category : "",
    date: toDateOrNow(data.date),
    present: Boolean(data.present),
  };
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

export function calculateAttendanceSummary(
  records: readonly AttendanceRecord[]
): AttendanceSummary {
  const total = records.length;
  if (total === 0) {
    return { total: 0, presentCount: 0, percentage: 0 };
  }
  const presentCount = records.filter((item) => item.present).length;
  const percentage = Math.round((presentCount / total) * 100);
  return { total, presentCount, percentage };
}

export async function listPlayerAttendance(params: {
  playerId: string;
  cursor?: TrainingPageCursor | null;
  pageSize?: number;
}): Promise<AttendancePageResult> {
  const db = requireDb();
  const pageSize = params.pageSize ?? ATTENDANCE_PAGE_SIZE;

  const constraints: QueryConstraint[] = [
    where("playerId", "==", params.playerId),
    orderBy("date", "desc"),
  ];

  if (params.cursor && isDocumentSnapshot(params.cursor)) {
    constraints.push(startAfter(params.cursor));
  }

  constraints.push(limit(pageSize + 1));

  const snapshot = await getDocs(
    query(collection(db, ATTENDANCE_COLLECTION), ...constraints)
  );

  const hasMore = snapshot.docs.length > pageSize;
  const pageDocs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs;
  const nextCursor = hasMore ? pageDocs[pageDocs.length - 1] ?? null : null;

  return {
    items: pageDocs.map((docSnap) =>
      mapDocToAttendance(docSnap.id, docSnap.data())
    ),
    nextCursor,
    hasMore,
  };
}

export async function getPlayerAttendanceSummary(
  playerId: string
): Promise<AttendanceSummary> {
  const db = requireDb();
  const snapshot = await getDocs(
    query(
      collection(db, ATTENDANCE_COLLECTION),
      where("playerId", "==", playerId),
      orderBy("date", "desc"),
      limit(SUMMARY_QUERY_LIMIT)
    )
  );

  const records = snapshot.docs.map((docSnap) =>
    mapDocToAttendance(docSnap.id, docSnap.data())
  );

  return calculateAttendanceSummary(records);
}

export async function getAttendanceByTraining(
  trainingId: string
): Promise<AttendanceRecord[]> {
  const db = requireDb();
  const snapshot = await getDocs(
    query(
      collection(db, ATTENDANCE_COLLECTION),
      where("trainingId", "==", trainingId),
      limit(SUMMARY_QUERY_LIMIT)
    )
  );

  return snapshot.docs.map((docSnap) =>
    mapDocToAttendance(docSnap.id, docSnap.data())
  );
}

export async function saveTrainingAttendance(
  input: SaveAttendanceInput
): Promise<void> {
  const parsed = saveAttendanceSchema.parse(input);
  const db = requireDb();
  const trainingTimestamp = Timestamp.fromDate(parsed.date);

  for (let i = 0; i < parsed.entries.length; i += FIRESTORE_BATCH_LIMIT) {
    const chunk = parsed.entries.slice(i, i + FIRESTORE_BATCH_LIMIT);
    const isLastChunk = i + FIRESTORE_BATCH_LIMIT >= parsed.entries.length;
    const batch = writeBatch(db);

    for (const entry of chunk) {
      const attendanceId = `${parsed.trainingId}_${entry.playerId}`;
      batch.set(doc(db, ATTENDANCE_COLLECTION, attendanceId), {
        trainingId: parsed.trainingId,
        playerId: entry.playerId,
        category: parsed.category,
        date: trainingTimestamp,
        present: entry.present,
      });
    }

    if (isLastChunk) {
      batch.update(doc(db, TRAININGS_COLLECTION, parsed.trainingId), {
        attendanceDone: true,
      });
    }

    await batch.commit();
  }
}

export function getAttendanceErrorMessage(error: unknown): string {
  return getFirestoreErrorMessage(error, {
    permissionDenied: "Sem permissão para acessar ou salvar a chamada.",
    fallback: "Não foi possível carregar ou salvar a chamada. Tente novamente.",
  });
}
