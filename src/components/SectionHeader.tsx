type Props = {
  icon: string;
  title: string;
  count: number;
};

export default function SectionHeader({ icon, title, count }: Props) {
  return (
    <div className="mb-3 flex items-center justify-between rounded-xl bg-ink/[0.03] px-4 py-2.5">
      <span className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span aria-hidden>{icon}</span>
        {title}
      </span>
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-semibold text-ink-soft shadow-sm">
        {count}
      </span>
    </div>
  );
}
