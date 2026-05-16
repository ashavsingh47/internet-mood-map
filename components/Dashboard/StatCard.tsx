type StatCardProps = {
  label: string;
  value: string | number;
  description: string;
};

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <div className="glass-panel card-hover rounded-2xl p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p className="mt-2 text-2xl font-black tracking-tight text-white">
        {value}
      </p>

      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}
