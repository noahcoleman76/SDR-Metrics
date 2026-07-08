import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
};

export function PasswordField({ label, value, onChange, autoComplete }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <div className="mt-1 flex h-10 items-center rounded-lg border border-slate-200 bg-white">
        <input
          className="focus-ring h-full min-w-0 flex-1 rounded-l-lg border-0 px-3"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={visible ? "text" : "password"}
          minLength={8}
          autoComplete={autoComplete}
          required
        />
        <button
          className="focus-ring flex h-full w-10 items-center justify-center rounded-r-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          onClick={() => setVisible((current) => !current)}
          type="button"
          title={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}
