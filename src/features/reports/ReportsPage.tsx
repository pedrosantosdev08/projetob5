import { useCallback, useEffect, useState } from "react";
import { Download, FileText, Filter, Printer } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components";
import { PLAYER_CATEGORIES } from "../../lib/constants";
import {
  generatePlayersReportCsv,
  getPlayersParticipationReport,
} from "./reportService";
import type { PlayerReportItem, ReportFilter } from "./reportTypes";

export default function ReportsPage() {
  const [filter, setFilter] = useState<ReportFilter>({
    category: "all",
    status: "active",
    period: "all",
  });

  const [items, setItems] = useState<PlayerReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlayersParticipationReport(filter);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    if (items.length === 0) return;
    const csvContent = generatePlayersReportCsv(items);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.setAttribute(
      "download",
      `relatorio_frequencia_${filter.category}_${dateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalPlayers = items.length;
  const overallPresenceRate =
    totalPlayers > 0
      ? Math.round(
          items.reduce((acc, i) => acc + i.attendancePercentage, 0) /
            totalPlayers
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página (Visível em tela e na impressão) */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="print:hidden rounded-lg bg-emerald-100 p-2 text-emerald-800">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Relatório de Participação
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-600 print:text-xs">
            Histórico e percentual de frequência dos atletas por categoria e período.
          </p>
        </div>

        {/* Botões de Ação (Ocultos na impressão) */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Button
            variant="ghost"
            onClick={handleExportCsv}
            disabled={loading || items.length === 0}
            className="text-xs"
          >
            <Download className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Exportar CSV
          </Button>
          <Button
            onClick={handlePrint}
            disabled={loading || items.length === 0}
            className="text-xs"
          >
            <Printer className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Imprimir
          </Button>
        </div>
      </header>

      {/* Painel de Filtros (Oculto na impressão) */}
      <Card className="p-4 print:hidden">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
          <Filter className="h-4 w-4 text-slate-500" aria-hidden="true" />
          Filtros de Consulta
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Categoria */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Categoria
            </label>
            <select
              value={filter.category}
              onChange={(e) =>
                setFilter((f) => ({ ...f, category: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todas as categorias</option>
              {PLAYER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Status do Atleta
            </label>
            <select
              value={filter.status}
              onChange={(e) =>
                setFilter((f) => ({
                  ...f,
                  status: e.target.value as ReportFilter["status"],
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="active">Somente Ativos</option>
              <option value="inactive">Somente Inativos</option>
              <option value="all">Todos</option>
            </select>
          </div>

          {/* Período */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Período de Análise
            </label>
            <select
              value={filter.period}
              onChange={(e) =>
                setFilter((f) => ({
                  ...f,
                  period: e.target.value as ReportFilter["period"],
                }))
              }
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todo o histórico</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="90d">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Resumo no Relatório (Visível também na Impressão) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 print:grid-cols-4 print:gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 print:border-slate-300">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Total de Atletas
          </span>
          <div className="mt-1 text-xl font-bold text-slate-900">
            {totalPlayers}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 print:border-slate-300">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Frequência Média
          </span>
          <div className="mt-1 text-xl font-bold text-emerald-700">
            {overallPresenceRate}%
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 print:border-slate-300">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Filtro Categoria
          </span>
          <div className="mt-1 text-sm font-semibold text-slate-900 truncate">
            {filter.category === "all" ? "Todas" : filter.category}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 print:border-slate-300">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
            Período
          </span>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {filter.period === "all"
              ? "Histórico Geral"
              : filter.period === "30d"
              ? "Últimos 30 dias"
              : "Últimos 90 dias"}
          </div>
        </div>
      </div>

      {/* Estados de Carregamento e Erro */}
      {loading && (
        <div className="print:hidden">
          <LoadingState message="Gerando relatório de participação..." />
        </div>
      )}

      {!loading && error && (
        <div className="print:hidden">
          <ErrorState message={error} onRetry={() => void loadData()} />
        </div>
      )}

      {/* Tabela de Resultados */}
      {!loading && !error && items.length === 0 && (
        <EmptyState
          icon={<FileText className="h-6 w-6" aria-hidden="true" />}
          title="Nenhum registro encontrado"
          description="Nenhum jogador corresponde aos filtros selecionados."
        />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs print:border print:border-slate-300 print:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 print:text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 print:bg-slate-100">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Atleta
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Categoria
                  </th>
                  <th scope="col" className="px-3 py-3 text-center">
                    Treinos
                  </th>
                  <th scope="col" className="px-3 py-3 text-center text-emerald-700">
                    Presenças
                  </th>
                  <th scope="col" className="px-3 py-3 text-center text-rose-700">
                    Faltas
                  </th>
                  <th scope="col" className="px-4 py-3 text-right">
                    % Frequência
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((player) => {
                  const isHigh = player.attendancePercentage >= 75;
                  const isLow = player.attendancePercentage < 50;

                  return (
                    <tr
                      key={player.id}
                      className="hover:bg-slate-50/75 print:hover:bg-transparent"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {player.name}
                        {player.status === "inactive" && (
                          <span className="ml-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500 print:border">
                            Inativo
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {player.category}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {player.totalTrainings}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-emerald-700">
                        {player.presentCount}
                      </td>
                      <td className="px-3 py-3 text-center font-semibold text-rose-700">
                        {player.absenceCount}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-block font-bold ${
                            isHigh
                              ? "text-emerald-700"
                              : isLow
                              ? "text-rose-600"
                              : "text-amber-700"
                          }`}
                        >
                          {player.attendancePercentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="hidden border-t border-slate-200 bg-slate-50 p-3 text-right text-[11px] text-slate-500 print:block">
            Projeto Social B5 — Relatório gerado em{" "}
            {new Date().toLocaleDateString("pt-BR")} às{" "}
            {new Date().toLocaleTimeString("pt-BR")}
          </div>
        </div>
      )}
    </div>
  );
}
