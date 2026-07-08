import clsx from "clsx";
import { useEffect, useState } from "react";

type Props = {
  value: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  onSave: (value: string) => Promise<void> | void;
};

export function InlineField({ value, placeholder, className, required, onSave }: Props) {
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setDraft(value), [value]);

  async function save() {
    const next = draft.trim();
    if (required && !next) {
      setError("Required");
      setDraft(value);
      return;
    }
    if (next === value) return;
    setSaving(true);
    setError("");
    try {
      await onSave(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setDraft(value);
    } finally {
      setSaving(false);
    }
  }

  return (
    <label className="block min-w-0">
      <input
        className={clsx("focus-ring w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm whitespace-nowrap hover:border-slate-200", className)}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setDraft(value);
            event.currentTarget.blur();
          }
        }}
      />
      <span className="ml-2 text-xs text-slate-400">{saving ? "Saving..." : error}</span>
    </label>
  );
}
