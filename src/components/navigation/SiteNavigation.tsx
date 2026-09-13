"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, type ComponentProps, type ReactNode } from "react";

type ScrollRequest = { id: number; pathname: string; section: string; smooth: boolean };
const NavigationContext = createContext<((href: string) => void) | null>(null);

export function SiteNavigation({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const sequence = useRef(0);
  const pending = useRef<ScrollRequest | null>(null);
  const cleanup = useRef<(() => void) | null>(null);
  const connected = useRef(true);

  const cancel = useCallback(() => {
    cleanup.current?.();
    cleanup.current = null;
    pending.current = null;
  }, []);

  const position = useCallback(() => {
    const request = pending.current;
    if (!request || !connected.current) return;
    cleanup.current?.();
    let frame = 0;
    const apply = () => {
      if (!connected.current || pending.current?.id !== request.id || window.location.pathname !== request.pathname) return;
      // Next can publish the pathname before replacing the old page, and can
      // retain hidden pages in its cache. Only target this route's visible main.
      const main = Array.from(document.querySelectorAll<HTMLElement>("main[data-navigation-route]"))
        .find(element => element.dataset.navigationRoute === request.pathname && element.getClientRects().length > 0);
      if (!main) return;
      const target = request.section && request.section !== main.id
        ? Array.from(main.querySelectorAll<HTMLElement>("[id]")).find(element => element.id === request.section)
        : main;
      if (!target || !target.getClientRects().length) return;
      const heading = target.matches("h1, h2, h3") ? target : target.querySelector<HTMLElement>("h1, h2, h3");
      const focusTarget = heading ?? target;
      // Focus reveals destination copy before scrolling, without a second jump.
      if (!focusTarget.hasAttribute("tabindex")) {
        focusTarget.setAttribute("tabindex", "-1");
        focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
      }
      focusTarget.focus({ preventScroll: true });
      const smooth = request.smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (request.section) target.scrollIntoView({ block: "start", behavior: smooth ? "smooth" : "instant" });
      else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      cancel();
    };

    // Run after the destination commit and native disclosure/layout updates.
    // If a streamed section is not mounted yet, observe only until it arrives.
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
    const timeout = setTimeout(cancel, 15_000);
    cleanup.current = () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      clearTimeout(timeout);
    };
    frame = requestAnimationFrame(apply);
  }, [cancel]);

  const navigate = useCallback((href: string) => {
    const url = new URL(href, window.location.href);
    const cleanURL = url.pathname + url.search;
    const sameRoute = cleanURL === window.location.pathname + window.location.search;
    const supersedesRoute = pending.current !== null && pending.current.pathname !== url.pathname;
    cancel();
    // Stop an earlier smooth scroll before starting the next request.
    window.scrollTo({ top: window.scrollY, left: window.scrollX, behavior: "instant" });
    pending.current = {
      id: ++sequence.current,
      pathname: url.pathname,
      section: decodeURIComponent(url.hash.slice(1)),
      smooth: sameRoute,
    };
    if (!sameRoute || supersedesRoute) router.push(cleanURL, { scroll: false });
    else if (window.location.hash) window.history.replaceState(window.history.state, "", cleanURL);
    if (sameRoute) position();
  }, [cancel, position, router]);

  useEffect(() => {
    if (pending.current?.pathname === pathname) position();
  }, [pathname, position]);

  useEffect(() => {
    const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    // A direct fragment may have been positioned before hydrated scenes gained
    // their height. Settle that initial anchor once; history owns Back/Forward.
    if (!window.location.hash || window.location.hash === "#main-content" || entry?.type === "back_forward" || pending.current) return;
    const request: ScrollRequest = {
      id: ++sequence.current,
      pathname: window.location.pathname,
      section: decodeURIComponent(window.location.hash.slice(1)),
      smooth: false,
    };
    pending.current = request;
    void document.fonts.ready.then(() => {
      if (pending.current?.id === request.id) position();
    });
  }, [position]);

  useEffect(() => {
    connected.current = true;
    if (pending.current?.pathname === window.location.pathname) position();
    window.addEventListener("popstate", cancel);
    window.addEventListener("hashchange", cancel);
    return () => {
      window.removeEventListener("popstate", cancel);
      window.removeEventListener("hashchange", cancel);
      connected.current = false;
      cleanup.current?.();
      cleanup.current = null;
      // Effect reconnection (including Strict Mode hydration) must retain a
      // click already received. Actual unmount releases this instance's refs;
      // connected prevents an outstanding fonts promise from scheduling work.
    };
  }, [cancel, position]);

  return <NavigationContext.Provider value={navigate}>{children}</NavigationContext.Provider>;
}

type InternalLinkProps = Omit<ComponentProps<typeof Link>, "href" | "onNavigate" | "scroll"> & { href: string };

export function InternalLink({ href, ...props }: InternalLinkProps) {
  const navigate = useContext(NavigationContext);
  return <Link {...props} href={href} prefetch={false} onNavigate={(event) => {
    // Next only invokes this for ordinary same-origin navigation, preserving
    // modifier keys, downloads, external URLs, and new-tab anchor fallbacks.
    if (!navigate) return;
    event.preventDefault();
    navigate(href);
  }} />;
}
