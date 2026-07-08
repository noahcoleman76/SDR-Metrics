import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { InlineField } from "../components/InlineField";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { useCollection } from "../hooks/useCollection";
import { api, body } from "../services/api";
import type { IcmStatus, Opportunity, OpportunityStatus } from "../types/models";
import { formatDisplayDate, inCurrentPeriod, toDateInput, type Period } from "../utils/dates";
import { icmLabels, opportunityStatusLabels } from "../utils/labels";
import { externalHref } from "../utils/links";

const statuses: OpportunityStatus[] = ["STAGE_0", "STAGE_1_PENDING", "CLEAN", "DUPLICATE"];
const icmStatuses: IcmStatus[] = ["PENDING", "YES", "NO"];

const emptyForm = { accountName: "", opportunityNumber: "", link: "", createdDate: "", approvedDate: "", accountExecutive: "", status: "STAGE_1_PENDING" as OpportunityStatus, inIcm: "PENDING" as IcmStatus };

export default function OpportunitiesPage() {
  const { items, setItems, loading, error } = useCollection<Opportunity>("/opportunities", "opportunities");
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState("");
  const [period, setPeriod] = useState<Period>("month");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = filter.toLowerCase();
    return items.filter((item) => [item.accountName, item.accountExecutive, opportunityStatusLabels[item.status], icmLabels[item.inIcm], toDateInput(item.createdDate), toDateInput(item.approvedDate)].some((value) => (value ?? "").toLowerCase().includes(q)));
  }, [filter, items]);

  const metrics = useMemo(() => {
    const approvedThisMonth = items.filter((item) => inCurrentPeriod(item.approvedDate, "month"));
    const approvedThisYear = items.filter((item) => inCurrentPeriod(item.approvedDate, "year"));
    return {
      cleanMonth: approvedThisMonth.filter((item) => item.status === "CLEAN").length,
      cleanYear: approvedThisYear.filter((item) => item.status === "CLEAN").length,
      totalMonth: approvedThisMonth.length,
      totalYear: approvedThisYear.length
    };
  }, [items]);

  async function add() {
    if (!form.accountName.trim()) {
      setMessage("Account name is required");
      return;
    }
    try {
      const data = await api<{ opportunity: Opportunity }>("/opportunities", { method: "POST", ...body(form) });
      setItems((current) => [data.opportunity, ...current]);
      setForm(emptyForm);
      setMessage("");
      setModalOpen(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not add opportunity");
    }
  }

  async function update(id: string, patch: Partial<Opportunity>) {
    const data = await api<{ opportunity: Opportunity }>(`/opportunities/${id}`, { method: "PATCH", ...body(patch) });
    setItems((current) => current.map((item) => (item.id === id ? data.opportunity : item)));
  }

  async function remove() {
    if (!deleteId) return;
    await api<void>(`/opportunities/${deleteId}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <>
      <PageHeader
        title="Opportunities"
        description="Approved-date based payout tracking."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <PeriodToggle value={period} onChange={setPeriod} />
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add opportunity</Button>
          </div>
        }
      />
      <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Clean opportunities this month" value={metrics.cleanMonth} />
        <Metric label="Clean opportunities this year" value={metrics.cleanYear} />
        <Metric label="Total approved this month" value={metrics.totalMonth} />
        <Metric label="Total approved this year" value={metrics.totalYear} />
      </div>
      <section className="min-w-0">
        {message ? <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{message}</p> : null}
        <input className="focus-ring mb-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter by account, AE, status, ICM, or dates" />
        {loading ? <p className="text-sm text-slate-500">Loading opportunities...</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="max-h-[calc(100vh-22rem)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-[1050px] w-full text-left text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>{["Account", "Opp #", "Link", "Created", "Approved", "AE", "Status", "ICM", ""].map((h) => <th key={h} className="px-3 py-3 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.filter((item) => period ? inCurrentPeriod(item.approvedDate, period) || !item.approvedDate : true).map((item) => (
                <tr key={item.id} className="align-top">
                  <td className="px-2 py-2"><InlineField value={item.accountName} required onSave={(v) => update(item.id, { accountName: v } as Partial<Opportunity>)} /></td>
                  <td className="px-2 py-2"><InlineField value={item.opportunityNumber ?? ""} onSave={(v) => update(item.id, { opportunityNumber: v || null } as Partial<Opportunity>)} /></td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <InlineField value={item.link ?? ""} onSave={(v) => update(item.id, { link: v || null } as Partial<Opportunity>)} />
                      {item.link ? <a className="shrink-0 text-slate-400 hover:text-sky-600" href={externalHref(item.link)} target="_blank" rel="noreferrer" title="Open link"><ExternalLink size={16} /></a> : null}
                    </div>
                  </td>
                  <td className="px-2 py-2"><DateEdit value={item.createdDate} onSave={(v) => update(item.id, { createdDate: v } as Partial<Opportunity>)} /></td>
                  <td className="px-2 py-2"><DateEdit value={item.approvedDate} onSave={(v) => update(item.id, { approvedDate: v } as Partial<Opportunity>)} /></td>
                  <td className="px-2 py-2"><InlineField value={item.accountExecutive ?? ""} onSave={(v) => update(item.id, { accountExecutive: v || null } as Partial<Opportunity>)} /></td>
                  <td className="px-2 py-2"><Select value={item.status} values={statuses} labels={opportunityStatusLabels} onChange={(v) => update(item.id, { status: v as OpportunityStatus } as Partial<Opportunity>)} /></td>
                  <td className="px-2 py-2"><Select value={item.inIcm} values={icmStatuses} labels={icmLabels} onChange={(v) => update(item.id, { inIcm: v as IcmStatus } as Partial<Opportunity>)} /></td>
                  <td className="px-3 py-3"><button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(item.id)} title="Delete"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <Modal open={modalOpen} title="Add opportunity" onClose={() => setModalOpen(false)}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Account name" value={form.accountName} onChange={(v) => setForm({ ...form, accountName: v })} />
          <Input placeholder="Opportunity number" value={form.opportunityNumber} onChange={(v) => setForm({ ...form, opportunityNumber: v })} />
          <Input placeholder="Link" value={form.link} onChange={(v) => setForm({ ...form, link: v })} />
          <Input type="date" value={form.createdDate} onChange={(v) => setForm({ ...form, createdDate: v })} />
          <Input type="date" value={form.approvedDate} onChange={(v) => setForm({ ...form, approvedDate: v })} />
          <Input placeholder="Account Executive" value={form.accountExecutive} onChange={(v) => setForm({ ...form, accountExecutive: v })} />
          <select className="focus-ring h-10 rounded-lg border border-slate-200 px-2 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as OpportunityStatus })}>{statuses.map((s) => <option key={s} value={s}>{opportunityStatusLabels[s]}</option>)}</select>
          <select className="focus-ring h-10 rounded-lg border border-slate-200 px-2 text-sm" value={form.inIcm} onChange={(event) => setForm({ ...form, inIcm: event.target.value as IcmStatus })}>{icmStatuses.map((s) => <option key={s} value={s}>{icmLabels[s]}</option>)}</select>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={add}>Add opportunity</Button>
        </div>
      </Modal>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete opportunity" description="This permanently deletes the opportunity." onCancel={() => setDeleteId(null)} onConfirm={() => void remove()} />
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="text-3xl font-semibold text-slate-950">{value}</div><div className="mt-1 text-xs text-slate-500">{label}</div></div>;
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <input className="focus-ring h-10 rounded-lg border border-slate-200 px-3 text-sm" value={value} type={type} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

function DateEdit({ value, onSave }: { value: string | null; onSave: (value: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return <input className="focus-ring h-8 rounded-md border border-transparent bg-transparent px-2 text-sm hover:bg-slate-50" type="date" value={toDateInput(value)} onChange={(event) => onSave(event.target.value || null)} onBlur={() => setEditing(false)} autoFocus />;
  }
  return <button className="focus-ring min-h-8 rounded-md px-2 text-left text-sm text-slate-700 hover:bg-slate-50" type="button" onClick={() => setEditing(true)}>{formatDisplayDate(value) || "Set date"}</button>;
}

function Select<T extends string>({ value, values, labels, onChange }: { value: T; values: T[]; labels: Record<T, string>; onChange: (value: T) => void }) {
  return <select className="focus-ring h-8 rounded-md border border-transparent bg-transparent px-2 text-sm hover:bg-slate-50" value={value} onChange={(event) => onChange(event.target.value as T)}>{values.map((v) => <option key={v} value={v}>{labels[v]}</option>)}</select>;
}

function PeriodToggle({ value, onChange }: { value: Period; onChange: (period: Period) => void }) {
  return <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">{(["month", "quarter", "year"] as Period[]).map((p) => <button key={p} className={`rounded-md px-3 py-1.5 text-sm capitalize ${value === p ? "bg-slate-950 text-white" : "text-slate-500"}`} onClick={() => onChange(p)}>{p}</button>)}</div>;
}
