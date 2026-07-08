import { Upload } from "lucide-react";
import { useRef } from "react";
import { Button } from "./Button";

export function UploadButton({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <Button icon={<Upload size={16} />} onClick={() => inputRef.current?.click()} type="button">
        Upload
      </Button>
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept=".csv,.xlsx,.xls"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}
