import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/Button";
import { ColumnFilter, type FilterOption } from "../components/ColumnFilter";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { InlineField } from "../components/InlineField";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { UploadButton } from "../components/UploadButton";
import { useCollection } from "../hooks/useCollection";
import { api, body } from "../services/api";
import type { Stage0Record } from "../types/models";
import { formatDisplayDate, toDateInput } from "../utils/dates";
import { dateValueFor, readSpreadsheet, valueFor } from "../utils/importSpreadsheet";
import { externalHref } from "../utils/links";

const emptyForm = { accountName: "", opportunityNumber: "", link: "", createdDate: "", accountExecutive: "", nextStep: "" };
const blankValue = "__blank__";
type Stage0FilterKey = "accountName" | "opportunityNumber" | "link" | "createdDate" | "accountExecutive" | "nextStep";
type Stage0Filters = Record<Stage0FilterKey, string[]>;
const emptyFilters: Stage0Filters = { accountName: [], opportunityNumber: [], link: [], createdDate: [], accountExecutive: [], nextStep: [] };

export default function Stage0Page() {
  const { items, setItems, loading, error } = useCollection<Stage0Record>("/stage0", "records");
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState<Stage0Filters>(emptyFilters);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [expandedNextStepId, setExpandedNextStepId] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function clearSelection(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest("[data-next-step-editor='true']")) return;
      if (!tableRef.current?.contains(target)) {
        setSelectedRowId(null);
        setExpandedNextStepId(null);
      }
    }
    document.addEventListener("click", clearSelection);
    return () => document.removeEventListener("click", clearSelection);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      return (Object.keys(filters) as Stage0FilterKey[]).every((key) => {
        const selected = filters[key];
        return selected.length === 0 || selected.includes(stage0FilterValue(item, key));
      });
    });
  }, [filters, items]);

  const filterOptions = useMemo(() => {
    return {
      accountName: optionsFrom(items, (item) => textFilterValue(item.accountName)),
      opportunityNumber: optionsFrom(items, (item) => textFilterValue(item.opportunityNumber)),
      link: optionsFrom(items, (item) => textFilterValue(item.link)),
      createdDate: optionsFrom(items, (item) => dateFilterValue(item.createdDate), (value) => (value === blankValue ? "Blank" : formatDisplayDate(value))),
      accountExecutive: optionsFrom(items, (item) => textFilterValue(item.accountExecutive)),
      nextStep: optionsFrom(items, (item) => textFilterValue(item.nextStep))
    } satisfies Record<Stage0FilterKey, FilterOption[]>;
  }, [items]);

  function setColumnFilter(key: Stage0FilterKey, values: string[]) {
    setFilters((current) => ({ ...current, [key]: values }));
  }

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
      setModalOpen(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not add Stage 0 record");
    }
  }

  async function upload(file: File) {
    try {
      const rows = await readSpreadsheet(file);
      const payloads = rows
        .map((row) => ({
          accountName: valueFor(row, ["Account name", "Account"]),
          opportunityNumber: valueFor(row, ["Opportunity number", "Opp #", "Opp number"]),
          link: valueFor(row, ["Link"]),
          createdDate: dateValueFor(row, ["Created date", "Created"]),
          accountExecutive: valueFor(row, ["Account Executive", "AE"]),
          nextStep: valueFor(row, ["Next step"])
        }))
        .filter((row) => row.accountName.trim());
      if (!payloads.length) {
        setMessage("No rows with account names were found");
        return;
      }
      const created: Stage0Record[] = [];
      for (let index = 0; index < payloads.length; index += 1) {
        try {
          const data = await api<{ record: Stage0Record }>("/stage0", { method: "POST", ...body(payloads[index]) });
          created.push(data.record);
        } catch (err) {
          throw new Error(`Row ${index + 2}: ${err instanceof Error ? err.message : "Could not import row"}`);
        }
      }
      setItems((current) => [...created, ...current]);
      setFilters(emptyFilters);
      setMessage(`Uploaded ${created.length} Stage 0 opportunities`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not upload Stage 0 opportunities");
    }
  }

  async function update(id: string, patch: Partial<Stage0Record>) {
    const data = await api<{ record: Stage0Record }>(`/stage0/${id}`, { method: "PATCH", ...body(patch) });
    setItems((current) => current.map((item) => (item.id === id ? data.record : item)));
  }

  async function move(id: string) {
    const record = items.find((item) => item.id === id);
    if (!record?.createdDate) {
      setMessage("Created date is required before converting to Stage 1");
      return;
    }
    try {
      await api("/stage0/" + id + "/move", { method: "POST" });
      setItems((current) => current.filter((item) => item.id !== id));
      setMessage("Moved to Opportunities");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not convert opportunity");
    }
  }

  async function remove() {
    if (!deleteId) return;
    await api<void>(`/stage0/${deleteId}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <>
      <PageHeader
        title="Stage 0"
        description="Early-stage opportunities before manual promotion."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <UploadButton onFile={(file) => void upload(file)} />
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add opportunity</Button>
          </div>
        }
      />
      {message ? <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{message}</p> : null}
      {loading ? <p className="text-sm text-slate-500">Loading Stage 0 records...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <div ref={tableRef} className="max-h-[calc(100vh-20rem)] overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1570px] w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[240px]" />
            <col className="w-[170px]" />
            <col className="w-[300px]" />
            <col className="w-[160px]" />
            <col className="w-[220px]" />
            <col className="w-[360px]" />
            <col className="w-[120px]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-3 font-medium"><ColumnFilter label="Account" options={filterOptions.accountName} selected={filters.accountName} onChange={(values) => setColumnFilter("accountName", values)} /></th>
              <th className="px-3 py-3 font-medium"><ColumnFilter label="Opp #" options={filterOptions.opportunityNumber} selected={filters.opportunityNumber} onChange={(values) => setColumnFilter("opportunityNumber", values)} /></th>
              <th className="px-3 py-3 font-medium"><ColumnFilter label="Link" options={filterOptions.link} selected={filters.link} onChange={(values) => setColumnFilter("link", values)} /></th>
              <th className="px-3 py-3 font-medium"><ColumnFilter label="Created" options={filterOptions.createdDate} selected={filters.createdDate} onChange={(values) => setColumnFilter("createdDate", values)} /></th>
              <th className="px-3 py-3 font-medium"><ColumnFilter label="AE" options={filterOptions.accountExecutive} selected={filters.accountExecutive} onChange={(values) => setColumnFilter("accountExecutive", values)} /></th>
              <th className="px-3 py-3 font-medium"><ColumnFilter label="Next step" options={filterOptions.nextStep} selected={filters.nextStep} onChange={(values) => setColumnFilter("nextStep", values)} /></th>
              <th className="px-3 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr
                key={item.id}
                className={`align-top transition ${selectedRowId === item.id ? "selected-row" : "hover:bg-slate-50"}`}
                onClick={() => setSelectedRowId(item.id)}
                onFocusCapture={() => setSelectedRowId(item.id)}
              >
                <td className="whitespace-nowrap px-2 py-2"><InlineField value={item.accountName} required onSave={(v) => update(item.id, { accountName: v } as Partial<Stage0Record>)} /></td>
                <td className="whitespace-nowrap px-2 py-2"><InlineField value={item.opportunityNumber ?? ""} onSave={(v) => update(item.id, { opportunityNumber: v || null } as Partial<Stage0Record>)} /></td>
                <td className="whitespace-nowrap px-2 py-2">
                  <div className="flex items-center gap-2">
                    <InlineField value={item.link ?? ""} onSave={(v) => update(item.id, { link: v || null } as Partial<Stage0Record>)} />
                    {item.link ? <a className="shrink-0 text-slate-400 hover:text-sky-600" href={externalHref(item.link)} target="_blank" rel="noreferrer" title="Open link"><ExternalLink size={16} /></a> : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 py-2"><DateEdit value={item.createdDate} onSave={(value) => update(item.id, { createdDate: value } as Partial<Stage0Record>)} /></td>
                <td className="whitespace-nowrap px-2 py-2"><InlineField value={item.accountExecutive ?? ""} onSave={(v) => update(item.id, { accountExecutive: v || null } as Partial<Stage0Record>)} /></td>
                <td className="px-2 py-2">
                  <NextStepField
                    expanded={expandedNextStepId === item.id}
                    value={item.nextStep ?? ""}
                    onExpand={() => {
                      setExpandedNextStepId(item.id);
                      setSelectedRowId(item.id);
                    }}
                    onSave={async (v) => {
                      setItems((current) => current.map((record) => (record.id === item.id ? { ...record, nextStep: v || null } : record)));
                      await update(item.id, { nextStep: v || null } as Partial<Stage0Record>);
                    }}
                  />
                </td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="focus-ring rounded-md px-1.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-sky-600 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!item.createdDate}
                      onClick={() => void move(item.id)}
                      title={item.createdDate ? "Convert to Stage 1" : "Created date is required before converting"}
                      type="button"
                    >
                      Convert
                    </button>
                    <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(item.id)} title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={modalOpen} title="Add Stage 0 opportunity" onClose={() => setModalOpen(false)}>
        <div className="grid gap-3 md:grid-cols-2">
          <Input placeholder="Account name" value={form.accountName} onChange={(v) => setForm({ ...form, accountName: v })} />
          <Input placeholder="Opportunity number" value={form.opportunityNumber} onChange={(v) => setForm({ ...form, opportunityNumber: v })} />
          <Input placeholder="Link" value={form.link} onChange={(v) => setForm({ ...form, link: v })} />
          <Input type="date" value={form.createdDate} onChange={(v) => setForm({ ...form, createdDate: v })} />
          <Input placeholder="Account Executive" value={form.accountExecutive} onChange={(v) => setForm({ ...form, accountExecutive: v })} />
          <Input placeholder="Next step" value={form.nextStep} onChange={(v) => setForm({ ...form, nextStep: v })} />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="primary" icon={<Plus size={16} />} onClick={add}>Add opportunity</Button>
        </div>
      </Modal>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete Stage 0 record" description="This permanently deletes the Stage 0 record." onCancel={() => setDeleteId(null)} onConfirm={() => void remove()} />
    </>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <input className="focus-ring h-10 rounded-lg border border-slate-200 px-3 text-sm" value={value} type={type} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />;
}

function DateEdit({ value, onSave }: { value: string | null; onSave: (value: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  if (editing) {
    return <input className="focus-ring h-8 w-full rounded-md border border-transparent bg-transparent px-2 text-sm whitespace-nowrap hover:bg-slate-50" type="date" value={toDateInput(value)} onChange={(event) => onSave(event.target.value || null)} onBlur={() => setEditing(false)} autoFocus />;
  }
  return <button className="focus-ring min-h-8 w-full rounded-md px-2 text-left text-sm whitespace-nowrap text-slate-700 hover:bg-slate-50" type="button" onClick={() => setEditing(true)}>{formatDisplayDate(value) || "Set date"}</button>;
}

function NextStepField({ expanded, value, onExpand, onSave }: { expanded: boolean; value: string; onExpand: () => void; onSave: (value: string) => Promise<void> | void }) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(value), [value]);

  async function save() {
    const next = draft.trim();
    if (next === value) return;
    setSaving(true);
    try {
      await onSave(next);
    } finally {
      setSaving(false);
    }
  }

  if (!expanded) {
    return (
      <button className="focus-ring min-h-8 w-full rounded-md px-2 text-left text-sm whitespace-nowrap text-slate-700 hover:bg-slate-50" onClick={onExpand} type="button">
        {value || "Add next step"}
      </button>
    );
  }

  return (
    <div data-next-step-editor="true">
      <textarea
        className="focus-ring min-h-32 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
        value={draft}
        placeholder="Add next step notes"
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => void save()}
        autoFocus
      />
      <div className="mt-1 text-xs text-slate-400">{saving ? "Saving..." : "Auto-saved on blur"}</div>
    </div>
  );
}

function stage0FilterValue(item: Stage0Record, key: Stage0FilterKey) {
  if (key === "createdDate") return dateFilterValue(item.createdDate);
  return textFilterValue(item[key]);
}

function textFilterValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed || blankValue;
}

function dateFilterValue(value?: string | null) {
  return toDateInput(value) || blankValue;
}

function optionsFrom<T>(items: T[], getValue: (item: T) => string, getLabel: (value: string) => string = (value) => (value === blankValue ? "Blank" : value)) {
  return Array.from(new Set(items.map(getValue)))
    .sort((a, b) => getLabel(a).localeCompare(getLabel(b)))
    .map((value) => ({ value, label: getLabel(value) }));
}
