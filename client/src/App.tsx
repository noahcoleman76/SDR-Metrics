import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";

const TasksPage = lazy(() => import("./pages/TasksPage"));
const AccountsPage = lazy(() => import("./pages/AccountsPage"));
const OpportunitiesPage = lazy(() => import("./pages/OpportunitiesPage"));
const Stage0Page = lazy(() => import("./pages/Stage0Page"));
const ArrActualsPage = lazy(() => import("./pages/ArrActualsPage"));

function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-sm text-slate-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route element={<Protected />}>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/accounts" element={<AccountsPage />} />
          <Route path="/opportunities" element={<OpportunitiesPage />} />
          <Route path="/stage-0" element={<Stage0Page />} />
          <Route path="/arr-actuals" element={<ArrActualsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </Suspense>
  );
}
