import { ProductMotion } from "./ProductMotion";
import styles from "./ProductPreviews.module.css";

function CameraScene({ index }: { index: number }) {
  return <svg viewBox="0 0 240 140" className={styles.cameraScene} fill="none">
    <path d="M0 0H240V140H0Z" fill="#0b0f16" />
    <path d="M0 110 105 54 240 104V140H0Z" fill="#222c38" />
    <path d="M0 12 105 40V90L0 126Z" fill="#17212b" />
    <path d="m105 40 135-22v108L105 90Z" fill="#111823" />
    {[0,1,2,3,4].map(i => <g key={i}><path d={`M${i*50} 140 110 76M${i*50} 0 105 42`} stroke="#647181" strokeOpacity=".3" /><path d={`M${125+i*23} 43v34`} stroke="#bcc4ce" strokeOpacity=".3" strokeWidth="7" /></g>)}
    <path d="M22 102 60 82 82 86 46 110Z" fill="#485360" />
    <path d="M22 102v10l24 11v-13m0 13 36-26V86" fill="#111823" />
    <ellipse cx={151 + index * 6} cy="77" rx="4" ry="5" fill="#9aa5b3" />
    <path d={`M${151+index*6} 82v16m-5-12h10m-5 12-5 10m5-10 5 10`} stroke="#9aa5b3" strokeWidth="3" />
    <g className={styles.detection}><rect x={139+index*6} y="67" width="26" height="46" stroke="var(--detection-cyan)" /><path d={`M${139+index*6} 64h26`} stroke="var(--detection-cyan)" strokeWidth="3" /></g>
    <path d="M0 139H240" stroke="var(--crimson)" strokeOpacity=".5" />
  </svg>;
}

export function SentinelPreview() {
  return <ProductMotion>
    <div className={styles.sentinelStage}>
      <svg className={styles.camera} viewBox="0 0 220 170" fill="none"><path d="m15 35 122-22 60 42-9 53-105 12-69-37Z" fill="#17212b" stroke="#485360" /><path d="m137 13 60 42-55 29-65-49Z" fill="#222c38" /><ellipse cx="162" cy="77" rx="35" ry="40" fill="#07090d" stroke="#485360" /><ellipse cx="162" cy="77" rx="23" ry="28" fill="#121925" stroke="#a50f28" /><ellipse cx="162" cy="77" rx="12" ry="16" fill="#07090d" stroke="#ef3340" /><circle cx="167" cy="72" r="5" fill="#ef3340" /><path d="m71 116-1 24H42v19h49l5-46" fill="#17212b" stroke="#485360" /></svg>
      <div className={styles.sentinelDevice}>
        <div className={styles.sidebar}>
          <div className={styles.brand}><span>◈</span> Sentinel</div>
          <span className={styles.selected}>◉ Camera view</span><span>▤ Events</span><span>♧ Alerts</span><span>⌕ Search</span><span>▥ Analytics</span><span>⊞ Devices</span><span className={styles.settings}>⚙ Settings</span>
        </div>
        <div className={styles.sentinelWorkspace}>
          <span className={styles.demoLabel}>Illustrative camera views · sample activity</span>
          <div className={styles.cameraGrid}>{["Parking area", "Entrance", "Warehouse", "Loading area"].map((name, index) => <div className={styles.cameraTile} key={name}><div><i />Camera {String(index+1).padStart(2,"0")} · {name}</div><CameraScene index={index} /></div>)}</div>
          <div className={styles.analytics}>
            <div className={styles.panel}><span>Event review</span><b className={styles.alertSymbol}>♧</b><small>Context for action</small></div>
            <div className={styles.panel}><span>Activity patterns</span><svg viewBox="0 0 130 60" className={styles.activityGraph}><path d="m2 53 15-13 11 5 12-21 14 14 10-12 13 18 14-29 12 11 23-21" fill="none" stroke="var(--crimson)" strokeWidth="2" /></svg><small>Illustrative trend</small></div>
            <div className={styles.panel}><span>Connected views</span><div className={styles.statusRing} /><small>Operational context</small></div>
          </div>
        </div>
      </div>
    </div>
  </ProductMotion>;
}
