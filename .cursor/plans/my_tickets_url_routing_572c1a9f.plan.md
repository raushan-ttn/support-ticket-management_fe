---
name: My Tickets URL Routing
overview: Add URL-based status filtering to the My Tickets page (`/tickets`, `/tickets/open`, `/tickets/in-progress`, `/tickets/closed`) and update mock data with 10 realistic ticket records.
todos:
  - id: update-json
    content: Update src/data/my-tickets.json with 10 realistic tickets (3 open, 4 inProgress, 3 closed) with descriptions and matching stats
    status: completed
  - id: update-detail-json
    content: Update src/data/ticket-detail.json with all 10 tickets (full fields) and 2-4 realistic comment threads per ticket
    status: completed
  - id: update-id-page
    content: Create src/app/tickets/status/[status]/page.tsx — single dynamic page that reads the status slug, maps it to TicketStatus, and renders TicketsPage with statusFilter prop
    status: completed
  - id: create-ticket-types
    content: Create src/types/ticket.ts with TICKET_STATUS as-const object and TicketStatusSlug helpers shared across the UI layer
    status: completed
  - id: update-tickets-page
    content: 'Update src/components/TicketsPage/index.tsx: add statusFilter prop, remove local StatFilter type (use shared TicketStatus), add URL navigation on card click, show all tickets when no filter'
    status: completed
isProject: false
---

# My Tickets URL-Based Status Filtering

## Route Architecture

**Final approach** — a single dynamic page under `/tickets/status/[status]/` eliminates all route conflicts.

```
/tickets                    → TicketsPage (all)           src/app/tickets/page.tsx          (unchanged)
/tickets/status/open        → TicketsPage (open)          src/app/tickets/status/[status]/page.tsx  ← NEW
/tickets/status/in-progress → TicketsPage (in-progress)   src/app/tickets/status/[status]/page.tsx
/tickets/status/closed      → TicketsPage (closed)        src/app/tickets/status/[status]/page.tsx
/tickets/67851              → TicketDetailPage            src/app/tickets/[id]/page.tsx     (unchanged)
```

Since `/tickets/status/[status]` is a completely different URL segment from `/tickets/[id]`, there is **zero route conflict**. `src/app/tickets/layout.tsx` already wraps all children under `/tickets/` — no additional layout file is needed for the new route.

## Key Changes

### 0. `src/types/ticket.ts` _(new file)_

Single source of truth for ticket status values used across all UI components. Per project rules, no TypeScript `enum` — use an `as const` object instead.

```ts
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'inProgress',
  CLOSED: 'closed',
} as const;

export type TicketStatus = (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
// → 'open' | 'inProgress' | 'closed'

export const TICKET_STATUS_SLUG = {
  [TICKET_STATUS.OPEN]: 'open',
  [TICKET_STATUS.IN_PROGRESS]: 'in-progress',
  [TICKET_STATUS.CLOSED]: 'closed',
} as const satisfies Record<TicketStatus, string>;

export type TicketStatusSlug = (typeof TICKET_STATUS_SLUG)[keyof typeof TICKET_STATUS_SLUG];
// → 'open' | 'in-progress' | 'closed'

export const TICKET_STATUS_FROM_SLUG: Record<TicketStatusSlug, TicketStatus> = {
  open: TICKET_STATUS.OPEN,
  'in-progress': TICKET_STATUS.IN_PROGRESS,
  closed: TICKET_STATUS.CLOSED,
};

const VALID_SLUGS = Object.values(TICKET_STATUS_SLUG) as readonly string[];

export function isTicketStatusSlug(value: string): value is TicketStatusSlug {
  return VALID_SLUGS.includes(value);
}
```

> **Note on `ticket-api.ts`**: The existing `TicketStatus` in `src/services/ticket-api.ts` is an API-contract type (`'open' | 'in_progress' | 'resolved' | 'closed'`, snake_case) and is intentionally different — it reflects the backend's values. The new `TicketStatus` in `src/types/ticket.ts` is the UI-layer type for the mock data and components. They live in separate files to avoid confusion.

### 1. `src/data/my-tickets.json`

Expand to 10 tickets (3 open, 4 inProgress, 3 closed) with realistic fields. Update `stats` to match counts.

