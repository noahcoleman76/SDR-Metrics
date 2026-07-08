import { useState } from "react";
import { Button } from "../components/Button";
import { PageHeader } from "../components/PageHeader";
import { PasswordField } from "../components/PasswordField";
import { body, api } from "../services/api";

export default function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api<void>("/auth/change-password", { method: "POST", ...body({ currentPassword, newPassword }) });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password changed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" description="Account settings." />
      <form onSubmit={submit} className="max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Change password</h2>
        <div className="mt-4 space-y-4">
          <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" />
          <PasswordField label="New password" value={newPassword} onChange={setNewPassword} autoComplete="new-password" />
          <PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" />
        </div>
        {error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
        {message ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
        <Button className="mt-5" variant="primary" disabled={loading}>{loading ? "Saving..." : "Change password"}</Button>
      </form>
    </>
  );
}
