import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeftRight,
  ChevronRight,
  Clock,
  Layers,
  Package,
  TrendingUp,
  UserX,
  Users,
} from "lucide-react";
import {
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components";
import { formatDate } from "../../lib/dates";
import { useDashboard } from "./useDashboard";

const CategoryAttendanceChart = lazy(
  () => import("./CategoryAttendanceChart")
);

export default function DashboardPage() {
  const { metrics, loading, error, reload } = useDashboard();

  if (loading) {
    return <LoadingState message="Carregando painel de indicadores..." />;
  }

  if (error || !metrics) {
    return (
      <ErrorState
        message={error || "Não foi possível carregar os dados do painel."}
        onRetry={() => void reload()}
      />
    );
  }

  const {
    activePlayersCount,
    categoryRates,
    overallAttendancePercentage,
    materialsInUseCount,
    openLoansCount,
    alerts,
  } = metrics;

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600">
          Indicadores gerais, frequência dos últimos 30 dias e alertas operacionais.
        </p>
      </header>

      {/* Grid de Cards Principais */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Atletas Ativos */}
        <Link to="/jogadores" className="group block focus:outline-none">
          <Card className="h-full border-slate-200 p-4 transition group-hover:border-sky-300 group-hover:shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Atletas Ativos
              </span>
              <Users className="h-4 w-4 text-sky-600" aria-hidden="true" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {activePlayersCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Cadastrados e ativos</p>
          </Card>
        </Link>

        {/* Frequência Média Geral */}
        <Link to="/treinos" className="group block focus:outline-none">
          <Card className="h-full border-slate-200 p-4 transition group-hover:border-sky-300 group-hover:shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Frequência (30d)
              </span>
              <TrendingUp className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {overallAttendancePercentage}%
            </div>
            <p className="mt-1 text-xs text-slate-500">Média geral recente</p>
          </Card>
        </Link>

        {/* Materiais em Uso */}
        <Link to="/materiais" className="group block focus:outline-none">
          <Card className="h-full border-slate-200 p-4 transition group-hover:border-sky-300 group-hover:shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Materiais em Uso
              </span>
              <Package className="h-4 w-4 text-amber-600" aria-hidden="true" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {materialsInUseCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Unidades emprestadas</p>
          </Card>
        </Link>

        {/* Empréstimos Pendentes */}
        <Link to="/emprestimos" className="group block focus:outline-none">
          <Card className="h-full border-slate-200 p-4 transition group-hover:border-sky-300 group-hover:shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Pendências
              </span>
              <ArrowLeftRight className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="mt-2 text-2xl font-bold text-slate-900">
              {openLoansCount}
            </div>
            <p className="mt-1 text-xs text-slate-500">Empréstimos em aberto</p>
          </Card>
        </Link>
      </div>

      {/* Gráfico de Frequência por Categoria */}
      <Card className="p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Frequência por Categoria (Últimos 30 dias)
            </h2>
            <p className="text-xs text-slate-500">
              Percentual médio de presença nos treinos registrados por categoria.
            </p>
          </div>
          <Layers className="h-5 w-5 text-slate-400" aria-hidden="true" />
        </div>

        <Suspense
          fallback={
            <div className="flex h-64 items-center justify-center text-sm text-slate-400">
              Carregando gráfico...
            </div>
          }
        >
          <CategoryAttendanceChart data={categoryRates} />
        </Suspense>
      </Card>

      {/* Seção de Alertas Operacionais */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-900">
            Alertas e Atenção
          </h2>
          {alerts.length > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
              {alerts.length}
            </span>
          )}
        </div>

        {alerts.length === 0 ? (
          <EmptyState
            title="Nenhum alerta no momento"
            description="Não há registros de atletas com faltas consecutivas ou empréstimos em atraso."
          />
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => {
              if (alert.type === "absence") {
                return (
                  <Link
                    key={`absence-${alert.playerId}`}
                    to={`/jogadores/${alert.playerId}`}
                    className="block focus:outline-none"
                  >
                    <Card className="border-l-4 border-l-red-500 p-3.5 transition hover:bg-slate-50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 rounded-full bg-red-100 p-2 text-red-700">
                            <UserX className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900">
                                {alert.playerName}
                              </span>
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                                {alert.category}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-red-700">
                              Alerta de evasão: <strong>{alert.consecutiveAbsences} faltas consecutivas</strong> nos últimos treinos.
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                      </div>
                    </Card>
                  </Link>
                );
              }

              return (
                <Link
                  key={`loan-${alert.loanId}`}
                  to="/emprestimos"
                  className="block focus:outline-none"
                >
                  <Card className="border-l-4 border-l-amber-500 p-3.5 transition hover:bg-slate-50">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {alert.materialName}
                            </span>
                            <span className="text-xs text-slate-600">
                              com {alert.playerName}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-amber-800">
                            Empréstimo em atraso há <strong>{alert.daysOverdue} dias</strong> (retirado em {formatDate(alert.loanedAt)}).
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
