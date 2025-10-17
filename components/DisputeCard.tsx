import { format } from 'date-fns';

export type DisputeCardProps = {
  id: number;
  customerName: string;
  issue: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
};

const statusTheme: Record<DisputeCardProps['status'], string> = {
  OPEN: 'bg-rose-500/20 text-rose-200 border border-rose-500/40',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-200 border border-amber-500/40',
  RESOLVED: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
};

export function DisputeCard({ customerName, issue, status, createdAt, updatedAt }: DisputeCardProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{customerName}</h3>
          <p className="text-sm text-slate-300">Filed {format(createdAt, 'MMM d, yyyy')}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusTheme[status]}`}>
          {status.replace(/_/g, ' ')}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-200">{issue}</p>
      <footer className="flex items-center justify-between text-xs text-slate-400">
        <span>Last updated {format(updatedAt, 'MMM d, yyyy')}</span>
        <button className="rounded-lg border border-brand-400/20 bg-brand-500/10 px-3 py-1 font-medium text-brand-100 transition hover:border-brand-300/40 hover:bg-brand-500/20">
          View timeline
        </button>
      </footer>
    </article>
  );
}
