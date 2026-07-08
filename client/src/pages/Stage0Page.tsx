import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { InlineField } from "../components/InlineField";
import { PageHeader } from "../components/PageHeader";
import { useCollection } from "../hooks/useCollection";
import { api, body } from "../services/api";
import type { Stage0Record } from "../types/models";
import { toDateInput } from "../utils/dates";

const emptyForm = { accountName: "", opportunityNumber: "", link: "", createdDate: "", accountExecutive: "", nextStep: "" };

export default function Stage0Page() {
  const { items, setItems, loading, error } = useCollection<Stage0Record>("/stage0", "records");
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return items.filter((item) => [item.accountName, item.accountExecutive, item.nextStep, toDateInput(item.createdDate)].some((value) => (value ?? "").toLowerCase().includes(q)));
  }, [filter, items]);

  async function add() {
    if (!form.accountName.trim()) {
      setMessage("Account name is required");
      return;
    }
    try {
      const data = await api<{ record: Stage0Record }>("/stage0", { method: "POST", ...body(form) });
      setItems((current) => [data.record, ...current]);
      setForm(emptyForm);
      setMessage("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not add Stage 0 record");
    }
  }

  async function update(id: string, patch: Partial<Stage0Record>) {
    const data = await api<{ record: Stage0Record }>(`/stage0/${id}`, { method: "PATCH", ...body(patch) });
    setItems((current) => current.map((item) => (item.id === id ? data.record : item)));
  }

  async function move(id: string) {
    await api("/stage0/" + id + "/move", { method: "POST" });
    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("Moved to Opportunities");
  }

  async function remove() {
    if (!deleteId) return;
    await api<void>(`/stage0/${deleteId}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <>
      <PageHeader title="Stage 0" description="Early-stage opportunities before manual promotion." />
      <div className="mb-4 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3 xl:grid-cols-7">
        <Input placeholder="Account name" value={form.accountName} onChange={(v) => setForm({ ...form, accountName: v })} />
        <Input placeholder="Opp #" value={form.opportunityNumber} onChange={(v) => setForm({ ...form, opportunityNumber: v })} />
        <Input placeholder="Link" value={form.link} onChange={(v) => setForm({ ...form, link: v })} />
        <Input type="date" value={form.createdDate} onChange={(v) => setForm({ ...form, createdDate: v })} />
        <Input placeholder="AE" value={form.accountExecutive} onChange={(v) => setForm({ ...form, accountExecutive: v })} />
        <Input placeholder="Next step" value={form.nextStep} onChange={(v) => setForm({ ...form, nextStep: v })} />
        <Button variant="primary" icon={<Plus size={16} />} onClick={add}>Add</Button>
      </div>
      {message ? <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{message}</p> : null}
      <input className="focus-ring mb-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by account, AE, next step, or created date" />
      {loading ? <p className="text-sm text-slate-500">Loading Stage 0 records...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div className="max-h-[calc(100vh-20rem)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[900px] w-full text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>{["Account", "Opp #", "Link", "Created", "AE", "Next step", ""].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item.id} className="align-top">
                <td className="px-2 py-2"><InlineField value={item.accountName} required onSave={(v) => update(item.id, { accountName: v } as Partial<Stage0Record>)} /></td>
                <td className="px-2 py-2"><InlineField value={item.opportunityNumber ?? ""} onSave={(v) => update(item.id, { opportunityNumber: v || null } as Partial<Stage0Record>)} /></td>
                <td className="px-2 py-2"><InlineField value={item.link ?? ""} onSave={(v) => update(item.id, { link: v || null } as Partial<Stage0Record>)} /></td>
                <td className="px-2 py-2"><input className="focus-ring h-8 rounded-md border border-slate-200 px-2 text-sm" type="date" value={toDateInput(item.createdDate)} onChange={(event) => void update(item.id, { createdDate: event.target.value || null } as Partial<Stage0Record>)} /></td>
                <td className="px-2 py-2"><InlineField value={item.accountExecutive ?? ""} onSave={(v) => update(item.id, { accountExecutive: v || null } as Partial<Stage0Record>)} /></td>
                <td className="px-2 py-2"><InlineField value={item.nextStep ?? ""} onSave={(v) => update(item.id, { nextStep: v || null } as Partial<Stage0Record>)} /></td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button className="text-slate-400 hover:text-sky-600" onClick={() => void move(item.id)} title="Move to Opportunities"><ArrowRight size={16} /></button>
                    <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(item.id)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete Stage 0 record" description="This permanently deletes the Stage 0 record." onCancel={() => setDeleteId(null)} onConfirm={() => void remove()} />
    </>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <input className="focus-ring h-10 rounded-lg border border-slate-200 px-3 text-sm" value={value} type={type} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}
