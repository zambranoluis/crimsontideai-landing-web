type Subscription = { active: boolean; previous?: number; draw: (delta: number) => void; suspend: () => void };
type Host = {
  request: (callback: FrameRequestCallback) => number;
  cancel: (id: number) => void;
  hidden: () => boolean;
  listen: (callback: () => void) => () => void;
};

export class MeshScheduler {
  private subscriptions = new Set<Subscription>();
  private frame: number | undefined;
  private unlisten?: () => void;
  constructor(private host: Host) {}

  private tick = (time: number) => {
    this.frame = undefined;
    if (!this.host.hidden()) for (const entry of this.subscriptions) {
      if (!entry.active) continue;
      const delta = entry.previous === undefined ? 0 : time - entry.previous;
      entry.previous = time;
      entry.draw(delta);
    }
    this.schedule();
  };

  private schedule = () => {
    const running = !this.host.hidden() && [...this.subscriptions].some(entry => entry.active);
    if (running && this.frame === undefined) this.frame = this.host.request(this.tick);
    if (!running && this.frame !== undefined) { this.host.cancel(this.frame); this.frame = undefined; }
  };

  private visibility = () => {
    for (const entry of this.subscriptions) { entry.previous = undefined; entry.suspend(); }
    this.schedule();
  };

  subscribe(draw: Subscription["draw"], suspend: Subscription["suspend"]) {
    const entry: Subscription = { active: false, draw, suspend };
    this.subscriptions.add(entry);
    this.unlisten ??= this.host.listen(this.visibility);
    return {
      setActive: (active: boolean) => {
        if (entry.active === active) return;
        entry.active = active;
        entry.previous = undefined;
        if (!active) entry.suspend();
        this.schedule();
      },
      dispose: () => {
        this.subscriptions.delete(entry);
        this.schedule();
        if (!this.subscriptions.size) { this.unlisten?.(); this.unlisten = undefined; }
      },
    };
  }
}

let shared: MeshScheduler | undefined;
export function meshScheduler() {
  return shared ??= new MeshScheduler({
    request: callback => requestAnimationFrame(callback),
    cancel: id => cancelAnimationFrame(id),
    hidden: () => document.hidden,
    listen: callback => {
      document.addEventListener("visibilitychange", callback);
      return () => document.removeEventListener("visibilitychange", callback);
    },
  });
}