```json
{
  "stats": { "open": 3, "inProgress": 4, "closed": 3 },
  "duration": "Last 6 Months",
  "tickets": [
    {
      "id": 68001,
      "category": "IT Support",
      "title": "Laptop not connecting to VPN",
      "description": "My laptop is unable to establish a VPN connection since this morning. The VPN client throws an authentication timeout error. I have already tried restarting the machine and reinstalling the client but the issue persists.",
      "status": "open",
      "createdAt": "2026-06-20T09:00:00.000Z"
    },
    {
      "id": 68002,
      "category": "HR",
      "title": "Leave balance discrepancy",
      "description": "My leave balance in the HR portal is showing 4 days of casual leave, but as per my records I should have 8 days remaining. Kindly reconcile the balance and correct it at the earliest.",
      "status": "open",
      "createdAt": "2026-06-18T11:30:00.000Z"
    },
    {
      "id": 68003,
      "category": "Payroll",
      "title": "Salary not credited for May",
      "description": "My May 2026 salary has not been credited to my bank account as of today. The usual credit date is the 5th of each month. Requesting immediate investigation and resolution.",
      "status": "open",
      "createdAt": "2026-06-15T08:00:00.000Z"
    },
    {
      "id": 67980,
      "category": "IT Support",
      "title": "Email access not working",
      "description": "I am unable to log in to my official email account. The Outlook app shows 'Cannot connect to server' and webmail login fails with a password error. This is blocking daily communication.",
      "status": "inProgress",
      "createdAt": "2026-06-10T14:00:00.000Z"
    },
    {
      "id": 67970,
      "category": "Admin",
      "title": "ID card replacement request",
      "description": "My employee ID card was damaged and is no longer scannable at the entry gate. I need a replacement card issued. Submitting this request along with a passport-size photograph.",
      "status": "inProgress",
      "createdAt": "2026-06-08T10:00:00.000Z"
    },
    {
      "id": 67960,
      "category": "Finance",
      "title": "Reimbursement pending approval",
      "description": "Travel reimbursement claim of ₹4,200 submitted on 28 May 2026 for the Mumbai client visit is still pending manager approval. Requesting escalation as it has exceeded the 10-day SLA.",
      "status": "inProgress",
      "createdAt": "2026-06-05T09:30:00.000Z"
    },
    {
      "id": 67950,
      "category": "Office Facilities",
      "title": "AC not working in bay 3",
      "description": "The central air conditioning unit in bay 3 (3rd floor) has stopped functioning since 1st June. The temperature is affecting team productivity. Requesting urgent maintenance check.",
      "status": "inProgress",
      "createdAt": "2026-06-01T08:00:00.000Z"
    },
    {
      "id": 67851,
      "category": "PF",
      "title": "Claim submitted for advance payment",
      "description": "PF advance claim for medical emergency submitted through the EPFO portal on 10 March 2026. Claim reference number: PF/ADV/2026/00431. Request has been processed and amount disbursed.",
      "status": "closed",
      "createdAt": "2026-03-18T12:03:00.000Z"
    },
    {
      "id": 67773,
      "category": "Office Facilities",
      "title": "Bike parking sticker request",
      "description": "Requested a parking sticker for my two-wheeler (registration: MH12AB1234) for the basement parking area. Sticker has been issued and handed over.",
      "status": "closed",
      "createdAt": "2026-03-13T10:00:00.000Z"
    },
    {
      "id": 67720,
      "category": "HR",
      "title": "Confirmation letter request",
      "description": "Requested an employment confirmation letter for bank loan processing. The letter should include designation, date of joining, and current CTC. Document has been generated and shared over email.",
      "status": "closed",
      "createdAt": "2026-02-28T09:00:00.000Z"
    }
  ]
}
```

### 2. `src/app/tickets/status/[status]/page.tsx` _(new)_

Single dynamic page. Reads the `status` slug, maps it to `TicketStatus` via `TICKET_STATUS_FROM_SLUG`, calls `notFound()` for any invalid slug, then renders `TicketsPage` with `statusFilter`.

