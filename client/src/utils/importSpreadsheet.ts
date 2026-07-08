import * as XLSX from "xlsx";
import { format, isValid, parse } from "date-fns";

export type ImportedRow = Record<string, string>;

export async function readSpreadsheet(file: File) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!firstSheet) return [];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: "" });
  return rows.map((row) => {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [normalizeHeader(key), normalizeCell(value)])
    ) as ImportedRow;
  });
}

export function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
}

export function valueFor(row: ImportedRow, labels: string[]) {
  for (const label of labels) {
    const value = row[normalizeHeader(label)];
    if (value) return value;
  }
  return "";
}

export function dateValueFor(row: ImportedRow, labels: string[]) {
  return normalizeDateValue(valueFor(row, labels));
}

function normalizeCell(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").trim();
}

function normalizeDateValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (["n/a", "na", "none", "null", "-"].includes(trimmed.toLowerCase())) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
    const parsed = parse(trimmed, "yyyy-M-d", new Date());
    if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
  }
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const serial = Number(trimmed);
    const parsed = XLSX.SSF.parse_date_code(serial);
    if (parsed?.y && parsed?.m && parsed?.d) {
      return `${parsed.y.toString().padStart(4, "0")}-${parsed.m.toString().padStart(2, "0")}-${parsed.d.toString().padStart(2, "0")}`;
    }
  }

  const formats = ["M/d/yyyy", "MM/dd/yyyy", "M-d-yyyy", "MM-dd-yyyy", "M/d/yy", "MM/dd/yy", "MMM d, yyyy", "MMMM d, yyyy"];
  for (const candidateFormat of formats) {
    const parsed = parse(trimmed, candidateFormat, new Date());
    if (isValid(parsed)) return format(parsed, "yyyy-MM-dd");
  }

  const nativeDate = new Date(trimmed);
  if (isValid(nativeDate) && nativeDate.getFullYear() >= 1900 && nativeDate.getFullYear() <= 2200) return format(nativeDate, "yyyy-MM-dd");
  return trimmed;
}
