import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { EmptyState, ErrorState, LoadingState } from "../../components";
import { PLAYER_CATEGORIES, type PlayerCategory } from "../../lib/constants";
import { toDateInputValue } from "../../lib/dates";
import { PlayerForm } from "./PlayerForm";
import type { PlayerFormValues } from "./playerSchema";
import { usePlayer } from "./usePlayer";
import { usePlayerMutations } from "./usePlayerMutations";

function isPlayerCategory(value: string): value is PlayerCategory {
  return (PLAYER_CATEGORIES as readonly string[]).includes(value);
}

export default function PlayerFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const { player, loading, error, reload } = usePlayer(id);
  const { savePlayer, saving, mutationError } = usePlayerMutations();

  const handleBack = () => {
    navigate(isEditing && id ? `/jogadores/${id}` : "/jogadores");
  };

  const handleSubmit = async (values: PlayerFormValues) => {
    try {
      const savedId = await savePlayer(values, id);
      navigate(`/jogadores/${savedId}`, { replace: true });
    } catch {
      // Erro já exposto pelo hook usePlayerMutations.
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Voltar"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {isEditing ? "Editar jogador" : "Novo jogador"}
          </h1>
          <p className="text-sm text-slate-600">
            {isEditing
              ? "Atualize os dados cadastrais do atleta."
              : "Preencha os dados básicos e a autorização do responsável."}
          </p>
        </div>
      </header>

      {isEditing && loading ? (
        <LoadingState message="Carregando dados do jogador..." />
      ) : isEditing && error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : isEditing && !player ? (
        <EmptyState
          title="Jogador não encontrado"
          description="Não encontramos esse cadastro para edição."
        />
      ) : (
        <PlayerForm
          defaultValues={
            player
              ? {
                  name: player.name,
                  birthDate: toDateInputValue(player.birthDate),
                  category: isPlayerCategory(player.category)
                    ? player.category
                    : PLAYER_CATEGORIES[1],
                  neighborhood: player.neighborhood,
                  guardianName: player.guardianName,
                  guardianPhone: player.guardianPhone,
                  guardianConsent: player.guardianConsent,
                }
              : undefined
          }
          submitLabel={isEditing ? "Salvar alterações" : "Cadastrar jogador"}
          saving={saving}
          error={mutationError}
          onSubmit={handleSubmit}
          onCancel={handleBack}
        />
      )}
    </section>
  );
}
