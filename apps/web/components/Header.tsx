"use client";

import styles from "./Header.module.css";

interface Props {
  onAdd: () => void;
}

export default function Header({ onAdd }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 2C6.13 2 3 5.13 3 9c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z"
              fill="white"
            />
            <circle cx="10" cy="9" r="2.5" fill="#3d7a35" />
          </svg>
        </div>
        <span className={styles.wordmark}>Nuzzle</span>
      </div>

      <nav className={styles.nav}>
        <a href="#" className={styles.navLink}>
          About
        </a>
        <button className={styles.addBtn} onClick={onAdd}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Add a location
        </button>
      </nav>
    </header>
  );
}
