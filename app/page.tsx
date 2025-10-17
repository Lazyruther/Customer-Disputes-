import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { DisputeCard, DisputeCardProps } from '@/components/DisputeCard';

async function getDisputes(): Promise<DisputeCardProps[]> {
  const fallback: DisputeCardProps[] = [
    {
      id: 1,
      customerName: 'Ayesha Castillo',
      issue: 'Chargeback on invoice #1043 with missing supporting documentation.',
      status: 'OPEN',
      createdAt: new Date('2024-04-22T13:20:00Z'),
      updatedAt: new Date('2024-04-28T08:15:00Z')
    },
    {
      id: 2,
      customerName: 'Lucien Becker',
      issue: 'Disputed overdraft fees tied to ACH reversal with bank partner.',
      status: 'IN_PROGRESS',
      createdAt: new Date('2024-04-10T09:35:00Z'),
      updatedAt: new Date('2024-04-27T17:48:00Z')
    },
    {
      id: 3,
      customerName: 'Veronica Mendez',
      issue: 'Duplicate payment detected after settlement batch retry.',
      status: 'RESOLVED',
      createdAt: new Date('2024-03-18T11:05:00Z'),
      updatedAt: new Date('2024-04-22T10:42:00Z')
    }
  ];

  try {
    const disputes = await prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' }
    });

    if (!disputes.length) {
      return fallback;
    }

    return disputes.map((dispute) => ({
      ...dispute,
      status: dispute.status as DisputeCardProps['status']
    }));
  } catch (error) {
    console.warn('Falling back to static disputes due to Prisma error:', error);
    return fallback;
  }
}

async function DisputeList() {
  const disputes = await getDisputes();
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {disputes.map((dispute) => (
        <DisputeCard key={dispute.id} {...dispute} />
      ))}
    </section>
  );
}

function DashboardSkeleton() {
  return (
    <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-48 animate-pulse rounded-xl border border-white/5 bg-white/5/30"
        />
      ))}
    </section>
  );
}

export default async function Home() {
  return (
    <main className="space-y-10">
      <section className="grid gap-6 rounded-2xl border border-white/5 bg-white/5 p-8 backdrop-blur">
        <div className="grid gap-2">
          <h2 className="text-2xl font-semibold text-white">Dispute Overview</h2>
          <p className="text-sm text-slate-300">
            Track dispute velocity and resolution trends with live data streaming from the Postgres
            datastore via Prisma ORM.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 p-5 text-brand-100">
            <p className="text-sm uppercase tracking-[0.2em]">Open Cases</p>
            <p className="mt-3 text-4xl font-semibold">18</p>
            <p className="mt-2 text-xs text-brand-200/80">+3 vs last week</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-100">
            <p className="text-sm uppercase tracking-[0.2em]">Resolved</p>
            <p className="mt-3 text-4xl font-semibold">64</p>
            <p className="mt-2 text-xs text-emerald-200/80">92% within SLA</p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-100">
            <p className="text-sm uppercase tracking-[0.2em]">Backlog Age</p>
            <p className="mt-3 text-4xl font-semibold">4.6d</p>
            <p className="mt-2 text-xs text-amber-200/80">Down 12% week over week</p>
          </div>
        </div>
      </section>

      <Suspense fallback={<DashboardSkeleton />}>
        <DisputeList />
      </Suspense>
    </main>
  );
}
