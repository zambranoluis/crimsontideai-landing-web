"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import styles from "./Clients.module.css";

export type Partner = {
  name: string;
  src: string;
  width: number;
  height: number;
  visualWidth: string;
};

type Drag = {
  name: string;
  pointerId: number;
  pointerType: string;
  startX: number;
  startY: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  active: boolean;
  target: number;
};

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function insert(order: readonly Partner[], name: string, target: number) {
  const next = [...order];
  const source = next.findIndex((partner) => partner.name === name);
  const [partner] = next.splice(source, 1);
  next.splice(target, 0, partner);
  return next;
}

function Logo({ partner }: { partner: Partner }) {
  return <Image src={partner.src} alt={partner.name} width={partner.width} height={partner.height}
    draggable={false} sizes="(max-width: 767px) 42vw, (max-width: 1199px) 28vw, 16vw"
    style={{ "--logo-width": partner.visualWidth } as CSSProperties} />;
}

export function PartnerGrid({ partners }: { partners: readonly Partner[] }) {
  // SSR and the first hydration render are a readable list, with no dead controls.
  const enhanced = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const [order, setOrder] = useState(partners);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragging, setDragging] = useState<Drag | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const gridRef = useRef<HTMLUListElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const beforeLayout = useRef(new Map<string, DOMRect>());
  const focusAfterLayout = useRef<string | null>(null);

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (const tile of grid.querySelectorAll<HTMLElement>("[data-partner]")) {
      const before = beforeLayout.current.get(tile.dataset.partner!);
      tile.getAnimations().forEach((animation) => animation.cancel());
      const after = tile.getBoundingClientRect();
      if (before && !reduced && tile.dataset.dragging !== "true") {
        const x = before.left - after.left;
        const y = before.top - after.top;
        if (x || y) tile.animate([
          { transform: `translate(${x}px, ${y}px)` }, { transform: "translate(0, 0)" },
        ], { duration: 250, easing: "cubic-bezier(.2, .75, .2, 1)" });
      }
    }
    beforeLayout.current.clear();
    if (focusAfterLayout.current) {
      Array.from(grid.querySelectorAll<HTMLButtonElement>("button[data-logo]"))
        .find((button) => button.dataset.logo === focusAfterLayout.current)?.focus({ preventScroll: true });
      focusAfterLayout.current = null;
    }
  }, [order]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!enhanced || !grid) return;
    let committed = partners;
    let preview = partners;
    let selection: string | null = null;
    let drag: Drag | null = null;
    let frame = 0;
    let lastTime = 0;
    let suppressClick = false;
    let holdTimer: ReturnType<typeof setTimeout> | undefined;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");

    function showOrder(next: readonly Partner[]) {
      if (next.every((partner, index) => partner === preview[index])) return;
      beforeLayout.current = new Map(Array.from(grid!.querySelectorAll<HTMLElement>("[data-partner]"),
        (tile) => [tile.dataset.partner!, tile.getBoundingClientRect()]));
      preview = next;
      setOrder(next);
    }

    function select(name: string | null) {
      selection = name;
      setSelected(name);
    }

    function focus(name: string) {
      focusAfterLayout.current = name;
      const tile = Array.from(grid!.querySelectorAll<HTMLElement>("[data-partner]"))
        .find((element) => element.dataset.partner === name);
      tile?.querySelector("button")?.focus({ preventScroll: true });
    }

    // Read the untransformed slots: a moving logo must never move its hit target.
    function targetAt(x: number, y: number) {
      const rect = grid!.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return -1;
      return Array.from(grid!.children).findIndex((child) => {
        const tile = child as HTMLElement;
        const left = rect.left + grid!.clientLeft + tile.offsetLeft;
        const top = rect.top + grid!.clientTop + tile.offsetTop;
        return x >= left && x <= left + tile.offsetWidth && y >= top && y <= top + tile.offsetHeight;
      });
    }

    function updateTarget() {
      if (!drag?.active) return;
      const target = targetAt(drag.x, drag.y);
      grid!.dataset.dropValid = String(target >= 0);
      if (target !== drag.target) {
        drag.target = target;
        showOrder(target < 0 ? committed : insert(committed, drag.name, target));
        if (target >= 0) setAnnouncement(`${drag.name}, position ${target + 1} of ${partners.length}. Release to place.`);
      }
    }

    function tick(time: number) {
      if (!drag?.active) return;
      const dt = Math.min(time - (lastTime || time), 32) / 1000;
      lastTime = time;
      const rect = grid!.getBoundingClientRect();
      if (drag.x >= rect.left && drag.x <= rect.right && drag.y >= rect.top && drag.y <= rect.bottom) {
        const edge = 80;
        const speed = drag.y < edge ? -(edge - drag.y) / edge
          : drag.y > innerHeight - edge ? (drag.y - innerHeight + edge) / edge : 0;
        if (speed) window.scrollBy({ top: Math.max(-1, Math.min(1, speed)) * 540 * dt, behavior: "instant" });
      }
      if (ghostRef.current) ghostRef.current.style.transform = `translate(${drag.x - drag.offsetX}px, ${drag.y - drag.offsetY}px)`;
      updateTarget();
      frame = requestAnimationFrame(tick);
    }

    function finish(cancel: boolean) {
      const current = drag;
      drag = null;
      clearTimeout(holdTimer);
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      if (!current?.active) return;
      suppressClick = true;
      const target = targetAt(current.x, current.y);
      if (!cancel && target >= 0) {
        committed = insert(committed, current.name, target);
        setAnnouncement(`${current.name} moved to position ${target + 1} of ${partners.length}.`);
      } else {
        setAnnouncement(`Move cancelled. ${current.name} remains at position ${committed.findIndex((partner) => partner.name === current.name) + 1} of ${partners.length}.`);
      }
      showOrder(committed);
      setDragging(null);
      delete grid!.dataset.dropValid;
      if (grid!.hasPointerCapture(current.pointerId)) grid!.releasePointerCapture(current.pointerId);
      focus(current.name);
    }

    function cancel() {
      const hadSelection = selection !== null;
      finish(true);
      select(null);
      if (hadSelection) setAnnouncement("Selection cancelled. Order unchanged.");
    }

    function buttonFrom(event: Event) {
      return event.target instanceof Element ? event.target.closest<HTMLButtonElement>("button[data-logo]") : null;
    }

    function onDown(event: PointerEvent) {
      suppressClick = false;
      if (drag || !event.isPrimary || event.button !== 0) return;
      const button = buttonFrom(event);
      if (!button || !grid!.contains(button)) return;
      const rect = button.getBoundingClientRect();
      drag = {
        name: button.dataset.logo!, pointerId: event.pointerId, pointerType: event.pointerType,
        startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY,
        offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top,
        width: rect.width, height: rect.height, active: false, target: -1,
      };
      if (event.pointerType !== "mouse") holdTimer = setTimeout(startDrag, 350);
    }

    function startDrag() {
      if (!drag || drag.active) return;
      drag.active = true;
      select(null);
      focus(drag.name);
      grid!.setPointerCapture(drag.pointerId);
      setDragging({ ...drag });
      setAnnouncement(`${drag.name} picked up. Move to a position and release. Escape cancels.`);
      frame = requestAnimationFrame(tick);
    }

    function onMove(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      drag.x = event.clientX;
      drag.y = event.clientY;
      if (!drag.active && Math.hypot(drag.x - drag.startX, drag.y - drag.startY) >= 6) {
        if (drag.pointerType !== "mouse") {
          finish(true);
          return;
        }
        startDrag();
      }
      if (drag.active) {
        event.preventDefault();
        updateTarget();
      }
    }

    function onUp(event: PointerEvent) {
      if (!drag || event.pointerId !== drag.pointerId) return;
      drag.x = event.clientX;
      drag.y = event.clientY;
      finish(false);
    }

    function onCancel(event: PointerEvent) {
      if (drag?.pointerId === event.pointerId) finish(true);
    }

    function onLostCapture(event: PointerEvent) {
      // Touch transfers implicit capture from the button to the stable grid.
      if (event.target === grid) onCancel(event);
    }

    function onTouchMove(event: TouchEvent) {
      // Only a completed hold claims the gesture; an ordinary swipe stays native.
      if (event.touches.length > 1) {
        finish(true);
        return;
      }
      if (drag?.active && event.cancelable) event.preventDefault();
    }

    function onContextMenu(event: MouseEvent) {
      if (drag?.pointerType !== "mouse" && drag?.active) event.preventDefault();
    }

    function onClick(event: MouseEvent) {
      if (suppressClick && event.detail !== 0) {
        suppressClick = false;
        event.preventDefault();
        return;
      }
      const button = buttonFrom(event);
      if (!button || drag?.active) return;
      const name = button.dataset.logo!;
      if (selection === name) {
        select(null);
        setAnnouncement("Selection cancelled. Order unchanged.");
      } else if (selection) {
        const source = selection;
        const target = committed.findIndex((partner) => partner.name === name);
        committed = insert(committed, source, target);
        showOrder(committed);
        select(null);
        focus(source);
        setAnnouncement(`${source} moved to position ${target + 1} of ${partners.length}.`);
      } else {
        select(name);
        setAnnouncement(`${name} selected, position ${committed.findIndex((partner) => partner.name === name) + 1} of ${partners.length}. Choose another logo to insert it there. Escape cancels.`);
      }
    }

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && (drag || selection)) {
        event.preventDefault();
        cancel();
      }
    }
    function onVisibility() { if (document.hidden) cancel(); }
    function stopAnimations() { grid!.getAnimations({ subtree: true }).forEach((animation) => animation.cancel()); }
    function onResize() { finish(true); stopAnimations(); }

    grid.addEventListener("pointerdown", onDown);
    grid.addEventListener("click", onClick);
    grid.addEventListener("lostpointercapture", onLostCapture);
    grid.addEventListener("touchmove", onTouchMove, { passive: false });
    grid.addEventListener("contextmenu", onContextMenu);
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onCancel);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onVisibility);
    motion.addEventListener("change", stopAnimations);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(holdTimer);
      grid.removeEventListener("pointerdown", onDown);
      grid.removeEventListener("click", onClick);
      grid.removeEventListener("lostpointercapture", onLostCapture);
      grid.removeEventListener("touchmove", onTouchMove);
      grid.removeEventListener("contextmenu", onContextMenu);
      if (drag && grid.hasPointerCapture(drag.pointerId)) grid.releasePointerCapture(drag.pointerId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onCancel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
      motion.removeEventListener("change", stopAnimations);
      stopAnimations();
    };
  }, [enhanced, partners]);

  const draggedPartner = dragging ? partners.find((partner) => partner.name === dragging.name) : null;
  return <>
    {enhanced && <p id="partner-instructions" className={styles.srOnly}>
      Select a logo, then another to move it there. Use Enter or Space to select. Escape cancels.
      You can also drag, or touch and hold to drag. Order resets when you leave this page.
    </p>}
    <ul ref={gridRef} className={styles.logoGrid} aria-label="Partner logos" aria-describedby={enhanced ? "partner-instructions" : undefined}
      data-partner-grid data-enhanced={enhanced} data-drag-active={dragging !== null}>
      {order.map((partner, index) => <li key={partner.name} className={styles.logoSlot} data-partner={partner.name} data-dragging={dragging?.name === partner.name}>
        {enhanced ? <button type="button" className={styles.logoItem} data-logo={partner.name}
          aria-label={`${partner.name}, position ${index + 1} of ${partners.length}`} aria-pressed={selected === partner.name}
          aria-describedby="partner-instructions">
          <Logo partner={partner} />
        </button> : <div className={styles.logoItem}><Logo partner={partner} /></div>}
      </li>)}
    </ul>
    {enhanced && <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>}
    {dragging && draggedPartner && createPortal(<div ref={ghostRef} className={`${styles.logoItem} ${styles.dragGhost}`} aria-hidden="true"
      style={{ width: dragging.width, height: dragging.height, transform: `translate(${dragging.x - dragging.offsetX}px, ${dragging.y - dragging.offsetY}px)` }}>
      <Logo partner={draggedPartner} />
    </div>, document.body)}
  </>;
}
