export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'inProgress',
  CLOSED: 'closed',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];

export const TICKET_STATUS_SLUG = {
  [TICKET_STATUS.OPEN]: 'open',
  [TICKET_STATUS.IN_PROGRESS]: 'in-progress',
  [TICKET_STATUS.CLOSED]: 'closed',
} as const satisfies Record<TicketStatus, string>;

export type TicketStatusSlug = (typeof TICKET_STATUS_SLUG)[keyof typeof TICKET_STATUS_SLUG];

export const TICKET_STATUS_FROM_SLUG: Record<TicketStatusSlug, TicketStatus> = {
  open: TICKET_STATUS.OPEN,
  'in-progress': TICKET_STATUS.IN_PROGRESS,
  closed: TICKET_STATUS.CLOSED,
};

const VALID_SLUGS = Object.values(TICKET_STATUS_SLUG) as readonly string[];

export function isTicketStatusSlug(value: string): value is TicketStatusSlug {
  return VALID_SLUGS.includes(value);
}

export interface MockTicket {
  readonly id: number;
  readonly category: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TicketStatus;
  readonly createdAt: string;
}

export interface TicketStats {
  readonly open: number;
  readonly inProgress: number;
  readonly closed: number;
}

export function toTicketStatus(value: unknown): TicketStatus | undefined {
  if (typeof value !== 'string') return undefined;
  const allowed = Object.values(TICKET_STATUS) as readonly string[];
  return allowed.includes(value) ? (value as TicketStatus) : undefined;
}
