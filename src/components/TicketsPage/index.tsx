'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/common/StatCard';
import TicketListItem from '@/components/common/TicketListItem';
import mockData from '@/data/my-tickets.json';
import { TICKET_STATUS, TICKET_STATUS_SLUG, toTicketStatus, type TicketStatus } from '@/types/ticket';
import styles from './TicketsPage.module.scss';

interface TicketsPageProps {
  readonly statusFilter?: TicketStatus;
}

const DURATION_OPTIONS = ['Last 1 Month', 'Last 3 Months', 'Last 6 Months', 'Last 1 Year'];

const STAT_CARDS: { key: TicketStatus; label: string }[] = [
  { key: TICKET_STATUS.OPEN, label: 'Open Tickets' },
  { key: TICKET_STATUS.IN_PROGRESS, label: 'In-Progress Tickets' },
  { key: TICKET_STATUS.CLOSED, label: 'Closed Tickets' },
];

export default function TicketsPage({ statusFilter }: TicketsPageProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [duration, setDuration] = useState(mockData.duration);

  const filteredTickets = mockData.tickets.filter((ticket) => {
    const ticketStatus = toTicketStatus(ticket.status);
    const matchesFilter = statusFilter ? ticketStatus === statusFilter : true;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  function handleStatCardClick(key: TicketStatus) {
    if (statusFilter === key) {
      router.push('/tickets'); // toggle off → show all
    } else {
      router.push(`/tickets/status/${TICKET_STATUS_SLUG[key]}`); // navigate to filtered URL
    }
  }

  return (
    <div className={styles.page}>
      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleGroup}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            &#8249;
          </button>
          <h1 className={styles.pageTitle}>My Tickets</h1>
        </div>
        <div className={styles.durationWrapper}>
          <span className={styles.durationLabel}>Select Duration</span>
          <select
            className={styles.durationSelect}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            aria-label="Select duration"
          >
            {DURATION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className={styles.statsRow}>
        {STAT_CARDS.map(({ key, label }) => (
          <StatCard
            key={key}
            count={mockData.stats[key]}
            label={label}
            isActive={statusFilter === key}
            onClick={() => handleStatCardClick(key)}
          />
        ))}
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search here"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search tickets"
        />
      </div>

      {/* Ticket list */}
      <div className={styles.ticketList}>
        {filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <TicketListItem
              key={ticket.id}
              id={ticket.id}
              category={ticket.category}
              title={ticket.title}
              createdAt={ticket.createdAt}
            />
          ))
        ) : (
          <p className={styles.empty}>No tickets found.</p>
        )}
      </div>
    </div>
  );
}
