import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { getListItems } from '@/lib/list-response';
import { baseApi } from '@/services/baseApi';

export interface Comment {
  id: number;
  ticketId: number;
  content: string;
  authorId: string;
  authorName?: string;
  createdAt: string;
}

export interface CommentsResponse {
  data: Comment[];
}

export interface CreateCommentPayload {
  ticketId: number;
  content: string;
}

export interface DeleteCommentPayload {
  ticketId: number;
  commentId: number;
}

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query<CommentsResponse, number>({
      query: (ticketId) => ({ url: API_ENDPOINTS.COMMENTS.BY_TICKET(ticketId) }),
      providesTags: (result, _err, ticketId) => {
        const comments = getListItems<Comment>(result);
        return [
          ...comments.map(({ id }) => ({ type: 'Comment' as const, id })),
          { type: 'Comment', id: `LIST-${ticketId}` },
        ];
      },
    }),

    createComment: builder.mutation<Comment, CreateCommentPayload>({
      query: ({ ticketId, content }) => ({
        url: API_ENDPOINTS.COMMENTS.BY_TICKET(ticketId),
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (_result, _err, { ticketId }) => [
        { type: 'Comment', id: `LIST-${ticketId}` },
      ],
    }),

    deleteComment: builder.mutation<void, DeleteCommentPayload>({
      query: ({ ticketId, commentId }) => ({
        url: API_ENDPOINTS.COMMENTS.BY_ID(ticketId, commentId),
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { ticketId, commentId }) => [
        { type: 'Comment', id: commentId },
        { type: 'Comment', id: `LIST-${ticketId}` },
      ],
    }),
  }),
});

export const {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
