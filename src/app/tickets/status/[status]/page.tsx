import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TicketsPage from '@/components/TicketsPage';
import { isTicketStatusSlug, TICKET_STATUS_FROM_SLUG } from '@/types/ticket';

interface Props {
  params: Promise<{ status: string }>;
}

const STATUS_TITLES: Record<string, string> = {
  open: 'Open Tickets',
  'in-progress': 'In-Progress Tickets',
  closed: 'Closed Tickets',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { status } = await params;
  const title = STATUS_TITLES[status] ?? 'Tickets';
  return { title };
}

export default async function Page({ params }: Props) {
  const { status } = await params;
  if (!isTicketStatusSlug(status)) notFound();
  return <TicketsPage statusFilter={TICKET_STATUS_FROM_SLUG[status]} />;
}