```tsx
import { notFound } from 'next/navigation';
import TicketsPage from '@/components/TicketsPage';
import { isTicketStatusSlug, TICKET_STATUS_FROM_SLUG } from '@/types/ticket';

interface Props {
  params: Promise<{ status: string }>;
}

export default async function Page({ params }: Props) {
  const { status } = await params;
  if (!isTicketStatusSlug(status)) notFound();
  return <TicketsPage statusFilter={TICKET_STATUS_FROM_SLUG[status]} />;
}
```

`src/app/tickets/[id]/page.tsx` requires **no change** — it remains dedicated to ticket detail only.
`src/app/tickets/page.tsx` requires **no change** — renders `TicketsPage` with no `statusFilter` (all tickets).

### 3. `src/components/TicketsPage/index.tsx`

- Remove local `StatFilter` type — import `TicketStatus` and `TICKET_STATUS_SLUG` from `@/types/ticket`
- Add `interface TicketsPageProps { readonly statusFilter?: TicketStatus; }`
- Remove local `activeFilter` state — derive active card from `statusFilter` prop
- On `StatCard` click: navigate to `/tickets/{slug}`, or back to `/tickets` if the same card is clicked (toggle off)
- Filter logic: `statusFilter ? ticket.status === statusFilter : true` (all tickets when no filter)

```tsx
import { TICKET_STATUS, TICKET_STATUS_SLUG, type TicketStatus } from '@/types/ticket';

// STAT_CARDS uses TICKET_STATUS values — no magic strings
const STAT_CARDS: { key: TicketStatus; label: string }[] = [
  { key: TICKET_STATUS.OPEN, label: 'Open Tickets' },
  { key: TICKET_STATUS.IN_PROGRESS, label: 'In-Progress Tickets' },
  { key: TICKET_STATUS.CLOSED, label: 'Closed Tickets' },
];

function handleStatCardClick(key: TicketStatus) {
  if (statusFilter === key) {
    router.push('/tickets'); // toggle off → show all
  } else {
    router.push(`/tickets/status/${TICKET_STATUS_SLUG[key]}`); // navigate to filtered URL
  }
}
```

### 4. `src/data/ticket-detail.json`

Expand to all 10 tickets (matching IDs from `my-tickets.json`) with full detail fields (`type`, `subType`, `assignee`) and 2–4 realistic comments per ticket showing the full support conversation thread.

Comment author convention:

- `"Raushan Kumar"` — the logged-in agent (ticket submitter)
- Team name (e.g. `"IT Support Team"`, `"HR Team"`) — the handling team

