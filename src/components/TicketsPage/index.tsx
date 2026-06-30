'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatCard from '@/components/common/StatCard';
import TicketListItem from '@/components/common/TicketListItem';
import mockData from '@/data/my-tickets.json';
import styles from './TicketsPage.module.scss';

type StatFilter = 'open' | 'inProgress' | 'closed';

const DURATION_OPTIONS = ['Last 1 Month', 'Last 3 Months', 'Last 6 Months', 'Last 1 Year'];

const STAT_CARDS: { key: StatFilter; label: string }[] = [
  { key: 'open', label: 'Open Tickets' },
  { key: 'inProgress', label: 'In-Progress Tickets' },
  { key: 'closed', label: 'Closed Tickets' },
];

export default function TicketsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<StatFilter>('closed');
  const [searchTerm, setSearchTerm] = useState('');
  const [duration, setDuration] = useState(mockData.duration);

  const filteredTickets = mockData.tickets.filter((ticket) => {
    const matchesFilter = ticket.status === activeFilter;
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
            isActive={activeFilter === key}
            onClick={() => setActiveFilter(key)}
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
