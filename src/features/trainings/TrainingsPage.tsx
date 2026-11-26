import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, CheckCircle2, ClipboardCheck, Plus } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components";
import { PLAYER_CATEGORIES } from "../../lib/constants";
import { formatDate } from "../../lib/dates";
import { TrainingFormModal } from "./TrainingFormModal";
import type { TrainingFormValues } from "./trainingSchema";
import { useTrainingMutations } from "./useTrainingMutations";
import { useTrainings } from "./useTrainings";

export default function TrainingsPage() {
  const [category, setCategory] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);

  const {
    trainings,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    reload,
  } = useTrainings(category);

  const { addTraining, creating, mutationError, clearError } =
    useTrainingMutations();

  const openModal = () => {
    clearError();
    setModalOpen(true);
  };

  const handleCreateTraining = async (values: TrainingFormValues) => {
    try {
      await addTraining(values);
      setModalOpen(false);
      await reload();
    } catch {
      // Erro já exposto no modal via mutationError.
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Treinos</h1>
          <p className="text-sm text-slate-600">
            Registro de treinos e chamada rápida em campo.
          </p>
        </div>
        <Button onClick={openModal}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Novo treino</span>
        </Button>
      </header>

      <div
        role="group"
        aria-label="Filtrar treinos por categoria"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`min-h-[44px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
            category === "all"
              ? "bg-slate-900 text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          Todas
        </button>
        {PLAYER_CATEGORIES.map((cat) => {
          const selected = category === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[44px] shrink-0 rounded-full px-4 text-sm font-medium transition-colors ${
                selected
                  ? "bg-slate-900 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingState message="Carregando treinos..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : trainings.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-6 w-6" aria-hidden="true" />}
          title={
            category !== "all"
              ? `Nenhum treino em ${category}`
              : "Nenhum treino registrado"
          }
          description={
            category !== "all"
              ? "Crie um treino para esta categoria ou limpe o filtro."
              : "Crie o primeiro treino para liberar a chamada dos jogadores."
          }
          action={
            category !== "all" ? (
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="secondary" onClick={() => setCategory("all")}>
                  Ver todas
                </Button>
                <Button onClick={openModal}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Novo treino</span>
                </Button>
              </div>
            ) : (
              <Button onClick={openModal}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Criar treino</span>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <ul className="space-y-3">
            {trainings.map((training) => (
              <li key={training.id}>
                <Card className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 text-base font-bold text-slate-900">
                          <Calendar
                            className="h-4 w-4 text-emerald-700"
                            aria-hidden="true"
                          />
                          {formatDate(training.date)}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                          {training.category}
                        </span>
                      </div>
                      {training.notes && (
                        <p className="text-sm text-slate-600">{training.notes}</p>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/treinos/${training.id}/chamada`}
                    className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                      training.attendanceDone
                        ? "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                        : "bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900"
                    }`}
                  >
                    {training.attendanceDone ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        <span>Chamada concluída</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                        <span>Fazer chamada</span>
                      </>
                    )}
                  </Link>
                </Card>
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
        </div>
      )}

      <TrainingFormModal
        open={modalOpen}
        initialCategory={category !== "all" ? category : undefined}
        saving={creating}
        error={mutationError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateTraining}
      />
    </section>
  );
}