```json
{
  "stats": { "open": 3, "inProgress": 4, "closed": 3 },
  "duration": "Last 6 Months",
  "tickets": [
    {
      "id": 68001,
      "title": "Laptop not connecting to VPN",
      "description": "My laptop is unable to establish a VPN connection since this morning. The VPN client throws an authentication timeout error. I have already tried restarting the machine and reinstalling the client but the issue persists.",
      "status": "open",
      "type": "IT Support",
      "subType": "Network / VPN",
      "assignee": "IT Support Team",
      "createdAt": "2026-06-20T09:00:00.000Z"
    },
    {
      "id": 68002,
      "title": "Leave balance discrepancy",
      "description": "My leave balance in the HR portal shows 4 days of casual leave but as per my records I should have 8 days remaining. Kindly reconcile and correct at the earliest.",
      "status": "open",
      "type": "HR",
      "subType": "Leave Balance",
      "assignee": "HR Team",
      "createdAt": "2026-06-18T11:30:00.000Z"
    },
    {
      "id": 68003,
      "title": "Salary not credited for May",
      "description": "My May 2026 salary has not been credited to my bank account as of today. The usual credit date is the 5th of each month. Requesting immediate investigation and resolution.",
      "status": "open",
      "type": "Payroll",
      "subType": "Salary Credit",
      "assignee": "Payroll Team",
      "createdAt": "2026-06-15T08:00:00.000Z"
    },
    {
      "id": 67980,
      "title": "Email access not working",
      "description": "I am unable to log in to my official email account. Outlook shows 'Cannot connect to server' and webmail login fails with a password error. This is blocking daily communication.",
      "status": "inProgress",
      "type": "IT Support",
      "subType": "Email / Outlook",
      "assignee": "IT Support Team",
      "createdAt": "2026-06-10T14:00:00.000Z"
    },
    {
      "id": 67970,
      "title": "ID card replacement request",
      "description": "My employee ID card was damaged and is no longer scannable at the entry gate. I need a replacement card issued. Submitting this request along with a passport-size photograph.",
      "status": "inProgress",
      "type": "Admin",
      "subType": "Access Card",
      "assignee": "Admin Team",
      "createdAt": "2026-06-08T10:00:00.000Z"
    },
    {
      "id": 67960,
      "title": "Reimbursement pending approval",
      "description": "Travel reimbursement claim of ₹4,200 submitted on 28 May 2026 for the Mumbai client visit is still pending manager approval. Requesting escalation as it has exceeded the 10-day SLA.",
      "status": "inProgress",
      "type": "Finance",
      "subType": "Travel Reimbursement",
      "assignee": "Finance Team",
      "createdAt": "2026-06-05T09:30:00.000Z"
    },
    {
      "id": 67950,
      "title": "AC not working in bay 3",
      "description": "The central air conditioning unit in bay 3 (3rd floor) has stopped functioning since 1st June. The temperature is affecting team productivity. Requesting urgent maintenance.",
      "status": "inProgress",
      "type": "Office Facilities",
      "subType": "HVAC / AC",
      "assignee": "Facilities Team",
      "createdAt": "2026-06-01T08:00:00.000Z"
    },
    {
      "id": 67851,
      "title": "Claim submitted for advance payment",
      "description": "PF advance claim for medical emergency submitted through the EPFO portal on 10 March 2026. Claim reference: PF/ADV/2026/00431. Request has been processed and amount disbursed.",
      "status": "closed",
      "type": "PF",
      "subType": "PF Information",
      "assignee": "HR Team",
      "createdAt": "2026-03-18T12:03:00.000Z"
    },
    {
      "id": 67773,
      "title": "Bike parking sticker request",
      "description": "Requested a parking sticker for my two-wheeler (MH12AB1234) for the basement parking area. Sticker has been issued and handed over.",
      "status": "closed",
      "type": "Office Facilities",
      "subType": "Parking",
      "assignee": "Admin Team",
      "createdAt": "2026-03-13T10:00:00.000Z"
    },
    {
      "id": 67720,
      "title": "Confirmation letter request",
      "description": "Requested an employment confirmation letter for bank loan processing, including designation, date of joining, and current CTC. Document has been generated and shared over email.",
      "status": "closed",
      "type": "HR",
      "subType": "Employment Letter",
      "assignee": "HR Team",
      "createdAt": "2026-02-28T09:00:00.000Z"
    }
  ],
  "comments": [
    // Ticket 68001 — VPN (open)
    {
      "id": 1,
      "ticketId": 68001,
      "authorName": "IT Support Team",
      "content": "Hi Raushan, thank you for raising this. Could you please share the exact error message and the VPN client version you are using? Also, let us know your OS version.",
      "createdAt": "2026-06-20T10:15:00.000Z"
    },
    {
      "id": 2,
      "ticketId": 68001,
      "authorName": "Raushan Kumar",
      "content": "Hi, I am using GlobalProtect v6.1 on Windows 11. The error reads: 'Gateway authentication failed (timeout)'. OS: Windows 11 22H2.",
      "createdAt": "2026-06-20T11:00:00.000Z"
    },
    {
      "id": 3,
      "ticketId": 68001,
      "authorName": "IT Support Team",
      "content": "Thank you for the details. We have identified a known issue with GP v6.1 and our SSO provider. A patch is being tested. We will update you once it is ready for deployment. Ticket is being tracked.",
      "createdAt": "2026-06-20T14:30:00.000Z"
    },

    // Ticket 68002 — Leave balance (open)
    {
      "id": 4,
      "ticketId": 68002,
      "authorName": "HR Team",
      "content": "Hi Raushan, thanks for reaching out. Could you please confirm your employee ID and the leave type for which you see a discrepancy?",
      "createdAt": "2026-06-18T12:00:00.000Z"
    },
    {
      "id": 5,
      "ticketId": 68002,
      "authorName": "Raushan Kumar",
      "content": "Employee ID: EMP2341. The discrepancy is for Casual Leave (CL). Portal shows 4 days but I have not availed any CL this year. Expected balance: 8 days.",
      "createdAt": "2026-06-18T13:15:00.000Z"
    },

    // Ticket 68003 — Salary (open)
    {
      "id": 6,
      "ticketId": 68003,
      "authorName": "Payroll Team",
      "content": "Hi Raushan, we have acknowledged your concern. Your bank account details and salary disbursement records are being verified. We will update you within 1 working day.",
      "createdAt": "2026-06-15T09:00:00.000Z"
    },
    {
      "id": 7,
      "ticketId": 68003,
      "authorName": "Raushan Kumar",
      "content": "Thank you. Please also check if there was any hold placed due to compliance verification this month.",
      "createdAt": "2026-06-15T09:45:00.000Z"
    },
    {
      "id": 8,
      "ticketId": 68003,
      "authorName": "Payroll Team",
      "content": "Noted. We are cross-checking with the finance team and the bank portal. Will revert by EOD.",
      "createdAt": "2026-06-15T11:00:00.000Z"
    },

    // Ticket 67980 — Email (inProgress)
    {
      "id": 9,
      "ticketId": 67980,
      "authorName": "IT Support Team",
      "content": "Hi Raushan, we have received your ticket. As a first step, please try resetting your password via the self-service portal at sso.company.com and attempt login again.",
      "createdAt": "2026-06-10T15:00:00.000Z"
    },
    {
      "id": 10,
      "ticketId": 67980,
      "authorName": "Raushan Kumar",
      "content": "I tried resetting the password but the issue persists. The SSO portal accepts the new password but Outlook still fails to connect.",
      "createdAt": "2026-06-10T16:30:00.000Z"
    },
    {
      "id": 11,
      "ticketId": 67980,
      "authorName": "IT Support Team",
      "content": "Understood. This appears to be a mailbox sync issue on our Exchange server. We have escalated to the Exchange admin team. Status updated to In-Progress. ETA: 24 hours.",
      "createdAt": "2026-06-11T09:00:00.000Z"
    },

    // Ticket 67970 — ID card (inProgress)
    {
      "id": 12,
      "ticketId": 67970,
      "authorName": "Admin Team",
      "content": "Hi Raushan, your request has been received. Please drop your damaged ID card at the Admin desk (Ground Floor) along with one passport-size photograph for verification.",
      "createdAt": "2026-06-08T11:00:00.000Z"
    },
    {
      "id": 13,
      "ticketId": 67970,
      "authorName": "Raushan Kumar",
      "content": "Done. I have submitted the card and photograph to the Admin desk today at 12:30 PM.",
      "createdAt": "2026-06-08T12:45:00.000Z"
    },
    {
      "id": 14,
      "ticketId": 67970,
      "authorName": "Admin Team",
      "content": "Confirmed receipt. The new ID card is being processed and will be ready within 3 working days.",
      "createdAt": "2026-06-08T14:00:00.000Z"
    },

    // Ticket 67960 — Reimbursement (inProgress)
    {
      "id": 15,
      "ticketId": 67960,
      "authorName": "Finance Team",
      "content": "Hi Raushan, we have noted your concern. The claim (ref: TRV/2026/5281) is currently awaiting secondary approval from your project manager. We have sent a reminder.",
      "createdAt": "2026-06-05T10:30:00.000Z"
    },
    {
      "id": 16,
      "ticketId": 67960,
      "authorName": "Raushan Kumar",
      "content": "Thank you. Could you please also escalate to the department head as this is exceeding the 10-day SLA?",
      "createdAt": "2026-06-05T11:00:00.000Z"
    },
    {
      "id": 17,
      "ticketId": 67960,
      "authorName": "Finance Team",
      "content": "Escalation has been done. The department head has been notified. We expect approval within today.",
      "createdAt": "2026-06-05T14:00:00.000Z"
    },

    // Ticket 67950 — AC (inProgress)
    {
      "id": 18,
      "ticketId": 67950,
      "authorName": "Facilities Team",
      "content": "Hi Raushan, we have logged a maintenance request for bay 3 AC unit. The vendor has been contacted for an urgent site visit.",
      "createdAt": "2026-06-01T09:30:00.000Z"
    },
    {
      "id": 19,
      "ticketId": 67950,
      "authorName": "Facilities Team",
      "content": "Update: The vendor visited today and identified a faulty compressor. Replacement part has been ordered. Estimated repair completion: 4 June 2026.",
      "createdAt": "2026-06-02T16:00:00.000Z"
    },

    // Ticket 67851 — PF advance (closed)
    {
      "id": 20,
      "ticketId": 67851,
      "authorName": "HR Team",
      "content": "Hi Raushan, can you please elaborate your concern for better understanding?",
      "createdAt": "2026-03-18T14:58:00.000Z"
    },
    {
      "id": 21,
      "ticketId": 67851,
      "authorName": "HR Team",
      "content": "Status updated to In-Progress.",
      "createdAt": "2026-03-18T14:59:00.000Z"
    },
    {
      "id": 22,
      "ticketId": 67851,
      "authorName": "HR Team",
      "content": "As discussed, there is a defined process for PF withdrawal and the PF office executives handle requests raised on the EPFO portal. You may refer to the PF manual in the Important Links section. Closing this ticket basis your confirmation.",
      "createdAt": "2026-03-18T15:18:00.000Z"
    },

    // Ticket 67773 — Parking sticker (closed)
    {
      "id": 23,
      "ticketId": 67773,
      "authorName": "Admin Team",
      "content": "Hi Raushan, your request for a parking sticker has been received. Kindly visit the Admin desk with your vehicle RC copy for verification.",
      "createdAt": "2026-03-13T11:00:00.000Z"
    },
    {
      "id": 24,
      "ticketId": 67773,
      "authorName": "Raushan Kumar",
      "content": "Done. I have submitted the RC copy at the Admin desk.",
      "createdAt": "2026-03-13T12:30:00.000Z"
    },
    {
      "id": 25,
      "ticketId": 67773,
      "authorName": "Admin Team",
      "content": "Verified. The parking sticker has been issued and handed over. Closing this ticket.",
      "createdAt": "2026-03-14T10:00:00.000Z"
    },

    // Ticket 67720 — Confirmation letter (closed)
    {
      "id": 26,
      "ticketId": 67720,
      "authorName": "HR Team",
      "content": "Hi Raushan, we have received your request for an employment confirmation letter. Could you please confirm the purpose — is this for a home loan or personal loan?",
      "createdAt": "2026-02-28T10:00:00.000Z"
    },
    {
      "id": 27,
      "ticketId": 67720,
      "authorName": "Raushan Kumar",
      "content": "It is for a home loan application at HDFC Bank. The letter should mention my designation, date of joining, and current gross CTC.",
      "createdAt": "2026-02-28T10:30:00.000Z"
    },
    {
      "id": 28,
      "ticketId": 67720,
      "authorName": "HR Team",
      "content": "The confirmation letter has been generated and sent to your official email ID. Please find it in your inbox. Closing this ticket.",
      "createdAt": "2026-03-01T11:00:00.000Z"
    }
  ]
}
```

> Note: The JSON above uses `//` comments for readability in the plan — the actual file will have valid JSON without comments.

## Files Changed

- [`src/types/ticket.ts`](src/types/ticket.ts) _(new)_ — `TICKET_STATUS` as-const object, `TicketStatus` type, slug helpers and `isTicketStatusSlug` guard
- [`src/data/my-tickets.json`](src/data/my-tickets.json) — 10 tickets with description, updated stats _(done)_
- [`src/data/ticket-detail.json`](src/data/ticket-detail.json) — all 10 tickets with full detail fields + 2–4 comments each _(done)_
- [`src/app/tickets/status/[status]/page.tsx`](src/app/tickets/status/[status]/page.tsx) _(new)_ — single dynamic page for `/tickets/status/{status}`
- [`src/app/tickets/[id]/page.tsx`](src/app/tickets/[id]/page.tsx) — **no change** (ticket detail only)
- [`src/components/TicketsPage/index.tsx`](src/components/TicketsPage/index.tsx) — imports shared `TicketStatus`; URL-driven filter (`/tickets/status/{slug}`), remove local StatFilter type
