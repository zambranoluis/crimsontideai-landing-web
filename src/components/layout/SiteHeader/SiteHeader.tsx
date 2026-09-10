"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import styles from "./SiteHeader.module.css";

const links = [["Home", "/"], ["Products", "/products"], ["AI Solutions", "/solutions"], ["Work & Credibility", "/work"], ["Company", "/company"]] as const;
let pendingRouteScrollReset: string | null = null;

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState<boolean>();
  const menu = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLElement>(null);

  useEffect(() => {
    if (pendingRouteScrollReset !== pathname) return;
    pendingRouteScrollReset = null;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  useEffect(() => {
    const details = menu.current;
    if (!details) return;
    const close = (restoreFocus = false) => {
      if (!details.open) return;
      details.open = false;
      if (restoreFocus) toggle.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.contains(event.target)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.open) { event.preventDefault(); close(true); }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onResize = () => {
      if (desktop.matches) {
        const focusWasInside = details.contains(document.activeElement);
        close();
        if (focusWasInside) document.querySelector<HTMLAnchorElement>('[data-desktop-nav] a[aria-current="page"]')?.focus();
      } else if (document.activeElement?.closest("[data-desktop-nav]")) {
        toggle.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
    };
  }, []);

  const handleRouteNavigation = (href: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const scrollPosition = window.scrollY;
    if (menu.current) menu.current.open = false;
    if (pathname === href) {
      event.preventDefault();
      const restoreScrollPosition = () => window.scrollTo({ top: scrollPosition, left: 0, behavior: "instant" });
      restoreScrollPosition();
      requestAnimationFrame(restoreScrollPosition);
      return;
    }
    pendingRouteScrollReset = href;
  };

  const navigation = links.map(([label, href]) => <Link key={href} href={href} prefetch={false} scroll={false} aria-current={pathname === href ? "page" : undefined} onClick={handleRouteNavigation(href)}>{label}</Link>);

  return <header className={styles.header}>
    <a className={styles.skip} href="#main-content">Skip to content</a>
    <div className={styles.inner}>
      <Link href="/" prefetch={false} scroll={false} aria-label="CrimsonTide home" className={styles.brand} onClick={handleRouteNavigation("/")}>
        <Wordmark />
      </Link>
      <nav aria-label="Primary" data-desktop-nav className={styles.desktop}>{navigation}</nav>
      <div className={styles.cta}>
        <ActionLink href="/contact" scroll={false} onClick={handleRouteNavigation("/contact")}>Contact CrimsonTide</ActionLink>
      </div>
      <details ref={menu} className={styles.mobile} onToggle={(event) => { setMenuOpen(event.currentTarget.open); if (event.currentTarget.open) event.currentTarget.querySelector<HTMLAnchorElement>("nav a")?.focus(); }}>
        <summary ref={toggle} role="button" aria-label="Menu" aria-expanded={menuOpen} aria-controls="mobile-navigation">
          <span className={styles.menuLines} aria-hidden="true" />
          <span>Menu</span>
        </summary>
        <nav id="mobile-navigation" aria-label="Primary mobile" className={styles.menu}>
          {navigation}
          <div className={styles.mobileCta}>
            <ActionLink href="/contact" scroll={false} onClick={handleRouteNavigation("/contact")}>Contact CrimsonTide</ActionLink>
          </div>
        </nav>
      </details>
    </div>
  </header>;
}
