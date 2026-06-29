type DialogProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Dialog({ title, description, children, footer }: DialogProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/50">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {description ? <p className="mt-2 text-sm text-slate-400">{description}</p> : null}
      </div>
      <div>{children}</div>
      {footer ? <div className="mt-6 flex gap-3">{footer}</div> : null}
    </div>
  );
}
