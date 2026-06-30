'use client';

import { useState } from 'react';
import { type TicketsQuery } from '@/services/ticketApi';
import CreateTicketForm from './dependencies/CreateTicketForm';
import TicketList from './dependencies/TicketList';
import styles from './TicketsPage.module.scss';

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketsQuery>({ page: 1, limit: 20 });

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Support Tickets</h1>
      <CreateTicketForm />
      <TicketList filters={filters} />
    </main>
  );
}
