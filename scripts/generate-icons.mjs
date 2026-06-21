/**
 * generate-icons.mjs
 * Generates PWA icon PNGs from an inline SVG using sharp (bundled with Next.js).
 * Run: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(OUT, { recursive: true });

// Brand colours matching sidebar + manifest
const BG    = "#04080f";
const GRAD1 = "#0052cc";
const GRAD2 = "#00a8e8";
const GRAD3 = "#00d4ff";

function makeSvg(size) {
  const r  = Math.round(size * 0.22);
  const fs2 = Math.round(size * 0.52);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%"   stop-color="${GRAD1}"/>
      <stop offset="50%"  stop-color="${GRAD2}"/>
      <stop offset="100%" stop-color="${GRAD3}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" fill="${BG}"/>
  <rect width="${size}" height="${size}" rx="${r}" fill="url(#g)" opacity="0.92"/>
  <text
    x="50%" y="55%"
    text-anchor="middle" dominant-baseline="middle"
    font-family="Arial Black, Arial, sans-serif"
    font-weight="900"
    font-size="${fs2}"
    fill="white"
  >N</text>
</svg>`);
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of SIZES) {
  const outPath = path.join(OUT, `icon-${size}x${size}.png`);
  await sharp(makeSvg(size)).png().toFile(outPath);
  console.log(`✓ icon-${size}x${size}.png`);
}

// Apple touch icon — 180×180
await sharp(makeSvg(180)).png().toFile(path.join(OUT, "apple-touch-icon.png"));
console.log("✓ apple-touch-icon.png");

console.log("\nAll icons generated → public/icons/");
