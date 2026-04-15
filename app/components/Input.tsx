import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export default function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-white text-gray-800 placeholder:text-gray-400
          outline-none transition-all
          border-gray-200 hover:border-gray-300
          focus:border-slate-400 focus:ring-2 focus:ring-slate-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}
          ${className ?? ""}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
