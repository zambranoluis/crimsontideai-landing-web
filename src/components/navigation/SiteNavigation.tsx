"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, type ComponentProps, type ReactNode } from "react";

type ScrollRequest = {
  id: number;
  pathname: string;
  section: string;
  kind: "route-top" | "cross-route-section" | "same-page-section" | "direct-anchor";
  needsTop: boolean;
};
const NavigationContext = createContext<((href: string) => void) | null>(null);
const RouteReadyContext = createContext<((main: HTMLElement) => () => void) | null>(null);

function focusHeading(target: HTMLElement) {
  const heading = target.matches("h1, h2, h3") ? target : target.querySelector<HTMLElement>("h1, h2, h3");
  const focusTarget = heading ?? target;
  if (!focusTarget.hasAttribute("tabindex")) {
    focusTarget.setAttribute("tabindex", "-1");
    focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
  }
  focusTarget.focus({ preventScroll: true });
}

export function SiteNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const sequence = useRef(0);
  const pending = useRef<ScrollRequest | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const connected = useRef(true);
  const readyMain = useRef<HTMLElement | null>(null);

  const cancel = useCallback(() => {
    cleanup.current?.();
    cleanup.current = null;
    pending.current = null;
  }, []);

  const position = useCallback(() => {
    const request = pending.current;
    const main = readyMain.current;
    if (!request || !connected.current || request.needsTop || !main || main.dataset.navigationRoute !== request.pathname) return;
    cleanup.current?.();
    if (request.kind === "route-top") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      focusHeading(main);
      cancel();
      return;
    }

    let frame = 0;
    let disposed = false;
    let scrolling = false;
    let previousGeometry = "";
    let stableFrames = 0;
    let startedAt = 0;
    let startY = 0;
    let duration = 0;
    const apply = (now: number) => {
      if (disposed || !connected.current || pending.current?.id !== request.id) return;
      if (!main.isConnected || !main.getClientRects().length || window.location.pathname !== request.pathname) return;
      const target = request.section !== main.id
        ? Array.from(main.querySelectorAll<HTMLElement>("[id]")).find(element => element.id === request.section)
        : main;
      if (target?.getClientRects().length) {
        const rect = target.getBoundingClientRect();
        const padding = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
          + (parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
        const top = rect.top + window.scrollY;
        const height = document.documentElement.scrollHeight;
        // Hydrated sticky scenes can change both the target and page height.
        // Two matching frames after fonts are ready also give the top a paint.
        const geometry = [Math.round(top), Math.round(rect.height), height, padding].join(":");
        stableFrames = geometry === previousGeometry ? stableFrames + 1 : 1;
        previousGeometry = geometry;
        if (!scrolling && stableFrames >= 2) {
          focusHeading(target);
          const smooth = request.kind !== "direct-anchor" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (!smooth) {
            target.scrollIntoView({ block: "start", behavior: "instant" });
            cancel();
            return;
          }
          startY = window.scrollY;
          startedAt = now;
          duration = Math.min(1000, Math.max(300, Math.abs(top - padding - startY) * 0.35));
          scrolling = true;
        } else if (scrolling) {
          const destination = Math.max(0, Math.min(top - padding, height - window.innerHeight));
          const progress = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : Math.min(1, (now - startedAt) / duration);
          const eased = 1 - (1 - progress) ** 3;
          const nextY = startY + (destination - startY) * eased;
          const arrived = Math.abs(destination - nextY) < 2;
          // Own the frames, not a browser smooth-scroll animation: a native
          // animation can survive popstate and overwrite history restoration.
          window.scrollTo({ top: arrived ? destination : nextY, behavior: "instant" });
          if (arrived) { cancel(); return; }
        }
      }
      frame = requestAnimationFrame(apply);
    };

    const timeout = setTimeout(cancel, 15_000);
    cleanup.current = () => {
      disposed = true;
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
    void document.fonts.ready.then(() => {
      if (!disposed) frame = requestAnimationFrame(apply);
    });
  }, [cancel]);

  const routeReady = useCallback((main: HTMLElement) => {
    readyMain.current = main;
    const request = pending.current;
    if (request && request.pathname === main.dataset.navigationRoute && request.needsTop) {
      // This runs in the destination main's layout effect, including cached
      // page reactivation. Never reset the still-visible departing page.
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      request.needsTop = false;
    }
    position();
    return () => {
      if (readyMain.current !== main) return;
      readyMain.current = null;
      cleanup.current?.();
      cleanup.current = null;
    };
  }, [position]);

  const navigate = useCallback((href: string) => {
    const url = new URL(href, window.location.href);
    const cleanURL = url.pathname + url.search;
    const sameRoute = cleanURL === window.location.pathname + window.location.search
      && readyMain.current?.dataset.navigationRoute === url.pathname;
    const supersedesRoute = pending.current !== null && pending.current.pathname !== url.pathname;
    cancel();
    window.scrollTo({ top: window.scrollY, left: window.scrollX, behavior: "instant" });
    const section = decodeURIComponent(url.hash.slice(1));
    pending.current = {
      id: ++sequence.current,
      pathname: url.pathname,
      section,
      kind: !section ? "route-top" : sameRoute ? "same-page-section" : "cross-route-section",
      needsTop: !sameRoute,
    };
    if (!sameRoute || supersedesRoute) router.push(cleanURL, { scroll: false });
    else if (window.location.hash) window.history.replaceState(window.history.state, "", cleanURL);
    if (sameRoute) position();
  }, [cancel, position, router]);

  useEffect(() => {
    const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    // Native fragments retain their URLs and never replay the top-first phase.
    if (!window.location.hash || window.location.hash === "#main-content" || entry?.type === "back_forward" || pending.current) return;
    pending.current = {
      id: ++sequence.current,
      pathname: window.location.pathname,
      section: decodeURIComponent(window.location.hash.slice(1)),
      kind: "direct-anchor",
      needsTop: false,
    };
    position();
  }, [position]);

  useEffect(() => {
    connected.current = true;
    position();
    const interrupt = () => {
      if (pending.current?.section && !pending.current.needsTop) cancel();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable=true]")) return;
      if (["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) interrupt();
    };
    window.addEventListener("popstate", cancel);
    window.addEventListener("hashchange", cancel);
    window.addEventListener("wheel", interrupt, { passive: true });
    window.addEventListener("touchmove", interrupt, { passive: true });
    window.addEventListener("pointerdown", interrupt, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", cancel);
      window.removeEventListener("hashchange", cancel);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchmove", interrupt);
      window.removeEventListener("pointerdown", interrupt);
      window.removeEventListener("keydown", onKey);
      connected.current = false;
      cleanup.current?.();
      cleanup.current = null;
      // Retain requests across effect reconnection (including hydration).
      // Actual unmount releases these refs; disposed font promises cannot run.
    };
  }, [cancel, position]);

  return <NavigationContext.Provider value={navigate}>
    <RouteReadyContext.Provider value={routeReady}>{children}</RouteReadyContext.Provider>
  </NavigationContext.Provider>;
}

export function NavigationMain({ pathname, ...props }: ComponentProps<"main"> & { pathname: string }) {
  const main = useRef<HTMLElement>(null);
  const ready = useContext(RouteReadyContext);
  useLayoutEffect(() => {
    if (main.current) return ready?.(main.current);
  }, [pathname, ready]);
  return <main {...props} ref={main} data-navigation-route={pathname} />;
}

type InternalLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate" | "scroll"> & { href: string };

export function InternalLink({ href, ...props }: InternalLinkProps) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} href={href} scroll={false} prefetch={false} onNavigate={(event) => {
    // Next only invokes this for ordinary same-origin navigation, preserving
    // modifier keys, downloads, external URLs, and new-tab anchor fallbacks.
    if (!navigate) return;
    event.preventDefault();
    navigate(href);
  }} />;
}
