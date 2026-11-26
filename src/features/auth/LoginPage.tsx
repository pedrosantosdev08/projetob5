import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router-dom";
import { AlertCircle, Shield } from "lucide-react";
import { Button, Card, Input, LoadingState } from "../../components";
import { zodResolver } from "../../lib/zodResolver";
import { loginSchema, type LoginFormValues } from "./authSchema";
import { useAuth } from "./useAuth";

interface LocationState {
  from?: { pathname?: string };
}

export default function LoginPage() {
  const { coach, loading, authError, signIn, clearAuthError } = useAuth();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4">
        <LoadingState message="Verificando sessão..." />
      </div>
    );
  }

  if (coach) {
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    clearAuthError();
    try {
      await signIn(values.email, values.password);
    } catch {
      // A mensagem de erro já é exposta via authError no contexto.
    }
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-slate-50 px-4 py-8">
      <div className="mx-auto w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-sm">
            <Shield className="h-7 w-7" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-bold text-slate-900">Smart Sports</h1>
          <p className="mt-1 text-sm text-slate-600">
            Projeto B5 · Acesso exclusivo do treinador
          </p>
        </div>

        <Card className="p-5">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {authError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{authError}</span>
              </div>
            )}

            <Input
              label="E-mail"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="treinador@projetob5.org"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Senha"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
