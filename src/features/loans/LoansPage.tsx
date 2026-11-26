import { useState } from "react";
import { AlertTriangle, ArrowLeftRight, Plus, Undo2 } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
} from "../../components";
import { formatDate, formatDateTime } from "../../lib/dates";
import { LOAN_ALERT_DAYS } from "../../lib/constants";
import { LoanFormModal } from "./LoanFormModal";
import type { LoanFormValues } from "./loanSchema";
import type { Loan } from "./loanTypes";
import { isLoanOverdue } from "./loanService";
import { useLoans } from "./useLoans";
import { useLoanMutations } from "./useLoanMutations";

export default function LoansPage() {
  const { loans, loading, loadingMore, error, hasMore, fetchMore, refresh } =
    useLoans();

  const { addLoan, devolver, loading: mutating, error: mutError, clearError } =
    useLoanMutations(refresh);

  const [formOpen, setFormOpen] = useState(false);
  const [confirmLoan, setConfirmLoan] = useState<Loan | null>(null);

  const openForm = () => {
    clearError();
    setFormOpen(true);
  };

  const closeForm = () => {
    if (mutating) return;
    setFormOpen(false);
  };

  const handleSubmit = async (
    values: LoanFormValues,
    materialName: string,
    playerName: string
  ) => {
    const ok = await addLoan({
      ...values,
      materialName,
      playerName,
    });
    if (ok) setFormOpen(false);
  };

  const handleReturn = async () => {
    if (!confirmLoan) return;
    const ok = await devolver(confirmLoan.id);
    if (ok) setConfirmLoan(null);
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Empréstimos</h1>
          <p className="text-sm text-slate-600">
            Materiais em aberto e devoluções. Alertas após {LOAN_ALERT_DAYS}{" "}
            dias.
          </p>
        </div>
        <Button onClick={openForm} className="shrink-0">
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Novo empréstimo</span>
        </Button>
      </header>

      {/* Estados de carregamento / erro */}
      {loading && <LoadingState message="Carregando empréstimos…" />}
      {!loading && error && (
        <ErrorState message={error} onRetry={refresh} />
      )}

      {/* Lista */}
      {!loading && !error && loans.length === 0 && (
        <EmptyState
          icon={<ArrowLeftRight className="h-6 w-6" aria-hidden="true" />}
          title="Nenhum empréstimo em aberto"
          description="Registre empréstimos de materiais para os jogadores e acompanhe as devoluções."
        />
      )}

      {!loading && loans.length > 0 && (
        <ul className="space-y-3">
          {loans.map((loan) => {
            const overdue = isLoanOverdue(loan);
            return (
              <li key={loan.id}>
                <Card
                  className={
                    overdue ? "border-red-300 bg-red-50" : undefined
                  }
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Info principal */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {loan.materialName}
                        </span>
                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
                          Qtd: {loan.quantity}
                        </span>
                        {overdue && (
                          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                            Em atraso
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-slate-700">
                        Jogador:{" "}
                        <span className="font-medium">{loan.playerName}</span>
                      </p>
                      <p className="text-xs text-slate-500">
                        Emprestado em {formatDateTime(loan.loanedAt)}
                      </p>
                      {loan.notes && (
                        <p className="mt-1 text-xs text-slate-500 italic">
                          {loan.notes}
                        </p>
                      )}
                    </div>

                    {/* Botão devolver */}
                    <Button
                      variant="ghost"
                      className="shrink-0 min-h-[44px] min-w-[44px] text-slate-600 hover:text-green-700"
                      onClick={() => {
                        clearError();
                        setConfirmLoan(loan);
                      }}
                      title="Registrar devolução"
                    >
                      <Undo2 className="h-5 w-5" aria-hidden="true" />
                      <span className="sr-only">Devolver</span>
                    </Button>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {/* Carregar mais */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <Button variant="ghost" onClick={() => void fetchMore()} loading={loadingMore}>
            Carregar mais
          </Button>
        </div>
      )}

      {/* Modal novo empréstimo */}
      <LoanFormModal
        open={formOpen}
        saving={mutating}
        error={mutError}
        onClose={closeForm}
        onSubmit={(values, materialName, playerName) => {
          void handleSubmit(values, materialName, playerName);
        }}
      />

      {/* Modal confirmar devolução */}
      <Modal
        open={confirmLoan !== null}
        onClose={() => {
          if (!mutating) setConfirmLoan(null);
        }}
        title="Confirmar devolução"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmLoan(null)}
              disabled={mutating}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => void handleReturn()}
              loading={mutating}
              className="bg-green-600 hover:bg-green-700 focus-visible:ring-green-600"
            >
              Confirmar devolução
            </Button>
          </div>
        }
      >
        {mutError && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {mutError}
          </p>
        )}
        {confirmLoan && (
          <div className="space-y-1 text-sm text-slate-700">
            <p>
              <span className="font-medium">Material:</span>{" "}
              {confirmLoan.materialName}
            </p>
            <p>
              <span className="font-medium">Jogador:</span>{" "}
              {confirmLoan.playerName}
            </p>
            <p>
              <span className="font-medium">Quantidade:</span>{" "}
              {confirmLoan.quantity}
            </p>
            <p>
              <span className="font-medium">Emprestado em:</span>{" "}
              {formatDate(confirmLoan.loanedAt)}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
