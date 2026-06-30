import type { CommentData } from '@/components/common/CommentSection/dependencies/Comment';
import CommentSection from '@/components/common/CommentSection';
import TicketDetail, {
  type TicketDetailItem,
} from './dependencies/TicketDetail';
import styles from './ticket-detail-card.module.scss';

interface TicketDetailCardProps {
  readonly ticket: TicketDetailItem;
  readonly comments: CommentData[];
  readonly ticketIds: number[];
  readonly selectedIdx: number;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onSelectTicket: (idx: number) => void;
}

export default function TicketDetailCard({
  ticket,
  comments,
  ticketIds,
  selectedIdx,
  onPrev,
  onNext,
  onSelectTicket,
}: TicketDetailCardProps) {
  const ticketComments = comments.filter((c) => c.ticketId === ticket.id);

  return (
    <div className={styles.card}>
      {/* Card navigation header */}
      <div className={styles.navHeader}>
        <div className={styles.navLeft}>
          <button
            type="button"
            className={styles.navArrow}
            onClick={onPrev}
            disabled={selectedIdx === 0}
            aria-label="Previous ticket"
          >
            &#8249;
          </button>

          <div className={styles.ticketIdWrapper}>
            <span className={styles.ticketIdLabel}>Ticket ID -</span>
            <select
              className={styles.ticketSelect}
              value={selectedIdx}
              onChange={(e) => onSelectTicket(Number(e.target.value))}
              aria-label="Select ticket"
            >
              {ticketIds.map((id, idx) => (
                <option key={id} value={idx}>
                  #{id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.navRight}>
          <button
            type="button"
            className={styles.navArrow}
            onClick={onPrev}
            disabled={selectedIdx === 0}
            aria-label="Previous ticket"
          >
            &#8249;
          </button>
          <button
            type="button"
            className={styles.navArrow}
            onClick={onNext}
            disabled={selectedIdx === ticketIds.length - 1}
            aria-label="Next ticket"
          >
            &#8250;
          </button>
        </div>
      </div>

      {/* Two-column body */}
      <div className={styles.body}>
        <div className={styles.leftPanel}>
          <TicketDetail ticket={ticket} />
        </div>
        <div className={styles.divider} aria-hidden="true" />
        <div className={styles.rightPanel}>
          <CommentSection comments={ticketComments} />
        </div>
      </div>
    </div>
  );
}
