export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label="BariBite logo"
      fill="none"
    >
      {/* leaf body */}
      <path
        d="M150 330 C150 214 244 142 366 142 C366 252 286 330 188 330 Z"
        fill="currentColor"
      />
      {/* central vein */}
      <path
        d="M188 330 C226 280 300 206 366 142"
        stroke="hsl(var(--background))"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* spoon stem */}
      <path
        d="M186 318 L186 372"
        stroke="currentColor"
        strokeWidth="26"
        strokeLinecap="round"
      />
      {/* spoon bowl */}
      <ellipse cx="186" cy="392" rx="34" ry="26" fill="currentColor" />
      {/* coral safety accent */}
      <circle cx="186" cy="392" r="13" fill="hsl(var(--coral))" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark className="h-7 w-7 text-primary" />
      <span className="text-lg font-bold tracking-tight text-foreground">
        Bari<span className="text-primary">Bite</span>
      </span>
    </div>
  );
}
