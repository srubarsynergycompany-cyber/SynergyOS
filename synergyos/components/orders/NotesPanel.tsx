type NotesPanelProps = {
  title: string;
  value: string;
  placeholder: string;
  saveLabel: string;
};

export function NotesPanel({ title, value, placeholder, saveLabel }: NotesPanelProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/40">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        <textarea
          rows={4}
          defaultValue={value}
          className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-200 outline-none ring-0 placeholder:text-slate-500"
          placeholder={placeholder}
        />
        <button className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/20">
          {saveLabel}
        </button>
      </div>
    </section>
  );
}
