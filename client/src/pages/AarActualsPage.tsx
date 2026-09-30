import { Check, ChevronLeft, ChevronRight, CircleAlert, Copy, Info, LoaderCircle } from "lucide-react";
import { toBlob } from "html-to-image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../components/Button";
import { api, body } from "../services/api";
import { type AarGoals, type AarMonth, type AarQuarter, type GoalKey, type MonthInputKey } from "../types/aar";
import { coachingRows, currentQuarter, emptyGoals, formatMetric, kpiRows, metricValue, normalizeQuarter, quarterMonths, shiftQuarter, type MetricRow } from "../utils/aarActuals";

const sections = [
  { title: "Coaching metrics", rows: coachingRows },
  { title: "KPI metrics", rows: kpiRows }
];

const summaryMetrics: Array<{ label: string; key: GoalKey }> = [
  { label: "HVAs", key: "hvas" },
  { label: "Discos booked", key: "discosBooked" },
  { label: "Discos held", key: "discosHeld" },
  { label: "Stage 1s", key: "stage1s" }
];

function selectionFrom(params: URLSearchParams) {
  const fallback = currentQuarter();
  const year = Number(params.get("year"));
  const quarter = Number(params.get("quarter"));
  return Number.isInteger(year) && year >= 2000 && year <= 2100 && Number.isInteger(quarter) && quarter >= 1 && quarter <= 4
    ? { year, quarter }
    : fallback;
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(year, month - 1, 1));
}

export default function AarActualsPage() {
  const [params, setParams] = useSearchParams();
  const { year, quarter } = selectionFrom(params);
  const [data, setData] = useState<AarQuarter | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [message, setMessage] = useState("");
  const [copying, setCopying] = useState(false);
  const [pendingSaves, setPendingSaves] = useState(0);
  const captureRef = useRef<HTMLDivElement>(null);
  const months = quarterMonths(quarter);
  const current = currentQuarter();
  const selectedData = data?.year === year && data.quarter === quarter ? data : null;
  const displayData = selectedData ?? normalizeQuarter({ year, quarter, months: [], goals: null });
  const goals = displayData.goals ?? emptyGoals();
  const editable = !loading && !loadError && Boolean(selectedData);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    setSaveError("");
    void api<AarQuarter>(`/aar-actuals?year=${year}&quarter=${quarter}`)
      .then((result) => { if (active) setData(normalizeQuarter(result)); })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : "Could not load AAR actuals"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [year, quarter]);

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  function changeQuarter(offset: number) {
    const next = shiftQuarter(year, quarter, offset);
    setParams({ year: String(next.year), quarter: String(next.quarter) });
  }

  async function saveMonth(month: number, key: MonthInputKey, value: number | null) {
    setPendingSaves((count) => count + 1);
    try {
      const result = await api<{ month: AarMonth }>(`/aar-actuals/months/${year}/${month}`, { method: "PATCH", ...body({ [key]: value }) });
      setData((previous) => previous?.year === year && previous.quarter === quarter
        ? { ...previous, months: previous.months.map((item) => item.month === month ? { ...item, ...result.month } : item) }
        : previous);
      setSaveError("");
    } finally {
      setPendingSaves((count) => count - 1);
    }
  }

  async function saveGoal(key: GoalKey, value: number | null) {
    setPendingSaves((count) => count + 1);
    try {
      const result = await api<{ goals: AarGoals }>(`/aar-actuals/goals/${year}/${quarter}`, { method: "PATCH", ...body({ [key]: value }) });
      setData((previous) => previous?.year === year && previous.quarter === quarter
        ? { ...previous, goals: { ...emptyGoals(), ...result.goals } }
        : previous);
      setSaveError("");
    } finally {
      setPendingSaves((count) => count - 1);
    }
  }

  async function copyQuarterImage() {
    if (!captureRef.current || !selectedData) return;
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      setSaveError("This browser cannot copy images to the clipboard. Use a recent browser over HTTPS or localhost.");
      return;
    }
    setCopying(true);
    setSaveError("");
    try {
      const png = toBlob(captureRef.current, { backgroundColor: "#ffffff", pixelRatio: 2, cacheBust: true })
        .then((blob) => {
          if (!blob) throw new Error("Could not create the image");
          return blob;
        });
      await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
      setMessage(`Copied Q${quarter} ${year} as an image`);
    } catch (error) {
      setSaveError(error instanceof Error ? `Could not copy image: ${error.message}` : "Could not copy image");
    } finally {
      setCopying(false);
    }
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-950">AAR Actuals</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button icon={<Copy size={15} />} disabled={!editable || copying || pendingSaves > 0} onClick={() => void copyQuarterImage()}>
            {copying ? "Copying..." : "Copy image"}
          </Button>
          <Button icon={<ChevronLeft size={15} />} aria-label="Previous quarter" title="Previous quarter" onClick={() => changeQuarter(-1)} />
          <div className="min-w-28 text-center">
            <div className="text-sm font-semibold text-slate-900">Q{quarter} {year}</div>
            <div className="text-xs text-slate-500">{monthLabel(year, months[0])} - {monthLabel(year, months[2])}</div>
          </div>
          <Button icon={<ChevronRight size={15} />} aria-label="Next quarter" title="Next quarter" onClick={() => changeQuarter(1)} />
          {year !== current.year || quarter !== current.quarter ? <Button onClick={() => setParams({})}>Current</Button> : null}
        </div>
      </div>

      {loading ? <p className="mb-2 text-sm text-slate-500">Loading actuals...</p> : null}
      {loadError ? <p className="mb-2 flex items-center gap-2 text-sm text-rose-600" role="alert"><CircleAlert size={16} />{loadError}</p> : null}
      {saveError ? <p className="mb-2 flex items-center gap-2 text-sm text-rose-600" role="alert"><CircleAlert size={16} />{saveError}</p> : null}
      {message ? <p className="mb-2 text-sm text-emerald-700" role="status">{message}</p> : null}

      <Summary goals={goals} editable={editable} year={year} quarter={quarter} onSaveGoal={saveGoal} onError={setSaveError} />
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <MetricTable key={section.title} title={section.title} rows={section.rows} year={year} months={months} data={displayData.months} goals={goals} editable={editable} onSaveMonth={saveMonth} onError={setSaveError} />
        ))}
      </div>

      <div className="aar-export-offscreen" aria-hidden="true">
        <div ref={captureRef} className="aar-export-sheet" style={{
          "--surface": "#ffffff", "--surface-soft": "#f8fafc", "--text-main": "#172033",
          "--text-muted": "#64748b", "--border-soft": "#e2e8f0"
        } as CSSProperties}>
          <div className="mb-5 flex items-end justify-between border-b border-slate-200 pb-3">
            <h2 className="text-2xl font-semibold text-slate-950">AAR Actuals</h2>
            <div className="text-right text-sm text-slate-500">Q{quarter} {year} · {months.map((month) => monthLabel(year, month)).join(" / ")}</div>
          </div>
          <Summary goals={goals} editable={false} year={year} quarter={quarter} onSaveGoal={saveGoal} onError={setSaveError} exportMode />
          <div className="mt-5 grid grid-cols-2 gap-5">
            {sections.map((section) => <MetricTable key={section.title} title={section.title} rows={section.rows} year={year} months={months} data={displayData.months} goals={goals} editable={false} onSaveMonth={saveMonth} onError={setSaveError} exportMode />)}
          </div>
        </div>
      </div>
    </>
  );
}

