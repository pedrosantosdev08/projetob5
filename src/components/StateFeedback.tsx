import type { ReactNode } from "react";
import { AlertCircle, Inbox } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Carregando..." }: LoadingStateProps) {
  return (
    <div role="status" aria-live="polite" className="space-y-3 py-2">
      <span className="sr-only">{message}</span>
      <div className="h-20 animate-pulse rounded-2xl bg-slate-200/80" />
      <div className="h-20 animate-pulse rounded-2xl bg-slate-200/60" />
      <div className="h-20 animate-pulse rounded-2xl bg-slate-200/40" />
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden="true" />}
      </div>
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 max-w-xs text-sm text-slate-600">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </Card>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Não foi possível carregar os dados. Tente novamente.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card role="alert" className="border-rose-200 bg-rose-50/70 text-center">
      <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-full bg-rose-100 text-rose-700">
        <AlertCircle className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-rose-900">{message}</p>
      {onRetry && (
        <div className="mt-3">
          <Button variant="secondary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      )}
    </Card>
  );
}
