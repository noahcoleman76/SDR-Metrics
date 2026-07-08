import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, ExternalLink, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/Button";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { DraggableRow } from "../components/DraggableRow";
import { DroppableColumn } from "../components/DroppableColumn";
import { InlineField } from "../components/InlineField";
import { PageHeader } from "../components/PageHeader";
import { api, body } from "../services/api";
import type { Task, TaskCategory } from "../types/models";
import { taskCategoryLabels } from "../utils/labels";
import { useCollection } from "../hooks/useCollection";

const categories: TaskCategory[] = ["DAILY", "WEEKLY", "AD_HOC"];

export default function TasksPage() {
  const { items: tasks, setItems, loading, error } = useCollection<Task>("/tasks", "tasks");
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState<TaskCategory>("DAILY");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const activeTasks = useMemo(() => tasks.filter((task) => !task.completedAt), [tasks]);
  const completed = useMemo(() => tasks.filter((task) => task.completedAt), [tasks]);

  async function createTask() {
    if (!newTask.trim()) return;
    const data = await api<{ task: Task }>("/tasks", { method: "POST", ...body({ name: newTask, details: null, link: null, category: newCategory }) });
    setItems((current) => [...current, data.task]);
    setNewTask("");
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    const data = await api<{ task: Task }>(`/tasks/${id}`, { method: "PATCH", ...body(patch) });
    setItems((current) => current.map((task) => (task.id === id ? data.task : task)));
  }

  async function completeTask(id: string) {
    const result = await api<{ deleted: boolean; task: Task }>(`/tasks/${id}/complete`, { method: "POST" });
    setItems((current) => (result.deleted ? current.filter((task) => task.id !== id) : current.map((task) => (task.id === id ? result.task : task))));
  }

  async function onDragEnd(event: DragEndEvent) {
    const task = tasks.find((item) => item.id === event.active.id);
    const overId = event.over?.id as string | undefined;
    if (!task || !overId || task.id === overId) return;

    const overTask = tasks.find((item) => item.id === overId);
    const destinationCategory = overTask?.category ?? (categories.includes(overId as TaskCategory) ? (overId as TaskCategory) : undefined);
    if (!destinationCategory) return;

    const nextActive = activeTasks.filter((item) => item.id !== task.id);
    const movedTask = { ...task, category: destinationCategory };
    const targetIndex = overTask ? nextActive.findIndex((item) => item.id === overTask.id) : -1;
    const insertIndex = targetIndex >= 0 ? targetIndex : nextActive.filter((item) => item.category === destinationCategory).length;
    const destinationIndices = nextActive.reduce<number[]>((indices, item, index) => (item.category === destinationCategory ? [...indices, index] : indices), []);
    const absoluteIndex = targetIndex >= 0 ? targetIndex : destinationIndices[insertIndex] ?? nextActive.length;
    nextActive.splice(absoluteIndex, 0, movedTask);

    const activeIds = new Set(nextActive.map((item) => item.id));
    const reordered = [...nextActive, ...tasks.filter((item) => !activeIds.has(item.id))];
    const ordered = nextActive.map((item) => ({ id: item.id, category: item.category, position: nextActive.filter((candidate) => candidate.category === item.category).findIndex((candidate) => candidate.id === item.id) }));
    setItems(reordered);
    const data = await api<{ tasks: Task[] }>("/tasks/reorder", { method: "PATCH", ...body({ items: ordered }) });
    setItems(data.tasks);
  }

  async function remove() {
    if (!deleteId) return;
    await api<void>(`/tasks/${deleteId}`, { method: "DELETE" });
    setItems((current) => current.filter((task) => task.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <>
      <PageHeader title="Tasks" description="Recurring and ad hoc SDR work." />
      <div className="mb-5 flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row">
        <input className="focus-ring h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm" value={newTask} onChange={(event) => setNewTask(event.target.value)} placeholder="Add task" />
        <select className="focus-ring h-10 rounded-lg border border-slate-200 px-3 text-sm" value={newCategory} onChange={(event) => setNewCategory(event.target.value as TaskCategory)}>
          {categories.map((category) => <option key={category} value={category}>{taskCategoryLabels[category]}</option>)}
        </select>
        <Button variant="primary" icon={<Plus size={16} />} onClick={createTask}>Add</Button>
      </div>
      {loading ? <p className="text-sm text-slate-500">Loading tasks...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <DndContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 lg:grid-cols-3">
          {categories.map((category) => (
            <DroppableColumn key={category} id={category} title={taskCategoryLabels[category]}>
              {activeTasks.filter((task) => task.category === category).map((task) => (
                <DraggableRow key={task.id} id={task.id}>
                  <div>
                    <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-2">
                      <input type="checkbox" className="h-4 w-4" onChange={() => void completeTask(task.id)} />
                      <button
                        className="text-slate-400 hover:text-slate-700"
                        onClick={() =>
                          setExpandedIds((current) => {
                            const next = new Set(current);
                            if (next.has(task.id)) next.delete(task.id);
                            else next.add(task.id);
                            return next;
                          })
                        }
                        title={expandedIds.has(task.id) ? "Collapse details" : "Expand details"}
                        type="button"
                      >
                        {expandedIds.has(task.id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <div className="min-w-0">
                        <InlineField value={task.name} required onSave={(name) => updateTask(task.id, { name } as Partial<Task>)} />
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        {task.link ? <a className="text-slate-400 hover:text-sky-600" href={task.link} target="_blank" rel="noreferrer" title="Open link"><ExternalLink size={16} /></a> : null}
                        <button className="text-slate-400 hover:text-rose-600" onClick={() => setDeleteId(task.id)} title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    {expandedIds.has(task.id) ? (
                      <TaskExpanded
                        details={task.details ?? ""}
                        link={task.link ?? ""}
                        onSaveDetails={(details) => updateTask(task.id, { details: details || null } as Partial<Task>)}
                        onSaveLink={(link) => updateTask(task.id, { link: link || null } as Partial<Task>)}
                      />
                    ) : null}
                  </div>
                </DraggableRow>
              ))}
            </DroppableColumn>
          ))}
        </div>
      </DndContext>
      {completed.length ? (
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Completed</h2>
          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {completed.map((task) => (
              <div key={task.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">
                <span>{task.name}</span>
                <Button variant="ghost" icon={<RotateCcw size={15} />} onClick={() => void updateTask(task.id, { completedAt: null } as Partial<Task>)}>Undo</Button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete task" description="This permanently deletes the task." onCancel={() => setDeleteId(null)} onConfirm={() => void remove()} />
    </>
  );
}

function TaskExpanded({
  details,
  link,
  onSaveDetails,
  onSaveLink
}: {
  details: string;
  link: string;
  onSaveDetails: (value: string) => Promise<void> | void;
  onSaveLink: (value: string) => Promise<void> | void;
}) {
  const [draftDetails, setDraftDetails] = useState(details);
  const [draftLink, setDraftLink] = useState(link);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraftDetails(details), [details]);
  useEffect(() => setDraftLink(link), [link]);

  async function saveDetails() {
    if (draftDetails.trim() === details) return;
    setSaving(true);
    try {
      await onSaveDetails(draftDetails.trim());
    } finally {
      setSaving(false);
    }
  }

  async function saveLink() {
    if (draftLink.trim() === link) return;
    setSaving(true);
    try {
      await onSaveLink(draftLink.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 space-y-2 pl-8">
      <input
        className="focus-ring h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700"
        value={draftLink}
        placeholder="Add task link"
        onChange={(event) => setDraftLink(event.target.value)}
        onBlur={() => void saveLink()}
      />
      <textarea
        className="focus-ring min-h-24 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
        value={draftDetails}
        placeholder="Add details"
        onChange={(event) => setDraftDetails(event.target.value)}
        onBlur={() => void saveDetails()}
      />
      <div className="mt-1 text-xs text-slate-400">{saving ? "Saving..." : "Auto-saved on blur"}</div>
    </div>
  );
}
