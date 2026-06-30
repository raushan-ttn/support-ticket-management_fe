'use client';

import { useState } from 'react';
import { BellIcon, CloseIcon, GridIcon, HelpIcon, SearchIcon } from '@/components/common/globalSvg';
import styles from './header.module.scss';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');

  function handleClearSearch() {
    setSearchQuery('');
  }

  return (
    <header className={styles.header}>
      <div className={styles.searchWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search for Newers, Posts and Hashtags"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search for Newers, Posts and Hashtags"
        />
        {searchQuery ? (
          <button
            type="button"
            className={styles.clearButton}
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            <CloseIcon />
          </button>
        ) : null}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.iconButton} aria-label="Help">
          <HelpIcon />
        </button>

        <button type="button" className={styles.iconButton} aria-label="Notifications">
          <BellIcon />
          <span className={styles.badge}>3</span>
        </button>

        <button type="button" className={styles.iconButton} aria-label="Apps">
          <GridIcon />
        </button>

        <div className={styles.avatarPlaceholder} aria-label="User profile" role="img">
          U
        </div>
      </div>
    </header>
  );
}
