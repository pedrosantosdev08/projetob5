import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MapPin,
  Pencil,
  Phone,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
} from "../../components";
import { calculateAge, formatDate } from "../../lib/dates";
import { PlayerAttendanceSection } from "./PlayerAttendanceSection";
import { usePlayer } from "./usePlayer";
import { usePlayerMutations } from "./usePlayerMutations";

export default function PlayerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { player, loading, error, reload } = usePlayer(id);
  const { toggleStatus, togglingStatus, mutationError, clearError } =
    usePlayerMutations();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const openConfirmModal = () => {
    clearError();
    setConfirmOpen(true);
  };

  const closeConfirmModal = () => {
    if (togglingStatus) return;
    setConfirmOpen(false);
  };

  const handleToggleStatus = async () => {
    if (!player) return;
    const nextStatus = player.status === "active" ? "inactive" : "active";
    try {
      await toggleStatus(player.id, nextStatus);
      setConfirmOpen(false);
      await reload();
    } catch {
      // Erro já exibido no modal via mutationError.
    }
  };

  if (loading) {
    return <LoadingState message="Carregando perfil do jogador..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  if (!player) {
    return (
      <EmptyState
        title="Jogador não encontrado"
        description="O cadastro solicitado não existe ou não está disponível."
        action={
          <Button onClick={() => navigate("/jogadores")}>
            Voltar para jogadores
          </Button>
        }
      />
    );
  }

  const age = calculateAge(player.birthDate);
  const isActive = player.status === "active";
  const phoneDigits = player.guardianPhone.replace(/\D/g, "");

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/jogadores"
            aria-label="Voltar para lista de jogadores"
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="truncate text-xl font-bold text-slate-900">
            Perfil do jogador
          </h1>
        </div>

        <Link
          to={`/jogadores/${player.id}/editar`}
          className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
          <span>Editar</span>
        </Link>
      </header>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{player.name}</h2>
            <p className="mt-0.5 text-sm text-slate-600">
              {age} {age === 1 ? "ano" : "anos"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {player.category}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-slate-100 text-slate-700"
                  : "bg-amber-100 text-amber-900"
              }`}
            >
              {isActive ? "Ativo" : "Inativo"}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-3 border-t border-slate-100 pt-3 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2.5 text-slate-700">
            <Calendar className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-xs text-slate-500">Nascimento</dt>
              <dd className="font-medium text-slate-900">
                {formatDate(player.birthDate)}
              </dd>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-slate-700">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="text-xs text-slate-500">Bairro</dt>
              <dd className="font-medium text-slate-900">
                {player.neighborhood}
              </dd>
            </div>
          </div>
        </dl>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-900">Responsável</h3>

        <div className="space-y-2 text-sm">
          <p className="font-medium text-slate-800">{player.guardianName}</p>

          {phoneDigits ? (
            <a
              href={`tel:${phoneDigits}`}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-100 px-3.5 py-2 font-medium text-emerald-800 hover:bg-emerald-50"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span>{player.guardianPhone}</span>
            </a>
          ) : (
            <p className="text-slate-600">{player.guardianPhone}</p>
          )}

          <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
            <CheckCircle2
              className={`h-4 w-4 shrink-0 ${
                player.guardianConsent ? "text-emerald-700" : "text-slate-400"
              }`}
              aria-hidden="true"
            />
            <span>
              {player.guardianConsent
                ? "Consentimento do responsável registrado."
                : "Consentimento pendente."}
            </span>
          </div>
        </div>
      </Card>

      <PlayerAttendanceSection playerId={player.id} />

      <div className="pt-1">
        <Button
          variant={isActive ? "secondary" : "primary"}
          onClick={openConfirmModal}
          className="w-full"
        >
          {isActive ? (
            <>
              <UserX className="h-4 w-4" aria-hidden="true" />
              <span>Inativar jogador</span>
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              <span>Reativar jogador</span>
            </>
          )}
        </Button>
      </div>

      <Modal
        open={confirmOpen}
        onClose={closeConfirmModal}
        title={isActive ? "Inativar jogador?" : "Reativar jogador?"}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {isActive
              ? `${player.name} deixará de aparecer nas novas chamadas e novos empréstimos, mas todo o histórico será preservado.`
              : `${player.name} voltará a aparecer normalmente nas chamadas e empréstimos.`}
          </p>

          {mutationError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{mutationError}</span>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              onClick={closeConfirmModal}
              disabled={togglingStatus}
            >
              Cancelar
            </Button>
            <Button
              variant={isActive ? "danger" : "primary"}
              loading={togglingStatus}
              onClick={handleToggleStatus}
            >
              {togglingStatus
                ? "Atualizando..."
                : isActive
                  ? "Confirmar inativação"
                  : "Confirmar reativação"}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
