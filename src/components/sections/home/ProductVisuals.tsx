import styles from "./ProductVisuals.module.css";

export function OpenJMVisual() {
  return <div className={styles.openjm} aria-hidden="true">
    <svg viewBox="0 0 620 270" fill="none">
      <defs>
        <radialGradient id="openjm-glow">
          <stop stopColor="#2356FF" stopOpacity=".22" />
          <stop offset="1" stopColor="#2356FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="openjm-line">
          <stop stopColor="#2356FF" stopOpacity=".1" />
          <stop offset=".5" stopColor="#7ED9FF" stopOpacity=".7" />
          <stop offset="1" stopColor="#2356FF" stopOpacity=".1" />
        </linearGradient>
      </defs>
      <ellipse cx="310" cy="140" rx="265" ry="140" fill="url(#openjm-glow)" />
      {[65, 91, 119].map(r => <ellipse key={r} cx="310" cy="140" rx={r * 1.5} ry={r * .7} stroke="url(#openjm-line)" transform="rotate(-22 310 140)" />)}
      <path d="M70 154h120m240-27h120M310 29v45m0 127v45" stroke="#7ED9FF" strokeOpacity=".25" strokeDasharray="3 7" />
      <rect x="269" y="99" width="82" height="82" rx="24" fill="#0E141D" stroke="#2356FF" strokeOpacity=".8" />
      <path d="M296 125v24c0 8-5 12-12 12m23-36v30m0-30 12 17 12-17v30" stroke="#F4F6F8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="#121925" stroke="#7ED9FF" strokeOpacity=".3">
        <rect x="127" y="56" width="48" height="48" rx="12" />
        <rect x="456" y="181" width="48" height="48" rx="12" />
        <circle cx="462" cy="69" r="18" />
        <circle cx="190" cy="217" r="6" fill="#2356FF" />
      </g>
      <g stroke="#BCC4CE" strokeWidth="1.4">
        <path d="M140 72h21m-21 6h16m-16 6h10M472 194h13l5 5v17h-18Zm13 0v6h5" />
        <path d="m456 69 4 4 8-9" />
      </g>
    </svg>
  </div>;
}

export function SentinelVisual() {
  return <div className={styles.sentinel} aria-hidden="true">
    <svg viewBox="0 0 620 270" fill="none">
      <defs>
        <radialGradient id="sentinel-glow">
          <stop stopColor="#EF3340" stopOpacity=".2" />
          <stop offset="1" stopColor="#EF3340" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="330" cy="150" rx="265" ry="150" fill="url(#sentinel-glow)" />
      <g stroke="#9AA5B3" strokeOpacity=".13">{[80, 130, 180, 230, 280, 330, 380, 430, 480, 530].map(x => <path key={x} d={`M310 70 ${x} 270`} />)}{[100, 130, 170, 220, 269].map(y => <path key={y} d={`M70 ${y}H550`} />)}</g>
      <rect x="104" y="38" width="412" height="205" rx="12" fill="#07090D" fillOpacity=".45" stroke="#F4F6F8" strokeOpacity=".15" />
      <g stroke="#7ED9FF" strokeOpacity=".45">
        <path d="M122 62v-8h14m-14 158v12h14m362-162v-8h-14m14 158v12h-14" />
      </g>
      <path d="m310 77 43 18v40c0 27-18 44-43 57-25-13-43-30-43-57V95Z" fill="#111823" stroke="#EF3340" strokeWidth="1.5" />
      <circle cx="310" cy="128" r="18" stroke="#EF3340" />
      <circle cx="310" cy="128" r="5" fill="#EF3340" />
      <g stroke="#FF6973" strokeOpacity=".8">
        <path d="M191 119v-12h12m-12 68v12h12m36-68v-12h-12m12 68v12h-12M384 153v-12h12m-12 62v12h12m36-62v-12h-12m12 62v12h-12" />
      </g>
      <g fill="#9AA5B3" fillOpacity=".3">
        <circle cx="215" cy="132" r="8" />
        <path d="M203 170v-19c0-12 24-12 24 0v19Z" />
        <circle cx="408" cy="165" r="7" />
        <path d="M397 201v-19c0-11 22-11 22 0v19Z" />
      </g>
    </svg>
  </div>;
}
