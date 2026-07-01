import StatCard from '@/components/common/StatCard';
import styles from './ticket-stats.module.scss';
import { TICKET_STATUS, type TicketStatus, type TicketStats } from '@/types/ticket';

interface TicketStatsProps {
  readonly stats: TicketStats;
  readonly active?: TicketStatus;
  readonly onSelect: (status: TicketStatus) => void;
}

const STAT_CARDS: { key: TicketStatus; label: string }[] = [
  { key: TICKET_STATUS.OPEN, label: 'Open Tickets' },
  { key: TICKET_STATUS.IN_PROGRESS, label: 'In-Progress Tickets' },
  { key: TICKET_STATUS.CLOSED, label: 'Closed Tickets' },
];

export default function TicketStats({ stats, active, onSelect }: TicketStatsProps) {
  return (
    <div className={styles.row}>
      {STAT_CARDS.map(({ key, label }) => (
        <StatCard
          key={key}
          count={stats[key]}
          label={label}
          isActive={active === key}
          onClick={() => onSelect(key)}
        />
      ))}
    </div>
  );
}
