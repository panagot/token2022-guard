/** Inline logo — avoids /icon.svg route conflict with Next.js app/icon.svg metadata. */
export function Logo({ size = 28 }: { size?: number }) {
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
        <linearGradient id="logo-shield" x1="6" y1="4" x2="26" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="#07090b" />
      <path
        d="M16 5.5 24.5 9.5V15.8c0 4.9-4.2 8.8-8.5 10.7C11.7 24.6 7.5 20.7 7.5 15.8V9.5L16 5.5Z"
        fill="url(#logo-shield)"
      />
      <path
        fill="#07090b"
        d="M11.2 12.2h1.7v7.6h-1.7V12.2zm0 0h3.1v1.5h-3.1v-1.5zm0 3.05h3.1v1.5h-3.1v-1.5zm0 3.05h3.1v1.5h-3.1v-1.5z"
      />
      <path
        fill="#07090b"
        d="M18.1 12.2c2.4 0 2.9 1.35 2.9 2.35 0 1.15-.85 1.95-1.9 2.15 1.35.15 2.2 1.05 2.2 2.45 0 1.55-1.35 2.45-3.05 2.45h-2.45v-9.4h2.3zm-.15 1.45h-1.15v2.35h1.15c.95 0 1.35-.45 1.35-1.15 0-.7-.4-1.2-1.35-1.2zm-1.15 3.65h1.35c1 0 1.45.5 1.45 1.25 0 .75-.5 1.25-1.5 1.25h-1.3v-2.5z"
      />
    </svg>
  );
}
