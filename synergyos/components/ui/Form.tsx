type FormProps = React.FormHTMLAttributes<HTMLFormElement> & {
  title?: string;
  description?: string;
};

type FormFieldProps = {
  label: string;
  hint?: string;
  children: React.ReactNode;
};

type FormRowProps = {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
};

export function Form({ title, description, className = '', children, ...props }: FormProps) {
  return (
    <form className={`space-y-5 ${className}`.trim()} {...props}>
      {title ? <h3 className="text-lg font-semibold text-white">{title}</h3> : null}
      {description ? <p className="-mt-2 text-sm text-slate-400">{description}</p> : null}
      {children}
    </form>
  );
}

export function FormField({ label, hint, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
      {children}
      {hint ? <span className="mt-2 block text-xs text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function FormRow({ children, columns = 2 }: FormRowProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
  } as const;

  return <div className={`grid gap-4 ${gridClasses[columns]}`}>{children}</div>;
}
