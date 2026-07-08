import { useDraggable } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

export function DraggableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const { setNodeRef: setDropNodeRef, isOver } = useDroppable({ id });
  const setRefs = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    setDropNodeRef(node);
  };
  return (
    <div ref={setRefs} style={{ transform: CSS.Translate.toString(transform) }} className={`rounded-lg border bg-white p-2 shadow-sm ${isDragging ? "opacity-60" : ""} ${isOver ? "border-sky-300 ring-2 ring-sky-100" : "border-slate-200"}`}>
      <div className="flex items-center gap-2">
        <button className="cursor-grab text-slate-300 hover:text-slate-500" {...listeners} {...attributes} type="button">
          <GripVertical size={16} />
        </button>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
