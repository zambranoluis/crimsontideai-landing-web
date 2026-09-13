// Original export: tests/fixtures/terrain/footer.html. Its single timeline
// state never changes these parameters. Colors include the export's overrides.
export const footerTerrainPreset = {
  primaryColor: "#EF3340", highlightColor: "#FF4A56", opacity: .95,
  glow: 1.25, pointSize: 1.5, lineOpacity: .07, lineWidth: .58,
  waveHeight: 2.03, waveFreqX: 12.2, waveFreqY: 14.3, detail: .92,
  ridge1Height: 1.18, ridge1X: .47, ridge1Y: .49, ridge1Width: 1, ridge1Depth: 1,
  ridge2Height: 1.08, ridge2X: .5, ridge2Y: .39, ridge2Width: 2.37, ridge2Depth: .41,
  upperRelief: .79, perspective: .92, topSpread: .35, verticalScale: 1.05,
  horizon: .69, tilt: .18, directionAngle: 0, perspectiveDirection: .39,
  scale: .68, meshWidth: 1.66, meshLength: .32, offsetX: .125, offsetY: .195,
  speed: 1.43, waveDrift: 1.06, shimmer: 1.15, shimmerSpeed: 4.75,
  pulseCount: 1, pulseSpeed: .85, pulseWidth: .101, pulseIntensity: 1.28,
  ambientGlow: .63, parallax: .56, mouseForce: .32, mouseRadius: .18, mouseSmoothing: .045,
} as const;

// Point counts (not subdivisions). DPR caps come from shared backingSize.
export const terrainTiers = [
  { columns: 118, rows: 52, name: "high" },
  { columns: 92, rows: 40, name: "medium" },
  { columns: 72, rows: 32, name: "low" },
] as const;
