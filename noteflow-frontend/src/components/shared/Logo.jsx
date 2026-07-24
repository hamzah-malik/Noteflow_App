// Matches the reference: a rounded document with a folded corner, an
// open-padlock mark centered on it. Single SVG, currentColor-free so its
// two shades (base + fold) come from props, not the design-token accent -
// keeps the mark legible even if the accent color changes later.
export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6 4C6 2.89543 6.89543 2 8 2H20L26 8V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V4Z"
        fill="#4C6B3A"
      />
      <path d="M20 2L26 8H21C20.4477 8 20 7.55228 20 7V2Z" fill="#87A96B" />
      <g transform="translate(11, 12)">
        <rect x="2" y="5" width="8" height="6" rx="1.5" fill="white" />
        <path d="M4 5V3.5C4 2.11929 5.11929 1 6.5 1C7.5 1 8.35 1.6 8.75 2.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
