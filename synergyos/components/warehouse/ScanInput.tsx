type ScanInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder: string;
  label: string;
};

export function ScanInput({ value, onChange, onSubmit, placeholder, label }: ScanInputProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <label className="text-sm font-medium uppercase tracking-[0.32em] text-cyan-400">{label}</label>
      <input
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit(value);
          }
        }}
        placeholder={placeholder}
        className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-base text-slate-100 outline-none ring-0"
      />
      <p className="mt-3 text-sm text-slate-400">Scan with a handheld scanner or type the barcode and press Enter.</p>
    </div>
  );
}
