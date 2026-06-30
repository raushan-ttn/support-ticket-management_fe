import Link from 'next/link';
import styles from './ticket-list-item.module.scss';

export interface TicketListItemData {
  readonly id: number;
  readonly category: string;
  readonly title: string;
  readonly createdAt: string;
}

interface TicketListItemProps extends TicketListItemData {}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export default function TicketListItem({ id, category, title, createdAt }: TicketListItemProps) {
  return (
    <Link href={`/tickets/${id}`} className={styles.item}>
      <span className={styles.meta}>
        #{id} - {category}
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.date}>Created On: {formatDate(createdAt)}</span>
    </Link>
  );
}
