import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "../../components";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
  const { coach, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4">
        <LoadingState message="Verificando acesso..." />
      </div>
    );
  }

  if (!coach) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
