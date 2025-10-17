import { format } from 'date-fns';
import type { ComponentPropsWithoutRef } from 'react';

export type DisputeCardProps = {
  id: number;
  customerName: string;
  issue: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
  onSelect?: (id: number) => void;
};

type IconProps = ComponentPropsWithoutRef<'svg'>;

const statusTheme: Record<DisputeCardProps['status'], string> = {
  OPEN: 'bg-rose-500/20 text-rose-200 border border-rose-500/40',
  IN_PROGRESS: 'bg-amber-500/20 text-amber-200 border border-amber-500/40',
  RESOLVED: 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
};

function ArrowRightIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function DisputeCard({ id, customerName, issue, status, createdAt, updatedAt, onSelect }: DisputeCardProps) {
  function handleSelect() {
    onSelect?.(id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleSelect();
        }
      }}
      className="group flex flex-col gap-4 rounded-xl border border-white/5 bg-white/5 p-6 shadow-lg shadow-black/20 backdrop-blur transition-transform duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-95"
    >
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
        <span className="transition-colors duration-200 ease-in-out group-hover:text-slate-200">Last updated {format(updatedAt, 'MMM d, yyyy')}</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleSelect();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              handleSelect();
            }
          }}
          className="group/button inline-flex items-center gap-1 rounded-lg border border-brand-400/20 bg-brand-500/10 px-3 py-1 font-medium text-brand-100 transition duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 hover:border-brand-300/40 hover:bg-brand-500/20"
        >
          <span>View timeline</span>
          <ArrowRightIcon className="h-4 w-4 transition-transform duration-500 ease-out group-hover/button:translate-x-1 group-focus-visible/button:translate-x-1" />
        </button>
      </footer>
    </div>
  );
}
