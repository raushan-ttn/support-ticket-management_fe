import styles from './ticket-detail.module.scss';

export interface TicketDetailItem {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly type: string;
  readonly subType: string;
  readonly assignee: string;
  readonly createdAt: string;
}

interface TicketDetailProps {
  readonly ticket: TicketDetailItem;
}

function formatCreatedAt(iso: string): string {
  const date = new Date(iso);
  const formatted = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  const relative = diffWeeks > 0 ? ` (${diffWeeks} w)` : '';

  return `${formatted}${relative}`;
}

const ACTIONABLE_ROWS = [
  { label: 'Type', key: 'type' },
  { label: 'Sub-Type', key: 'subType' },
  { label: 'Status', key: 'status' },
  { label: 'Assignee', key: 'assignee' },
] as const;

export default function TicketDetail({ ticket }: TicketDetailProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <div className={styles.row}>
          <span className={styles.label}>Title</span>
          <span className={styles.value}>{ticket.title}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Description</span>
          <p className={styles.description}>{ticket.description}</p>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Created on</span>
          <span className={styles.value}>{formatCreatedAt(ticket.createdAt)}</span>
        </div>
      </div>

      <div className={styles.actionables}>
        <h4 className={styles.actionablesHeading}>Actionables</h4>
        {ACTIONABLE_ROWS.map(({ label, key }) => (
          <div key={key} className={styles.row}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{ticket[key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
