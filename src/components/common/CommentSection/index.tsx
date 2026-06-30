'use client';

import { useState } from 'react';
import Comment, { type CommentData } from './dependencies/Comment';
import styles from './comment-section.module.scss';

interface CommentSectionProps {
  readonly comments: CommentData[];
}

export default function CommentSection({ comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [inputValue, setInputValue] = useState('');

  function handleSend() {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newComment: CommentData = {
      id: Date.now(),
      ticketId: comments[0]?.ticketId ?? 0,
      authorName: 'You',
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    setComments((prev) => [...prev, newComment]);
    setInputValue('');
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.loadPrevious}>
        Load Previous Comments
      </button>

      <div className={styles.commentList} role="list">
        {comments.map((comment) => (
          <div key={comment.id} role="listitem">
            <Comment comment={comment} />
          </div>
        ))}
      </div>

      <div className={styles.inputRow}>
        <textarea
          className={styles.input}
          placeholder="Add Comment..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          aria-label="Add a comment"
        />
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSend}
          aria-label="Send comment"
          disabled={!inputValue.trim()}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
