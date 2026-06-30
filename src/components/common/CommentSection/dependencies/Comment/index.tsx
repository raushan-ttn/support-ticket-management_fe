import styles from './comment.module.scss';

export interface CommentData {
  readonly id: number;
  readonly ticketId: number;
  readonly authorName: string;
  readonly content: string;
  readonly createdAt: string;
}

interface CommentProps {
  readonly comment: CommentData;
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Comment({ comment }: CommentProps) {
  const initials = getInitials(comment.authorName);
  const timestamp = formatTimestamp(comment.createdAt);

  return (
    <div className={styles.comment}>
      <div className={styles.avatar} aria-hidden="true">
        {initials}
      </div>
      <div className={styles.body}>
        <span className={styles.author}>{comment.authorName}</span>
        <p className={styles.content}>{comment.content}</p>
        <span className={styles.timestamp}>{timestamp}</span>
      </div>
    </div>
  );
}