function Summary({ goals, editable, year, quarter, onSaveGoal, onError, exportMode = false }: {
  goals: AarGoals;
  editable: boolean;
  year: number;
  quarter: number;
  onSaveGoal: (key: GoalKey, value: number | null) => Promise<void>;
  onError: (message: string) => void;
  exportMode?: boolean;
}) {
  return (
    <div className={`grid border-y border-slate-200 bg-white ${exportMode ? "grid-cols-4" : "grid-cols-2 lg:grid-cols-4"}`}>
      {summaryMetrics.map((item) => (
          <div key={item.key} className="min-w-0 border-r border-slate-200 px-3 py-2.5 last:border-r-0">
            <div className="text-xs font-semibold text-slate-700">{item.label}</div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500">
              <span>Monthly goal</span>
              {exportMode ? (
                <span className="aar-entry-cell rounded px-2 py-0.5 text-base font-semibold tabular-nums text-slate-900">{formatMetric(goals[item.key], "count")}</span>
              ) : (
                <div className="aar-entry-cell aar-goal-cell w-20 rounded-md px-0.5">
                  <NumberCell key={`${year}-${quarter}-${item.key}`} label={`${item.label}, monthly goal`} value={goals[item.key]} max={1_000_000_000} disabled={!editable} onSave={(value) => onSaveGoal(item.key, value)} onError={onError} />
                </div>
              )}
            </div>
          </div>
      ))}
    </div>
  );
}

