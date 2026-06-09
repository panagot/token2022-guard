interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="mb-12">
      <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
          <h1 className="display text-[2rem] leading-[1.08] md:text-[2.6rem]">{title}</h1>
          {subtitle && (
            <p className="mt-4 text-[15.5px] leading-relaxed text-[var(--ink-muted)]">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2 pt-1">{actions}</div>}
      </div>
      <div className="mt-7 h-px w-full bg-[var(--line)]" />
    </header>
  );
}
