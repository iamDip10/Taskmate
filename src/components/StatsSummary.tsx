type Props = {
  given: number;
  completed: number;
  completionRate: number;
};

export default function StatsSummary({ given, completed, completionRate }: Props) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat value={given} label="Given" accent="text-slate-600" />
      <Stat value={completed} label="Completed" accent="text-sage-600" />
      <Stat value={`${completionRate}%`} label="Completion" accent="text-berry-600" />
    </div>
  );
}

function Stat({ value, label, accent }: { value: number | string; label: string; accent: string }) {
  return (
    <div className="rounded-card bg-white px-3 py-4 text-center shadow-soft">
      <p className={`font-display text-2xl ${accent}`}>{value}</p>
      <p className="mt-0.5 text-xs text-ink-soft">{label}</p>
    </div>
  );
}
