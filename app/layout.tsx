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
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
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
      </body>
    </html>
  );
}
