type ScrollFrame = { height: number; header: number };
const subscribers = new Set<(frame: ScrollFrame) => void>();
let pending = 0;
let teardown: (() => void) | undefined;

/** One event-driven frame for all scroll scenes and entrances. No idle loop. */
export function scheduleScrollFrame() {
  if (pending || document.hidden) return;
  pending = requestAnimationFrame(() => {
    pending = 0;
    const frame = { height: innerHeight, header: document.querySelector("header")?.getBoundingClientRect().height ?? 88 };
    subscribers.forEach(update => update(frame));
  });
}

export function subscribeScrollFrame(update: (frame: ScrollFrame) => void) {
  subscribers.add(update);
  if (!teardown) {
    const resize = new ResizeObserver(scheduleScrollFrame);
    resize.observe(document.body);
    const header = document.querySelector("header");
    if (header) resize.observe(header);
    window.addEventListener("scroll", scheduleScrollFrame, { passive: true });
    window.addEventListener("resize", scheduleScrollFrame);
    window.addEventListener("pageshow", scheduleScrollFrame);
    document.addEventListener("load", scheduleScrollFrame, true);
    document.addEventListener("visibilitychange", scheduleScrollFrame);
    document.fonts.addEventListener("loadingdone", scheduleScrollFrame);
    void document.fonts.ready.then(scheduleScrollFrame);
    teardown = () => {
      resize.disconnect();
      window.removeEventListener("scroll", scheduleScrollFrame);
      window.removeEventListener("resize", scheduleScrollFrame);
      window.removeEventListener("pageshow", scheduleScrollFrame);
      document.removeEventListener("load", scheduleScrollFrame, true);
      document.removeEventListener("visibilitychange", scheduleScrollFrame);
      document.fonts.removeEventListener("loadingdone", scheduleScrollFrame);
      cancelAnimationFrame(pending);
      pending = 0;
    };
  }
  scheduleScrollFrame();
  return () => {
    subscribers.delete(update);
    if (!subscribers.size) { teardown?.(); teardown = undefined; }
  };
}

export const clampProgress = (value: number) => Math.max(0, Math.min(1, value));
