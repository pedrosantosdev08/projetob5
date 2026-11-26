import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import {
  ArrowLeftRight,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Shield,
  Users,
} from "lucide-react";
import { useAuth } from "../features/auth";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/jogadores", label: "Jogadores", icon: Users, end: false },
  { to: "/treinos", label: "Treinos", icon: ClipboardCheck, end: false },
  { to: "/materiais", label: "Materiais", icon: Package, end: false },
  { to: "/emprestimos", label: "Empréstimos", icon: ArrowLeftRight, end: false },
] as const;

export function AppLayout() {
  const { coach, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const handleSignOut = async () => {
    setLogoutError(null);
    setSigningOut(true);
    try {
      await signOut();
    } catch {
      setLogoutError("Não foi possível sair. Tente novamente.");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-xs">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-bold text-slate-900">Smart Sports</p>
              <p className="truncate text-xs text-slate-500">
                {coach?.name ?? "Projeto B5"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/relatorios"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              title="Relatórios de Participação"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Relatórios</span>
            </Link>

            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              aria-label="Sair da conta"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>{signingOut ? "Saindo..." : "Sair"}</span>
            </button>
          </div>
        </div>
        {logoutError && (
          <p
            role="alert"
            className="border-t border-rose-200 bg-rose-50 px-4 py-1.5 text-center text-xs font-medium text-rose-700"
          >
            {logoutError}
          </p>
        )}
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pt-4 pb-24">
        <Outlet />
      </main>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xs"
      >
        <ul className="mx-auto grid max-w-2xl grid-cols-5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] font-medium transition-colors ${
                    isActive
                      ? "text-emerald-700"
                      : "text-slate-500 hover:text-slate-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
                        isActive ? "bg-emerald-50 text-emerald-700" : ""
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="truncate">{label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
