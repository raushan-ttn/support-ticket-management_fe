export const API_VERSION = '/api/v1';
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_VERSION}/auth/login`,
    ME: `${API_VERSION}/auth/me`,
  },
  TICKETS: {
    LIST: `${API_VERSION}/tickets`,
    BY_ID: (id: number | string) => `${API_VERSION}/tickets/${id}`,
    STATUS: (id: number | string) => `${API_VERSION}/tickets/${id}/status`,
    ASSIGN: (id: number | string) => `${API_VERSION}/tickets/${id}/assign`,
  },
  COMMENTS: {
    BY_TICKET: (ticketId: number | string) => `${API_VERSION}/tickets/${ticketId}/comments`,
    BY_ID: (ticketId: number | string, commentId: number | string) =>
      `${API_VERSION}/tickets/${ticketId}/comments/${commentId}`,
  },
} as const;