function MetricTable({ title, rows, year, months, data, goals, editable, onSaveMonth, onError, exportMode = false }: {
  title: string;
  rows: MetricRow[];
  year: number;
  months: number[];
  data: AarMonth[];
  goals: AarGoals;
  editable: boolean;
  onSaveMonth: (month: number, key: MonthInputKey, value: number | null) => Promise<void>;
  onError: (message: string) => void;
  exportMode?: boolean;
}) {
  return (
    <section className="min-w-0">
      <h2 className="aar-section-heading mb-1.5 text-xs font-semibold uppercase">{title}</h2>
      <div className={exportMode ? "" : "overflow-x-auto rounded-md border border-slate-200 bg-white"}>
        <table className={`w-full table-fixed border-collapse text-xs ${exportMode ? "aar-export-table" : "min-w-[440px]"}`}>
          <colgroup><col className="w-[42%]" /><col className="w-[14.5%]" /><col className="w-[14.5%]" /><col className="w-[14.5%]" /><col className="w-[14.5%]" /></colgroup>
          <thead className="aar-report-head">
            <tr>
              <th scope="col" className="px-2 py-1.5 text-center font-semibold">Metric</th>
              {months.map((month) => <th scope="col" key={month} className="px-1 py-1.5 text-center font-semibold">{monthLabel(year, month)}</th>)}
              <th scope="col" className="px-2 py-1.5 text-center font-semibold">QTD</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-slate-100">
                <th scope="row" className="px-2 py-1 text-left font-medium leading-tight text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    {row.label}
                    {!exportMode && row.source ? <span className="shrink-0 text-slate-400" title={row.source} aria-label={row.source}><Info size={12} /></span> : null}
                  </span>
                </th>
                {months.map((month) => {
                  const actual = data.find((item) => item.month === month);
                  return row.input ? (
                    <td key={month} className="aar-entry-cell border-l border-slate-100 px-0.5 py-0.5 text-center tabular-nums">
                      {exportMode ? formatMetric(actual?.[row.input] ?? null, row.format) : (
                        <NumberCell key={`${year}-${month}-${row.key}`} label={`${row.label}, ${monthLabel(year, month)} ${year}`} value={actual?.[row.input] ?? null} max={row.input === "workingDays" ? 31 : 1_000_000_000} disabled={!editable} onSave={(value) => onSaveMonth(month, row.input!, value)} onError={onError} />
                      )}
                    </td>
                  ) : (
                    <td key={month} className="border-l border-slate-100 px-1 py-1 text-center tabular-nums text-slate-700">
                      {formatMetric(metricValue(row.key, data, goals, month), row.format)}
                    </td>
                  );
                })}
                <td className="border-l border-slate-100 bg-slate-50 px-2 py-1 text-center font-semibold tabular-nums text-slate-900">
                  {formatMetric(metricValue(row.key, data, goals), row.format)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function NumberCell({ label, value, max, disabled, onSave, onError }: {
  label: string;
  value: number | null;
  max: number;
  disabled: boolean;
  onSave: (value: number | null) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [draft, setDraft] = useState(value === null ? "" : String(value));
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [invalid, setInvalid] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => { setDraft(value === null ? "" : String(value)); }, [value]);
  useEffect(() => () => { if (timer.current !== null) window.clearTimeout(timer.current); }, []);

  async function commit(raw: string) {
    const next = raw === "" ? null : Number(raw);
    if (next !== null && (!Number.isSafeInteger(next) || next > max)) {
      setInvalid(true);
      onError(`${label}: enter a whole number from 0 to ${max.toLocaleString("en-US")}`);
      return;
    }
    if (next === value) return;
    setStatus("saving");
    try {
      await onSave(next);
      setStatus("saved");
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setStatus("idle"), 1500);
    } catch (error) {
      setDraft(value === null ? "" : String(value));
      setStatus("idle");
      onError(`${label}: ${error instanceof Error ? error.message : "Could not save"}`);
    }
  }

  return (
    <div className="relative flex h-6 items-center">
      <input
        className={`aar-input focus-ring w-full min-w-0 rounded border px-1 py-0.5 text-center tabular-nums ${invalid ? "border-rose-500" : "border-transparent"}`}
        type="text"
        inputMode="numeric"
        aria-label={label}
        aria-invalid={invalid}
        value={draft}
        placeholder="-"
        disabled={disabled || status === "saving"}
        onChange={(event) => {
          if (/^\d*$/.test(event.target.value)) {
            setDraft(event.target.value);
            setInvalid(false);
          }
        }}
        onBlur={(event) => void commit(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            const previous = value === null ? "" : String(value);
            event.currentTarget.value = previous;
            setDraft(previous);
            setInvalid(false);
            event.currentTarget.blur();
          }
        }}
      />
      <span className="pointer-events-none absolute right-0 flex w-3 justify-center" aria-live="polite">
        {status === "saving" ? <LoaderCircle size={11} className="animate-spin text-slate-400" aria-label="Saving" /> : null}
        {status === "saved" ? <Check size={11} className="text-emerald-600" aria-label="Saved" /> : null}
      </span>
    </div>
  );
}
