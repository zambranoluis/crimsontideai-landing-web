import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const width = 2048;
const height = 1024;
const seed = "crimsontide-404-earth-v1";
const output = "public/pages/not-found";

const hash2 = (x, y, salt = 0) => {
  let value = Math.imul(x, 0x1f123bb5) ^ Math.imul(y, 0x05f35649) ^ salt ^ 0x6340c0de;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
};
const clampByte = value => Math.max(0, Math.min(255, Math.round(value)));
const smooth = value => value * value * (3 - 2 * value);
const wrap = (value, size) => ((value % size) + size) % size;

function gridNoise(x, y, scale) {
  const gx = Math.floor(x / scale), gy = Math.floor(y / scale);
  const tx = smooth((x / scale) - gx), ty = smooth((y / scale) - gy);
  const at = (ix, iy) => hash2(wrap(ix, Math.ceil(width / scale)), iy, Math.round(scale * 997));
  const a = at(gx, gy) * (1 - tx) + at(gx + 1, gy) * tx;
  const b = at(gx, gy + 1) * (1 - tx) + at(gx + 1, gy + 1) * tx;
  return a * (1 - ty) + b * ty;
}

function sphericalNoise(x, y) {
  const lon = (x / width) * Math.PI * 2;
  const lat = ((.5 - y / height) * Math.PI);
  const px = Math.cos(lat) * Math.cos(lon), py = Math.sin(lat), pz = Math.cos(lat) * Math.sin(lon);
  const wave = (ax, ay, az, frequency, phase) => Math.sin((px * ax + py * ay + pz * az) * frequency + phase);
  return .5 + wave(.73, 1.17, -.42, 4.3, .2) * .19
    + wave(-1.31, .41, .94, 9.1, 1.6) * .13
    + wave(.36, -1.57, 1.08, 18.4, .7) * .08
    + wave(1.72, .83, .28, 37.7, 2.1) * .045;
}

const { data: land } = await sharp(`${output}/land-mask.png`).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
if (land.length !== width * height * 4) throw new Error("land-mask.png must be 2048 x 1024");
const landAt = (x, y) => land[(Math.max(0, Math.min(height - 1, y)) * width + wrap(x, width)) * 4] / 255;
const relief = Buffer.alloc(width * height * 4);
const lights = Buffer.alloc(width * height * 4);
const cityCell = 22;
const cityColumns = Math.ceil(width / cityCell);
const cityRows = Math.ceil(height / cityCell);
const citySites = Array.from({ length: cityColumns * cityRows }, (_, index) => {
  const column = index % cityColumns, row = Math.floor(index / cityColumns);
  return {
    x: (column + hash2(column, row, 11)) * cityCell,
    y: (row + hash2(column, row, 29)) * cityCell,
    radius: 1.2 + hash2(column, row, 47) * 3.2,
  };
});
const cityCluster = (x, y) => {
  const column = Math.floor(x / cityCell), row = Math.floor(y / cityCell);
  let density = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const site = citySites[Math.max(0, Math.min(cityRows - 1, row + dy)) * cityColumns + wrap(column + dx, cityColumns)];
    const distance = Math.hypot(x - site.x, y - site.y);
    density = Math.max(density, Math.max(0, 1 - distance / site.radius) ** 2.6);
  }
  return density;
};
const sampleHeight = (x, y) => {
  const mask = landAt(Math.round(x), Math.round(y));
  const broad = sphericalNoise(x, y);
  return broad * (.14 + mask * .86);
};

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const index = (y * width + x) * 4;
    const mask = landAt(x, y);
    const dx = sampleHeight(x + 1, y) - sampleHeight(x - 1, y);
    const dy = sampleHeight(x, y + 1) - sampleHeight(x, y - 1);
    relief[index] = clampByte(128 - dx * 255);
    relief[index + 1] = clampByte(128 - dy * 255);
    relief[index + 2] = clampByte(170 + sampleHeight(x, y) * 70);
    relief[index + 3] = 255;

    const regional = gridNoise(x, y, 143) * .58 + gridNoise(x + 17, y - 23, 67) * .42;
    const coastline = Math.min(1, landAt(x - 3, y) + landAt(x + 3, y) + landAt(x, y - 3) + landAt(x, y + 3));
    const cluster = mask * cityCluster(x, y) * Math.max(.08, (regional - .34) / .66) * (.72 + coastline * .28);
    const transmitter = mask * (cityCluster(x + 7, y - 5) > .9 && regional > .72 ? 1 : 0);
    lights[index] = clampByte(cluster * 255);
    lights[index + 1] = transmitter ? 255 : 0;
    lights[index + 2] = 0;
    lights[index + 3] = 255;
  }
}

await mkdir(output, { recursive: true });
await Promise.all([
  sharp(relief, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(`${output}/earth-relief.png`),
  sharp(lights, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(`${output}/earth-lights.png`),
]);
const hashes = await Promise.all(["earth-relief.png", "earth-lights.png"].map(async file => {
  const data = await readFile(`${output}/${file}`);
  return [file, createHash("sha256").update(data).digest("hex")];
}));
await writeFile(`${output}/earth-surface-manifest.json`, `${JSON.stringify({ seed, width, height, files: Object.fromEntries(hashes) }, null, 2)}\n`);
console.log(JSON.stringify({ seed, width, height, files: Object.fromEntries(hashes) }, null, 2));
