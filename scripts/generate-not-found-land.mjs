// Source: Natural Earth 1:50m land, public domain. No data requests at runtime.
// Usage: node scripts/generate-not-found-land.mjs <ne_50m_land.geojson>
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const data = JSON.parse(await readFile(process.argv[2], 'utf8'));
const paths = data.features.flatMap(({ geometry }) => {
  const polygons = geometry.type === 'MultiPolygon' ? geometry.coordinates : [geometry.coordinates];
  return polygons.map(polygon => polygon.map(ring => ring.map(([lon, lat], i) =>
    `${i ? 'L' : 'M'}${((lon + 180) / 360 * 2048).toFixed(2)},${((90 - lat) / 180 * 1024).toFixed(2)}`
  ).join(' ') + 'Z').join(' '));
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="1024"><rect width="2048" height="1024" fill="black"/><g fill="white" fill-rule="evenodd">${paths.map(d => `<path d="${d}"/>`).join('')}</g></svg>`;
await writeFile('public/pages/not-found/land-mask.png', await sharp(Buffer.from(svg)).png().toBuffer());
