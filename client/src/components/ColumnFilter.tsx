import { Filter } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

export type FilterOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
};

export function ColumnFilter({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const selectedSet = new Set(selected);

  function toggle(value: string) {
    if (selectedSet.has(value)) onChange(selected.filter((item) => item !== value));
    else onChange([...selected, value]);
  }

  return (
    <div className="relative inline-flex items-center gap-1">
      <span>{label}</span>
      <button
        className={clsx("focus-ring rounded-md p-1 hover:bg-slate-200", selected.length ? "text-sky-700" : "text-slate-400")}
        onClick={() => setOpen((current) => !current)}
        type="button"
        title={`Filter ${label}`}
      >
        <Filter size={13} />
      </button>
      {open ? (
        <div className="absolute left-0 top-7 z-30 w-56 rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-xl">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <span className="text-xs font-semibold text-slate-500">{label}</span>
            <button className="text-xs font-medium text-sky-700 hover:text-sky-900" onClick={() => onChange([])} type="button">
              Clear
            </button>
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto">
            {options.length ? (
              options.map((option) => (
                <label key={option.value} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs normal-case hover:bg-slate-50">
                  <input className="h-3.5 w-3.5" type="checkbox" checked={selectedSet.has(option.value)} onChange={() => toggle(option.value)} />
                  <span className="truncate">{option.label}</span>
                </label>
              ))
            ) : (
              <div className="px-2 py-1.5 text-xs normal-case text-slate-400">No values</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
