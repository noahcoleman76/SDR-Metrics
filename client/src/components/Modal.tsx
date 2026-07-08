import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <button className="focus-ring rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" onClick={onClose} type="button" title="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
