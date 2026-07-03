import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-muted">{label}</label>
      <input
        className={`w-full px-3 py-2.5 bg-surface2 border border-border rounded-lg text-ink placeholder-muted/50 transition-colors focus:border-brass focus:outline-none ${error ? "border-bad" : ""} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}
