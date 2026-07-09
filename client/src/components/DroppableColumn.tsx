import { useDroppable } from "@dnd-kit/core";
import type { ReactNode } from "react";

export function DroppableColumn({ id, title, children, footer }: { id: string; title: string; children: ReactNode; footer?: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section ref={setNodeRef} className={`flex min-h-80 max-h-[calc(100vh-12rem)] flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition ${isOver ? "ring-2 ring-sky-300" : ""}`}>
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">{children}</div>
      {footer}
    </section>
  );
}
