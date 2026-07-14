import clsx from "clsx";
import { Filter } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type DateRange = {
  from: string;
  to: string;
};

type Props = {
  label: string;
  value: DateRange;
  onChange: (value: DateRange) => void;
};

export function DateRangeFilter({ label, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const active = Boolean(value.from || value.to);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPosition({ top: rect.bottom + 6, left: Math.max(8, Math.min(rect.left, window.innerWidth - 280)) });
  }, [open]);

  return (
    <div className="relative inline-flex items-center gap-1">
      <span>{label}</span>
      <button
        ref={buttonRef}
        className={clsx("focus-ring rounded-md p-1 hover:bg-slate-200", active ? "text-sky-700" : "text-slate-400")}
        onClick={() => setOpen((current) => !current)}
        type="button"
        title={`Filter ${label} by date range`}
      >
        <Filter size={13} />
      </button>
      {open
        ? createPortal(
            <>
              <button className="fixed inset-0 z-40 cursor-default" aria-label="Close filter" type="button" onClick={() => setOpen(false)} />
              <div className="fixed z-50 w-64 rounded-lg border border-slate-200 bg-white p-3 text-slate-700 shadow-xl" style={{ top: position.top, left: position.left }}>
                <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <span className="text-xs font-semibold text-slate-500">{label} range</span>
                  <button className="text-xs font-medium text-sky-700 hover:text-sky-900" onClick={() => onChange({ from: "", to: "" })} type="button">
                    Clear
                  </button>
                </div>
                <div className="space-y-3 normal-case">
                  <label className="block text-xs font-medium text-slate-500">
                    From
                    <input
                      className="focus-ring mt-1 h-9 w-full rounded-md border border-slate-200 px-2 text-sm text-slate-700"
                      type="date"
                      value={value.from}
                      max={value.to || undefined}
                      onChange={(event) => onChange({ ...value, from: event.target.value })}
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-500">
                    To
                    <input
                      className="focus-ring mt-1 h-9 w-full rounded-md border border-slate-200 px-2 text-sm text-slate-700"
                      type="date"
                      value={value.to}
                      min={value.from || undefined}
                      onChange={(event) => onChange({ ...value, to: event.target.value })}
                    />
                  </label>
                  <p className="text-[11px] text-slate-400">Start and end dates are included.</p>
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
