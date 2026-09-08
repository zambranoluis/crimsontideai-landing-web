const paths = {
  idea: "M9 18h6m-5 3h4M8 14a7 7 0 1 1 8 0c-1 1-1 2-1 3H9c0-1 0-2-1-3Z",
  document: "M6 3h8l4 4v14H6Zm8 0v5h4M9 12h6m-6 4h6",
  progress: "m3 18 6-7 4 4 8-11m-6 0h6v6",
  detection: "M12 2v4m0 12v4M2 12h4m12 0h4M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm0 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z",
  alert: "M9 20c1 2 5 2 6 0M5 17h14l-2-4V9a5 5 0 0 0-10 0v4Zm7-15v2",
  analytics: "M3 21V11h4v10Zm7 0V3h4v18Zm7 0V7h4v14Z",
  globe: "M3 12h18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 0c-5 5-5 13 0 18 5-5 5-13 0-18Z",
  shield: "m12 2 9 4-1 8c-1 4-5 6-8 8-3-2-7-4-8-8L3 6Zm-5 9 4 4 6-7",
} as const;

export function ProductIcon({ name }: { name: keyof typeof paths }) {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}
