export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/v1/auth/login',
    ME: '/v1/auth/me',
  },
  TICKETS: {
    LIST: '/v1/tickets',
    BY_ID: (id: number | string) => `/v1/tickets/${id}`,
    STATUS: (id: number | string) => `/v1/tickets/${id}/status`,
    ASSIGN: (id: number | string) => `/v1/tickets/${id}/assign`,
  },
} as const;
