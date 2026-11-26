import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingState } from "../components";
import { ProtectedRoute } from "../features/auth";
import { AppLayout } from "./AppLayout";

const LoginPage = lazy(() => import("../features/auth/LoginPage"));
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
const PlayersPage = lazy(() => import("../features/players/PlayersPage"));
const PlayerFormPage = lazy(() => import("../features/players/PlayerFormPage"));
const PlayerProfilePage = lazy(
  () => import("../features/players/PlayerProfilePage")
);
const TrainingsPage = lazy(() => import("../features/trainings/TrainingsPage"));
const TrainingAttendancePage = lazy(
  () => import("../features/trainings/TrainingAttendancePage")
);
const MaterialsPage = lazy(() => import("../features/materials/MaterialsPage"));
const LoansPage = lazy(() => import("../features/loans/LoansPage"));
const ReportsPage = lazy(() => import("../features/reports/ReportsPage"));

function PageFallback() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <LoadingState message="Carregando página..." />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/jogadores" element={<PlayersPage />} />
            <Route path="/jogadores/novo" element={<PlayerFormPage />} />
            <Route path="/jogadores/:id" element={<PlayerProfilePage />} />
            <Route path="/jogadores/:id/editar" element={<PlayerFormPage />} />
            <Route path="/treinos" element={<TrainingsPage />} />
            <Route
              path="/treinos/:id/chamada"
              element={<TrainingAttendancePage />}
            />
            <Route path="/materiais" element={<MaterialsPage />} />
            <Route path="/emprestimos" element={<LoansPage />} />
            <Route path="/relatorios" element={<ReportsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
