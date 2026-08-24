export default function BrandMark({ compact = false }) {
  return (
    <span className={`brand-mark ${compact ? "compact" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" role="img">
        <path d="M9 27.5 20 9l11 18.5" />
        <path d="M12.5 23h15M15.5 18h9" />
        <circle cx="20" cy="9" r="2.4" />
        <circle cx="9" cy="27.5" r="2.4" />
        <circle cx="31" cy="27.5" r="2.4" />
      </svg>
    </span>
  );
}
