import styles from './ticket-stats.module.scss';

type StatFilter = 'open' | 'inProgress' | 'closed';

interface Stats {
  readonly open: number;
  readonly inProgress: number;
  readonly closed: number;
}

interface TicketStatsProps {
  readonly stats: Stats;
  readonly active: StatFilter;
  readonly onSelect: (filter: StatFilter) => void;
}

const STAT_CARDS: { key: StatFilter; label: string }[] = [
  { key: 'open', label: 'Open Tickets' },
  { key: 'inProgress', label: 'In-Progress Tickets' },
  { key: 'closed', label: 'Closed Tickets' },
];

export default function TicketStats({ stats, active, onSelect }: TicketStatsProps) {
  return (
    <div className={styles.row}>
      {STAT_CARDS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`${styles.card} ${active === key ? styles.cardActive : ''}`}
          onClick={() => onSelect(key)}
          aria-pressed={active === key}
        >
          <span className={styles.count}>{stats[key]}</span>
          <span className={styles.label}>{label}</span>
        </button>
      ))}
    </div>
  );
}
