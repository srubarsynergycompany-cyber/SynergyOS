type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, className = '', ...props }: InputProps) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span> : null}
      <input
        className={`w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 ${className}`.trim()}
        {...props}
      />
      {hint ? <span className="mt-2 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}
