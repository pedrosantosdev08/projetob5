import { CheckCircle2, ClipboardList, XCircle } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components";
import { formatDate } from "../../lib/dates";
import { usePlayerAttendance } from "../trainings";

interface PlayerAttendanceSectionProps {
  playerId: string;
}

function getFrequencyBadgeStyle(percentage: number): string {
  if (percentage >= 75) {
    return "bg-emerald-50 text-emerald-800";
  }
  if (percentage >= 50) {
    return "bg-amber-100 text-amber-900";
  }
  return "bg-rose-100 text-rose-800";
}

export function PlayerAttendanceSection({
  playerId,
}: PlayerAttendanceSectionProps) {
  const {
    records,
    summary,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    reload,
  } = usePlayerAttendance(playerId);

  if (loading) {
    return (
      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">
          Histórico de frequência
        </h3>
        <LoadingState message="Carregando histórico de frequência..." />
      </Card>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Histórico de frequência
        </h3>
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-6 w-6" aria-hidden="true" />}
        title="Sem registros de frequência"
        description="As presenças e faltas deste jogador aparecerão aqui após a chamada."
      />
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Histórico de frequência
          </h3>
          <p className="text-xs text-slate-600">
            {summary.presentCount}{" "}
            {summary.presentCount === 1 ? "presença" : "presenças"} em{" "}
            {summary.total} {summary.total === 1 ? "treino" : "treinos"}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm font-bold ${getFrequencyBadgeStyle(
            summary.percentage
          )}`}
        >
          {summary.percentage}% de presença
        </span>
      </div>

      <ul className="divide-y divide-slate-100 border-t border-slate-100">
        {records.map((record) => (
          <li
            key={record.id}
            className="flex min-h-[48px] items-center justify-between gap-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">
                {formatDate(record.date)}
              </p>
              <p className="text-xs text-slate-500">{record.category}</p>
            </div>

            {record.present ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Presente</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Falta</span>
              </span>
            )}
          </li>
        ))}
      </ul>

      {loadMoreError && (
        <p role="alert" className="text-center text-xs font-medium text-rose-600">
          {loadMoreError}
        </p>
      )}

      {hasMore && (
        <Button
          variant="secondary"
          loading={loadingMore}
          onClick={loadMore}
          className="w-full"
        >
          {loadingMore ? "Carregando..." : "Carregar mais"}
        </Button>
      )}
    </Card>
  );
}
