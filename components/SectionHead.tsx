/** Numbered section header: § index + label + hairline that fills the row. */
export function SectionHead({
  index,
  label,
  action,
}: {
  index: string;
  label: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="section-head">
      <span className="section-head__index">§ {index}</span>
      <span className="section-head__label">{label}</span>
      <span className="section-head__rule" aria-hidden />
      {action ? <span className="shrink-0">{action}</span> : null}
    </div>
  );
}
