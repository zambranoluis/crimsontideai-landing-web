import { ProductMotion } from "./ProductMotion";
import styles from "./ProductPreviews.module.css";

export function OpenJMPreview() {
  return <ProductMotion>
    <div className={styles.openjmStage}>
      <div className={styles.openjmDevice}>
        <div className={styles.sidebar}>
          <div className={styles.brand}><span>‹</span> OpenJM</div>
          <span className={styles.selected}>＋ New chat</span>
          <span>◷ History</span><span>▤ Files</span><span>⌘ Tools</span><span>⊞ Apps</span>
          <span className={styles.settings}>⚙ Settings</span>
        </div>
        <div className={styles.workspace}>
          <span className={styles.demoLabel}>Illustrative workspace</span>
          <div className={styles.greeting}>How can I help <em>you</em> today?</div>
          <div className={styles.search}>⌕ &nbsp; Ask anything or add context <span>↗</span></div>
          <div className={styles.workspaceCards}>
            <div className={styles.panel}><span>Recent files</span>
              {[['PDF', 'Project brief.pdf'], ['XLS', 'Research notes.xlsx'], ['DOC', 'Working draft.docx']].map(([type, name]) => <div className={styles.file} key={type}><b>{type}</b><span>{name}<small>Sample document</small></span></div>)}
              <span className={styles.quiet}>Your context, connected</span>
            </div>
            <div className={styles.panel}><span>From ideas to outcomes</span>
              <svg className={styles.ideaGraph} viewBox="0 0 200 112" fill="none"><path d="M8 94 38 70 66 78 96 39 125 54 155 20 191 10" stroke="var(--crimson)" strokeWidth="2" />{[[8,94],[38,70],[66,78],[96,39],[125,54],[155,20],[191,10]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" fill="var(--crimson)" />)}</svg>
              <div className={styles.insight}><i />Explore a question</div><div className={styles.insight}><i />Connect information</div><div className={styles.insight}><i />Develop an idea</div>
            </div>
          </div>
          <div className={styles.composer}>Message OpenJM…<div><span>♧ &nbsp; ▧ &nbsp; &lt;/&gt;</span><b>↑</b></div></div>
        </div>
      </div>
      <div className={styles.deviceBase} />
    </div>
  </ProductMotion>;
}
