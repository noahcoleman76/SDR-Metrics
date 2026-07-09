import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

type Props = {
  columns: string[];
  description?: string;
  onFile: (file: File) => void;
};

export function UploadButton({ columns, description, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button icon={<Upload size={16} />} onClick={() => setOpen(true)} type="button">
        Upload
      </Button>
      <Modal open={open} title="Upload records" onClose={() => setOpen(false)}>
        <div className="space-y-4 text-sm text-slate-600">
          <p>{description ?? "Upload a spreadsheet with column headers that match the fields below."}</p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Supported file types</div>
            <p>CSV, XLSX, and XLS files.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 text-xs font-semibold uppercase text-slate-500">Column headers</div>
            <div className="flex flex-wrap gap-2">
              {columns.map((column) => (
                <span key={column} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                  {column}
                </span>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-500">Account name is required. Other fields can be blank if you do not have them yet.</p>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button onClick={() => setOpen(false)} type="button">Cancel</Button>
          <Button variant="primary" icon={<Upload size={16} />} onClick={() => inputRef.current?.click()} type="button">
            Choose file
          </Button>
        </div>
      </Modal>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            setOpen(false);
            onFile(file);
          }
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}
