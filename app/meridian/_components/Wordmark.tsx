/**
 * Meridian wordmark — a custom geometric mark (a sphere bisected by its
 * meridian) set against the Fraunces display face. No icon library.
 */
export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        color: "var(--m-ink)",
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10.2" stroke="currentColor" strokeWidth="1.4" />
        <ellipse cx="12" cy="12" rx="4.1" ry="10.2" stroke="currentColor" strokeWidth="1.4" />
        <line x1="1.8" y1="12" x2="22.2" y2="12" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="12" cy="12" r="1.7" fill="var(--m-accent)" />
      </svg>
      {!compact && (
        <span
          style={{
            fontFamily: "var(--m-display)",
            fontSize: "1.32rem",
            fontWeight: 500,
            letterSpacing: "-0.02em",
          }}
        >
          Meridian
        </span>
      )}
    </span>
  );
}
