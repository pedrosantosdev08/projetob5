import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  CheckCircle2,
  Save,
  Users,
  X,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components";
import { calculateAge, formatDate } from "../../lib/dates";
import { useTrainingAttendance } from "./useTrainingAttendance";

export default function TrainingAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    training,
    players,
    presenceMap,
    hasExistingAttendance,
    loading,
    error,
    saving,
    saveError,
    saveSuccess,
    togglePlayer,
    markAllPresent,
    save,
    reload,
  } = useTrainingAttendance(id);

  if (loading) {
    return <LoadingState message="Carregando chamada do treino..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  if (!training) {
    return (
      <EmptyState
        title="Treino não encontrado"
        description="Não encontramos o treino selecionado para fazer a chamada."
        action={
          <Button onClick={() => navigate("/treinos")}>
            Voltar para treinos
          </Button>
        }
      />
    );
  }

  const presentCount = players.filter((player) => presenceMap[player.id]).length;

  return (
    <section className="space-y-4">
      <header className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/treinos"
            aria-label="Voltar para treinos"
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Chamada</h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                {training.category}
              </span>
              {hasExistingAttendance && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  Chamada salva
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600">
              {formatDate(training.date)}
              {training.notes ? ` · ${training.notes}` : ""}
            </p>
          </div>
        </div>
      </header>

      {players.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" aria-hidden="true" />}
          title={`Nenhum jogador ativo em ${training.category}`}
          description="Cadastre ou ative jogadores nesta categoria para registrar a chamada."
          action={
            <Button onClick={() => navigate("/jogadores/novo")}>
              Cadastrar jogador
            </Button>
          }
        />
      ) : (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Resumo</p>
              <p className="text-base font-bold text-slate-900">
                {presentCount} de {players.length}{" "}
                {presentCount === 1 ? "presente" : "presentes"}
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={markAllPresent}
              disabled={saving}
            >
              <CheckCheck className="h-4 w-4 text-emerald-700" aria-hidden="true" />
              <span>Marcar todos presentes</span>
            </Button>
          </Card>

          {saveError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{saveError}</span>
            </div>
          )}

          {saveSuccess && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-900"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
              <span>Chamada salva com sucesso!</span>
            </div>
          )}

          <ul className="space-y-2.5">
            {players.map((player) => {
              const isPresent = Boolean(presenceMap[player.id]);
              const age = calculateAge(player.birthDate);

              return (
                <li key={player.id}>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isPresent}
                    onClick={() => togglePlayer(player.id)}
                    disabled={saving}
                    className={`flex min-h-[60px] w-full items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-colors active:scale-[0.99] ${
                      isPresent
                        ? "border-emerald-300 bg-emerald-50/60"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900">
                        {player.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {age} {age === 1 ? "ano" : "anos"} · {player.neighborhood}
                      </p>
                    </div>

                    <span
                      className={`inline-flex min-h-[44px] min-w-[104px] shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-bold transition-colors ${
                        isPresent
                          ? "bg-emerald-700 text-white"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {isPresent ? (
                        <>
                          <Check className="h-4 w-4" aria-hidden="true" />
                          <span>Presente</span>
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" aria-hidden="true" />
                          <span>Falta</span>
                        </>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="sticky bottom-18 z-20 pt-2">
            <Button
              onClick={save}
              loading={saving}
              className="min-h-[50px] w-full shadow-md"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>
                {saving
                  ? "Salvando chamada..."
                  : hasExistingAttendance
                    ? "Atualizar chamada"
                    : "Salvar chamada"}
              </span>
            </Button>
          </div>
        </>
      )}
    </section>
  );
}
