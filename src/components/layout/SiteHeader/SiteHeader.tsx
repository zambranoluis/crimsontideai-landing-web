"use client";

import { InternalLink } from "@/components/navigation/SiteNavigation";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import styles from "./SiteHeader.module.css";

const links = [["Home", "/"], ["Products", "/products"], ["AI Solutions", "/solutions"], ["Work & Credibility", "/work"], ["Company", "/company"]] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState<boolean>();
  const menu = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLElement>(null);

  useEffect(() => {
    const details = menu.current;
    if (!details) return;
    const close = (restoreFocus = false) => {
      if (!details.open) return;
      details.open = false;
      if (restoreFocus) toggle.current?.focus({ preventScroll: true });
    };
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !details.contains(event.target)) close();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.open) { event.preventDefault(); close(true); }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    // A disappearing CSS disclosure/CTA can blur before the media change event.
    let lastFocused: Element | null = document.activeElement;
    const onFocus = (event: FocusEvent) => { lastFocused = event.target instanceof Element ? event.target : null; };
    const onResize = () => {
      const active = document.activeElement === document.body ? lastFocused : document.activeElement;
      if (desktop.matches) {
        const focusWasInside = details.contains(active);
        close();
        if (focusWasInside) {
          const destination = document.querySelector<HTMLAnchorElement>('[data-desktop-nav] a[aria-current="page"]')
            ?? document.querySelector<HTMLAnchorElement>("[data-desktop-contact] a");
          destination?.focus({ preventScroll: true });
        }
      } else if (active?.closest("[data-desktop-nav], [data-desktop-contact]")) {
        toggle.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    document.addEventListener("focusin", onFocus);
    desktop.addEventListener("change", onResize);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("focusin", onFocus);
      desktop.removeEventListener("change", onResize);
    };
  }, []);

  const closeMenu = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (menu.current) menu.current.open = false;
  };

  const navigation = links.map(([label, href]) => <InternalLink key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={closeMenu}>{label}</InternalLink>);

  return <header className={styles.header}>
    <a className={styles.skip} href="#main-content">Skip to content</a>
    <div className={styles.inner}>
      <InternalLink href="/" aria-label="CrimsonTide home" className={styles.brand} onClick={closeMenu}>
        <Wordmark />
      </InternalLink>
      <nav aria-label="Primary" data-desktop-nav className={styles.desktop}>{navigation}</nav>
      <div className={styles.cta} data-desktop-contact>
        <ActionLink href="/contact" onClick={closeMenu}>Contact CrimsonTide</ActionLink>
      </div>
      <details ref={menu} className={styles.mobile} onToggle={(event) => { setMenuOpen(event.currentTarget.open); if (event.currentTarget.open) event.currentTarget.querySelector<HTMLAnchorElement>("nav a")?.focus({ preventScroll: true }); }}>
        <summary ref={toggle} role="button" aria-label="Menu" aria-expanded={menuOpen} aria-controls="mobile-navigation">
          <span className={styles.menuLines} aria-hidden="true" />
          <span>Menu</span>
        </summary>
        <nav id="mobile-navigation" aria-label="Primary mobile" className={styles.menu}>
          {navigation}
          <div className={styles.mobileCta}>
            <ActionLink href="/contact" onClick={closeMenu}>Contact CrimsonTide</ActionLink>
          </div>
        </nav>
      </details>
    </div>
  </header>;
}
