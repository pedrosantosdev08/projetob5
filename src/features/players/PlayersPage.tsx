import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Plus, Search, Users, X } from "lucide-react";
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components";
import { PLAYER_CATEGORIES } from "../../lib/constants";
import { calculateAge } from "../../lib/dates";
import type { EntityStatus } from "../../types";
import { usePlayers } from "./usePlayers";

export default function PlayersPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<EntityStatus>("active");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const {
    players,
    loading,
    loadingMore,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    reload,
  } = usePlayers({ status, category, search });

  const hasActiveFilters =
    status !== "active" || category !== "all" || search.trim().length > 0;

  const clearFilters = () => {
    setStatus("active");
    setCategory("all");
    setSearch("");
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jogadores</h1>
          <p className="text-sm text-slate-600">
            Cadastro, busca e acompanhamento por categoria.
          </p>
        </div>
        <Button onClick={() => navigate("/jogadores/novo")}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Novo</span>
        </Button>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou bairro..."
            aria-label="Buscar jogador por nome ou bairro"
            className="min-h-[44px] w-full rounded-xl border border-slate-300 bg-white py-2.5 pr-11 pl-10 text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-700 focus:outline-2 focus:outline-offset-1 focus:outline-emerald-700"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Limpar busca"
              className="absolute top-1/2 right-1 inline-flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(["active", "inactive"] as const).map((statusOption) => {
            const selected = status === statusOption;
            return (
              <button
                key={statusOption}
                type="button"
                onClick={() => setStatus(statusOption)}
                className={`min-h-[44px] flex-1 rounded-xl px-3 text-sm font-semibold transition-colors ${
                  selected
                    ? "bg-emerald-700 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {statusOption === "active" ? "Ativos" : "Inativos"}
              </button>
            );
          })}
        </div>

        <div
          role="group"
          aria-label="Filtrar por categoria"
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
      </div>

      {loading ? (
        <LoadingState message="Carregando jogadores..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : players.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" aria-hidden="true" />}
          title={
            hasActiveFilters
              ? "Nenhum jogador encontrado"
              : "Nenhum jogador cadastrado"
          }
          description={
            hasActiveFilters
              ? "Tente ajustar a busca ou os filtros selecionados."
              : "Cadastre o primeiro atleta do Projeto B5 para começar a fazer chamadas."
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Limpar filtros
              </Button>
            ) : (
              <Button onClick={() => navigate("/jogadores/novo")}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>Cadastrar jogador</span>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500">
            {players.length}{" "}
            {players.length === 1 ? "jogador exibido" : "jogadores exibidos"}
          </p>

          <ul className="space-y-2.5">
            {players.map((player) => {
              const age = calculateAge(player.birthDate);
              return (
                <li key={player.id}>
                  <Link to={`/jogadores/${player.id}`} className="block">
                    <Card className="flex min-h-[64px] items-center justify-between gap-3 transition-colors hover:border-emerald-300 hover:bg-emerald-50/20">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-base font-semibold text-slate-900">
                            {player.name}
                          </span>
                          {player.status === "inactive" && (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900">
                              Inativo
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-slate-600">
                          {age} {age === 1 ? "ano" : "anos"} · {player.category} ·{" "}
                          {player.neighborhood}
                        </p>
                      </div>
                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-slate-400"
                        aria-hidden="true"
                      />
                    </Card>
                  </Link>
                </li>
              );
            })}
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
    </section>
  );
}
