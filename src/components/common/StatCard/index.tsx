import styles from './stat-card.module.scss';

interface StatCardProps {
  readonly count: number;
  readonly label: string;
  readonly isActive: boolean;
  readonly onClick: () => void;
}

export default function StatCard({ count, label, isActive, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
      onClick={onClick}
      aria-pressed={isActive}
    >
      <span className={styles.count}>{count}</span>
      <span className={styles.label}>{label}</span>
    </button>
  );
}
