'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TicketDetailCard from '@/components/common/TicketDetailCard';
import mockData from '@/data/ticket-detail.json';
import TicketStats from './dependencies/TicketStats';
import { TICKET_STATUS_SLUG, toTicketStatus, type TicketStatus } from '@/types/ticket';
import styles from './ticket-detail-page.module.scss';

interface TicketDetailPageProps {
  readonly ticketId?: number;
}

const DURATION_OPTIONS = ['Last 1 Month', 'Last 3 Months', 'Last 6 Months', 'Last 1 Year'];

export default function TicketDetailPage({ ticketId }: TicketDetailPageProps) {
  const router = useRouter();
  const [selectedIdx, setSelectedIdx] = useState(() => {
    if (typeof ticketId !== 'number') return 0;
    const idx = mockData.tickets.findIndex((t) => t.id === ticketId);
    return idx >= 0 ? idx : 0;
  });
  const [duration, setDuration] = useState(mockData.duration);

  const tickets = mockData.tickets;
  const comments = mockData.comments;
  const ticketIds = tickets.map((t) => t.id);
  const selectedTicket = tickets[selectedIdx];
  const activeStatus = selectedTicket ? toTicketStatus(selectedTicket.status) : undefined;

  function handlePrev() {
    setSelectedIdx((prev) => Math.max(0, prev - 1));
  }

  function handleNext() {
    setSelectedIdx((prev) => Math.min(tickets.length - 1, prev + 1));
  }

  function handleStatSelect(status: TicketStatus) {
    router.push(`/tickets/status/${TICKET_STATUS_SLUG[status]}`);
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
        active={activeStatus}
        onSelect={handleStatSelect}
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
