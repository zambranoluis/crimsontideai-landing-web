"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { scheduleScrollFrame, subscribeScrollFrame } from "@/lib/scrollFrame";

type ProcessStepsProps = {
  children: ReactNode;
  className: string;
};

type ProcessRevealMode = "group" | "individual";

function untransformedBounds(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const transform = getComputedStyle(element).transform;
  let displacement = 0;
  if (transform !== "none") {
    try { displacement = new DOMMatrixReadOnly(transform).m42; } catch { /* Keep layout bounds usable. */ }
  }
  return { top: rect.top - displacement, bottom: rect.bottom - displacement };
}

export function ProcessSteps({ children, className }: ProcessStepsProps) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-process-reveal]"));
    if (!cards.length) return;

    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    const desktopLayout = matchMedia("(min-width: 1024px)");
    let mode: ProcessRevealMode = desktopLayout.matches ? "group" : "individual";
    const revealed = cards.map(() => true);
    let previousScrollY = scrollY;
    let previousHeight = innerHeight;
    let groupInViewport = false;
    let cardsInViewport = cards.map(() => false);

    const indices = cards.map((_, index) => index);
    const setDelays = () => {
      list.dataset.processRevealMode = mode;
      cards.forEach((card, index) => {
        card.style.setProperty("--process-reveal-delay", mode === "group" ? `${index * 40}ms` : "0ms");
      });
    };
    const setImmediate = (changes: Array<{ index: number; visible: boolean }>) => {
      if (!changes.length) return;
      changes.forEach(({ index, visible }) => {
        delete cards[index].dataset.processRevealReady;
        cards[index].dataset.processRevealState = visible ? "revealed" : "hidden";
        revealed[index] = visible;
      });
      void list.offsetHeight;
      changes.forEach(({ index }) => { cards[index].dataset.processRevealReady = "true"; });
    };
    const showImmediately = (targets: number[]) => {
      setImmediate(targets.filter(index => !revealed[index]).map(index => ({ index, visible: true })));
    };
    const resetImmediately = (targets: number[]) => {
      setImmediate(targets.filter(index => revealed[index]).map(index => ({ index, visible: false })));
    };
    const revealWithMotion = (targets: number[]) => {
      targets.filter(index => !revealed[index]).forEach(index => {
        revealed[index] = true;
        cards[index].dataset.processRevealState = "revealed";
      });
    };
    const measureViewportState = (height: number) => {
      const groupBounds = untransformedBounds(list);
      groupInViewport = groupBounds.bottom > 0 && groupBounds.top < height;
      cardsInViewport = cards.map(card => {
        const rect = untransformedBounds(card);
        return rect.bottom > 0 && rect.top < height;
      });
    };
    const initialize = () => {
      setDelays();
      const groupBounds = untransformedBounds(list);
      groupInViewport = groupBounds.bottom > 0 && groupBounds.top < innerHeight;
      cardsInViewport = cards.map(card => {
        const rect = untransformedBounds(card);
        return rect.bottom > 0 && rect.top < innerHeight;
      });
      const focused = list.contains(document.activeElement);
      setImmediate(indices.map(index => ({
        index,
        visible: reducedMotion.matches || focused || (mode === "group" ? groupInViewport : cardsInViewport[index]),
      })));
    };

    initialize();

    const unsubscribe = subscribeScrollFrame(({ height }) => {
      const currentScrollY = scrollY;
      const direction = Math.sign(currentScrollY - previousScrollY);
      previousScrollY = currentScrollY;

      if (reducedMotion.matches) {
        showImmediately(indices);
        measureViewportState(height);
        previousHeight = height;
        return;
      }

      if (mode === "group") {
        const rect = untransformedBounds(list);
        const nextInViewport = rect.bottom > 0 && rect.top < height;
        const focused = list.contains(document.activeElement);

        if (focused) {
          showImmediately(indices);
        } else if (revealed.every(Boolean)) {
          if (!nextInViewport) resetImmediately(indices);
        } else if (nextInViewport) {
          if (direction > 0 && rect.top <= height * .78) revealWithMotion(indices);
          else if (direction < 0 && rect.bottom >= height * .22) revealWithMotion(indices);
          else if (direction === 0 && (!groupInViewport || height !== previousHeight)) showImmediately(indices);
        }
        groupInViewport = nextInViewport;
      } else {
        const nextInViewport = cards.map(card => {
          const rect = untransformedBounds(card);
          return rect.bottom > 0 && rect.top < height;
        });
        const immediateChanges: Array<{ index: number; visible: boolean }> = [];
        const animatedEntrances: number[] = [];

        cards.forEach((card, index) => {
          const rect = untransformedBounds(card);
          const focused = card.contains(document.activeElement);
          if (focused && !revealed[index]) {
            immediateChanges.push({ index, visible: true });
          } else if (revealed[index] && !nextInViewport[index] && !focused) {
            immediateChanges.push({ index, visible: false });
          } else if (!revealed[index] && nextInViewport[index]) {
            if (direction > 0 && rect.top <= height * .78) animatedEntrances.push(index);
            else if (direction < 0 && rect.bottom >= height * .22) animatedEntrances.push(index);
            else if (direction === 0 && (!cardsInViewport[index] || height !== previousHeight)) {
              immediateChanges.push({ index, visible: true });
            }
          }
        });
        setImmediate(immediateChanges);
        revealWithMotion(animatedEntrances);
        cardsInViewport = nextInViewport;
      }
      previousHeight = height;
    });

    const onLayoutChange = () => {
      mode = desktopLayout.matches ? "group" : "individual";
      setDelays();
      setImmediate(indices.map(index => ({ index, visible: true })));
      previousScrollY = scrollY;
      previousHeight = innerHeight;
      measureViewportState(innerHeight);
      scheduleScrollFrame();
    };
    const onPreferenceChange = () => {
      if (reducedMotion.matches) showImmediately(indices);
      scheduleScrollFrame();
    };
    const onFocusIn = (event: FocusEvent) => {
      const index = cards.findIndex(card => card.contains(event.target as Node));
      if (index >= 0) showImmediately(mode === "group" ? indices : [index]);
    };
    const onFocusOut = () => { scheduleScrollFrame(); };

    desktopLayout.addEventListener("change", onLayoutChange);
    reducedMotion.addEventListener("change", onPreferenceChange);
    list.addEventListener("focusin", onFocusIn);
    list.addEventListener("focusout", onFocusOut);

    return () => {
      unsubscribe();
      desktopLayout.removeEventListener("change", onLayoutChange);
      reducedMotion.removeEventListener("change", onPreferenceChange);
      list.removeEventListener("focusin", onFocusIn);
      list.removeEventListener("focusout", onFocusOut);
      delete list.dataset.processRevealMode;
      cards.forEach(card => {
        delete card.dataset.processRevealState;
        delete card.dataset.processRevealReady;
        card.style.removeProperty("--process-reveal-delay");
      });
    };
  }, []);

  return <ol ref={listRef} className={className} data-testid="process-steps">{children}</ol>;
}
