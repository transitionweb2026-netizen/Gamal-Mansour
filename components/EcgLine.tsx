/**
 * Decorative ECG trace echoing the heartbeat line in the logo. The trace draws in once on load.
 * Purely visual: hidden from assistive technology.
 */
export function EcgLine({
  className = "",
  strokeWidth = 2,
  gradientId,
  from = "#ff7aa0",
  to = "#c9a2ff",
  delay = 0,
  animate = true,
}: {
  className?: string;
  strokeWidth?: number;
  gradientId: string;
  from?: string;
  to?: string;
  delay?: number;
  animate?: boolean;
}) {
  return (
    <svg viewBox="0 0 600 80" fill="none" preserveAspectRatio="none" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={from} stopOpacity="0" />
          <stop offset="0.18" stopColor={from} />
          <stop offset="0.82" stopColor={to} />
          <stop offset="1" stopColor={to} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 46 H210 L222 46 L232 30 L244 58 L262 6 L282 76 L298 40 L308 46 H380 L390 40 L398 50 L406 46 H600"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        pathLength={1}
        strokeDasharray={1}
        className={animate ? "animate-ecg" : undefined}
        style={animate ? { animationDelay: `${delay}ms` } : undefined}
      />
    </svg>
  );
}
