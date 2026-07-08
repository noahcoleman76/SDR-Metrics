import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/tasks" replace />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-950">SDR Metrics</h1>
        <p className="mt-1 text-sm text-slate-500">{mode === "login" ? "Sign in to your workspace." : "Create your account."}</p>
        <label className="mt-6 block text-sm font-medium text-slate-700">
          Email
          <input className="focus-ring mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input className="focus-ring mt-1 h-10 w-full rounded-lg border border-slate-200 px-3" value={password} onChange={(event) => setPassword(event.target.value)} type="password" minLength={8} required />
        </label>
        {error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        <Button className="mt-5 w-full" variant="primary" disabled={loading}>{loading ? "Working..." : mode === "login" ? "Log in" : "Register"}</Button>
        <button type="button" className="focus-ring mt-4 w-full rounded-lg py-2 text-sm text-slate-500 hover:text-slate-950" onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Need an account? Register" : "Already have an account? Log in"}
        </button>
      </form>
    </div>
  );
}
