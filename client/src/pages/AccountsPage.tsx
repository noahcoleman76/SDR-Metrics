import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DraggableRow } from "../components/DraggableRow";
import { DroppableColumn } from "../components/DroppableColumn";
import { InlineField } from "../components/InlineField";
import { PageHeader } from "../components/PageHeader";
import { useCollection } from "../hooks/useCollection";
import { api, body } from "../services/api";
import type { Account, AccountSection } from "../types/models";
import { externalHref } from "../utils/links";
import { accountSectionLabels } from "../utils/labels";

const sections: AccountSection[] = ["LEAD_MILLING", "PRIORITY_ACCOUNTS"];

export default function AccountsPage() {
  const { items: accounts, setItems, loading, error } = useCollection<Account>("/accounts", "accounts");
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [section, setSection] = useState<AccountSection>("LEAD_MILLING");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  async function add() {
    if (!name.trim()) return;
    const data = await api<{ account: Account }>("/accounts", { method: "POST", ...body({ name, link, section }) });
    setItems((current) => [...current, data.account]);
    setName("");
    setLink("");
  }

  async function updateAccount(id: string, patch: Partial<Account>) {
    const data = await api<{ account: Account }>(`/accounts/${id}`, { method: "PATCH", ...body(patch) });
    setItems((current) => current.map((account) => (account.id === id ? data.account : account)));
  }

  async function onDragEnd(event: DragEndEvent) {
    const account = accounts.find((item) => item.id === event.active.id);
    const overId = event.over?.id as string | undefined;
    if (!account || !overId || account.id === overId) return;

    const overAccount = accounts.find((item) => item.id === overId);
    const destinationSection = overAccount?.section ?? (sections.includes(overId as AccountSection) ? (overId as AccountSection) : undefined);
    if (!destinationSection) return;

    const nextAccounts = accounts.filter((item) => item.id !== account.id);
    const movedAccount = { ...account, section: destinationSection };
    const targetIndex = overAccount ? nextAccounts.findIndex((item) => item.id === overAccount.id) : -1;
    const insertIndex = targetIndex >= 0 ? targetIndex : nextAccounts.filter((item) => item.section === destinationSection).length;
    const destinationIndices = nextAccounts.reduce<number[]>((indices, item, index) => (item.section === destinationSection ? [...indices, index] : indices), []);
    const absoluteIndex = targetIndex >= 0 ? targetIndex : destinationIndices[insertIndex] ?? nextAccounts.length;
    nextAccounts.splice(absoluteIndex, 0, movedAccount);

    const ordered = nextAccounts.map((item) => ({ id: item.id, section: item.section, position: nextAccounts.filter((candidate) => candidate.section === item.section).findIndex((candidate) => candidate.id === item.id) }));
    setItems(nextAccounts);
    const data = await api<{ accounts: Account[] }>("/accounts/reorder", { method: "PATCH", ...body({ items: ordered }) });
    setItems(data.accounts);
  }

  async function remove() {
    if (!deleteId) return;
    await api<void>(`/accounts/${deleteId}`, { method: "DELETE" });
    setItems((current) => current.filter((account) => account.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <>
      <PageHeader title="Accounts" description="Lead milling and priority account lists." />
      <div className="mb-5 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-[1fr_1fr_220px_auto]">
        <input className="focus-ring h-10 rounded-lg border border-slate-200 px-3 text-sm" value={name} onChange={(event) => setName(event.target.value)} placeholder="Account name" />
        <input className="focus-ring h-10 rounded-lg border border-slate-200 px-3 text-sm" value={link} onChange={(event) => setLink(event.target.value)} placeholder="Optional link" />
        <select className="focus-ring h-10 rounded-lg border border-slate-200 px-3 text-sm" value={section} onChange={(event) => setSection(event.target.value as AccountSection)}>
          {sections.map((item) => <option key={item} value={item}>{accountSectionLabels[item]}</option>)}
        </select>
        <Button variant="primary" icon={<Plus size={16} />} onClick={add}>Add</Button>
      </div>
      {loading ? <p className="text-sm text-slate-500">Loading accounts...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <DndContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-2">
          {sections.map((item) => (
            <DroppableColumn key={item} id={item} title={accountSectionLabels[item]}>
              {accounts.filter((account) => account.section === item).map((account) => (
                <DraggableRow key={account.id} id={account.id}>
                  <div>
                    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                      <button
                        className="text-slate-400 hover:text-slate-700"
                        onClick={() =>
                          setExpandedIds((current) => {
                            const next = new Set(current);
                            if (next.has(account.id)) next.delete(account.id);
                            else next.add(account.id);
                            return next;
                          })
                        }
                        title={expandedIds.has(account.id) ? "Collapse link" : "Expand link"}
                        type="button"
                      >
                        {expandedIds.has(account.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <div className="min-w-0">
                        <InlineField value={account.name} required onSave={(value) => updateAccount(account.id, { name: value } as Partial<Account>)} />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {account.link ? <a className="text-slate-400 hover:text-sky-600" href={externalHref(account.link)} target="_blank" rel="noreferrer" title="Open"><ExternalLink size={16} /></a> : null}
                        <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(account.id)} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    {expandedIds.has(account.id) ? (
                      <div className="mt-2 pl-6">
                        <InlineField value={account.link ?? ""} placeholder="Add account link" onSave={(value) => updateAccount(account.id, { link: value || null } as Partial<Account>)} />
                      </div>
                    ) : null}
                  </div>
                </DraggableRow>
              ))}
            </DroppableColumn>
          ))}
        </div>
      </DndContext>
      <ConfirmDialog open={Boolean(deleteId)} title="Delete account" description="This permanently deletes the account." onCancel={() => setDeleteId(null)} onConfirm={() => void remove()} />
    </>
  );
}
