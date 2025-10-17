import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Customer Dispute Portal',
  description:
    'Monitor dispute volumes and resolution efficiency with a modern Next.js dashboard.'
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <div className="relative isolate min-h-screen overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900" />
            <div className="absolute -top-40 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-brand-500/20 blur-3xl" />
            <div className="absolute bottom-[-12%] right-[-10%] h-[30rem] w-[30rem] rounded-full bg-sky-500/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(12,117,255,0.18),rgba(12,117,255,0)_60%)] opacity-80" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[length:100%_48px] opacity-30" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[length:48px_100%] opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950" />
          </div>

          <div className="relative z-10">
            <div className="container py-10">
              <header className="mb-12 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">customer success</p>
                  <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
                    Customer Dispute Operations
                  </h1>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-brand-400/40 bg-brand-500/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
                    live dashboard
                  </span>
                </div>
              </header>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
