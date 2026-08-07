// Simple stylized bass silhouette for the header. Uses currentColor so it
// inherits whatever text color it's placed in (e.g. the accent).
export default function FishIcon({ size = 48, className = '' }) {
  return (
    <svg
      role="img"
      aria-label="Largemouth bass"
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      className={className}
      fill="currentColor"
    >
      {/* forked tail */}
      <path d="M22 30 L4 16 Q13 30 4 44 Z" />
      {/* body */}
      <path d="M20 30 Q40 11 70 20 Q86 25 96 30 Q86 35 70 40 Q40 49 20 30 Z" />
      {/* dorsal fin */}
      <path d="M48 17 Q58 5 68 18 Q58 16 48 17 Z" />
      {/* pectoral fin */}
      <path d="M60 33 Q66 44 74 37 Q68 35 60 33 Z" />
      {/* eye (punched out to background) */}
      <circle cx="83" cy="28" r="3.2" fill="var(--fish-eye, #0a1628)" />
    </svg>
  );
}
