import * as XLSX from "xlsx";

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

function normalizeCell(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? "").trim();
}
