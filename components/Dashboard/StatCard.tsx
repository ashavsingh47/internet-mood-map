type StatCardProps = {
  label: string;
  value: string | number;
  description: string;
};

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="glass-panel card-hover rounded-3xl p-5">
      <p className="text-sm font-medium text-slate-400">{label}</p>

      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
    </div>
  );
}
