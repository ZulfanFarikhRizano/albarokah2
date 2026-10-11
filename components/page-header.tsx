export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-extrabold text-primary-900">{title}</h1>
      {description && <p className="mt-1.5 max-w-[60ch] text-foreground/60">{description}</p>}
    </div>
  );
}
