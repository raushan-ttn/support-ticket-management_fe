'use client';

import { useState } from 'react';
import TicketDetailCard from '@/components/common/TicketDetailCard';
import mockData from '@/data/ticket-detail.json';
import TicketStats from './dependencies/TicketStats';
import styles from './ticket-detail-page.module.scss';

type StatFilter = 'open' | 'inProgress' | 'closed';

const DURATION_OPTIONS = ['Last 1 Month', 'Last 3 Months', 'Last 6 Months', 'Last 1 Year'];

export default function TicketDetailPage() {
  const [activeFilter, setActiveFilter] = useState<StatFilter>('closed');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [duration, setDuration] = useState(mockData.duration);

  const tickets = mockData.tickets;
  const comments = mockData.comments;
  const ticketIds = tickets.map((t) => t.id);
  const selectedTicket = tickets[selectedIdx];

  function handlePrev() {
    setSelectedIdx((prev) => Math.max(0, prev - 1));
  }

  function handleNext() {
    setSelectedIdx((prev) => Math.min(tickets.length - 1, prev + 1));
  }

  return (
    <div className={styles.page}>
      {/* Page header row */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Tickets</h1>
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

      {/* Stats row */}
      <TicketStats
        stats={mockData.stats}
        active={activeFilter}
        onSelect={setActiveFilter}
      />

      {/* Ticket detail card */}
      {selectedTicket ? (
        <TicketDetailCard
          ticket={selectedTicket}
          comments={comments}
          ticketIds={ticketIds}
          selectedIdx={selectedIdx}
          onPrev={handlePrev}
          onNext={handleNext}
          onSelectTicket={setSelectedIdx}
        />
      ) : (
        <p className={styles.empty}>No ticket found.</p>
      )}
    </div>
  );
}
