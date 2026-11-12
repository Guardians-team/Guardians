export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-[34px] font-extrabold leading-tight tracking-tight">{title}</h1>
        {description && <p className="text-base text-soft">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="card px-6 py-14 text-center">
      <p className="text-lg font-bold">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-[520px] text-sm leading-relaxed text-soft">{children}</div>}
    </div>
  );
}
