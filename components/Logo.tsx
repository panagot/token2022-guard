/**
 * Token2022 Guard mark: a polished gold shield (security) carrying the "22"
 * with a small ledger rule (audit workbook). Metallic sheen via a soft
 * gradient and a single top highlight. No glow.
 */
export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="t22-gold" x1="8" y1="3" x2="24" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6dd92" />
          <stop offset="0.45" stopColor="#e0ad48" />
          <stop offset="1" stopColor="#bd861f" />
        </linearGradient>
      </defs>
      <path
        d="M16 3.2 25.8 6.7V14.9C25.8 21.1 21.4 25.6 16 27.6 10.6 25.6 6.2 21.1 6.2 14.9V6.7L16 3.2Z"
        fill="url(#t22-gold)"
        stroke="#8a6320"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <path
        d="M16 4.6 24.4 7.6V9.4C20 7.9 12 7.9 7.6 9.4V7.6L16 4.6Z"
        fill="#fff"
        fillOpacity="0.32"
      />
      <text
        x="16"
        y="18.7"
        textAnchor="middle"
        fontFamily="'IBM Plex Mono', ui-monospace, monospace"
        fontSize="9.5"
        fontWeight="600"
        fill="#3a2a0c"
        letterSpacing="-0.5"
      >
        22
      </text>
      <line
        x1="11.6"
        y1="21"
        x2="20.4"
        y2="21"
        stroke="#3a2a0c"
        strokeOpacity="0.5"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}
