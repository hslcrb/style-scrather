#!/usr/bin/env node
'use strict';

// Dependency-free artwork. SVG and supersampled PNG use the same 64 × 64 geometry.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const out = path.resolve(__dirname, '..', 'icons');
fs.mkdirSync(out, { recursive: true });
const crimson = [225, 29, 72];
const frame = [
  [[17, 25], [17, 20], [17, 17, 20, 17], [25, 17]],
  [[39, 17], [44, 17], [47, 17, 47, 20], [47, 25]],
  [[47, 39], [47, 44], [47, 47, 44, 47], [39, 47]],
  [[25, 47], [20, 47], [17, 47, 17, 44], [17, 39]],
];
const guides = [[[32, 6], [32, 10]], [[54, 32], [58, 32]], [[32, 54], [32, 58]], [[6, 32], [10, 32]]];
function svgPath(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : p.length === 4 ? 'Q' : 'L'}${p.join(' ')}`).join(' ');
}
function mark() {
  return `<g fill="none" stroke="#E11D48" stroke-linecap="round" stroke-linejoin="round"><g stroke-width="3.5">${frame.map(p => `<path d="${svgPath(p)}"/>`).join('')}</g><g stroke-width="2.2" opacity=".68">${guides.map(p => `<path d="${svgPath(p)}"/>`).join('')}</g></g><circle cx="32" cy="32" r="3.3" fill="#E11D48"/>`;
}
const tile = '<defs><linearGradient id="paper" x2="0" y2="1"><stop stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFF5F7"/></linearGradient></defs><rect x="1" y="1" width="62" height="62" rx="15" fill="url(#paper)" stroke="#F0DDE1" stroke-width=".75"/>';
fs.writeFileSync(path.join(out, 'mark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="title"><title id="title">Style Scratcher selection mark</title>${mark()}</svg>\n`);
fs.writeFileSync(path.join(out, 'app-icon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-labelledby="title"><title id="title">Style Scratcher</title>${tile}${mark()}</svg>\n`);
fs.writeFileSync(path.join(out, 'wordmark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 334 64" role="img" aria-labelledby="title"><title id="title">Style Scratcher</title>${mark()}<text x="79" y="41" fill="#17151C" font-family="Arial, Helvetica, sans-serif" font-size="29" font-weight="700" letter-spacing="-1.2">Style Scratcher</text></svg>\n`);
fs.writeFileSync(path.join(out, 'social-card.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc"><title id="title">Style Scratcher — Look closer.</title><desc id="desc">A browser inspection studio, with the crimson selection-frame mark on warm pearl.</desc><defs><radialGradient id="glow"><stop stop-color="#FFE4EA"/><stop offset="1" stop-color="#F5F4F1" stop-opacity="0"/></radialGradient></defs><rect width="1200" height="630" fill="#F5F4F1"/><circle cx="1020" cy="290" r="390" fill="url(#glow)"/><path d="M64 110H1136M64 541H1136" stroke="#17151C" stroke-opacity=".14"/><text x="64" y="79" fill="#17151C" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="-.8">Style Scratcher</text><text x="65" y="263" fill="#17151C" font-family="Arial, Helvetica, sans-serif" font-size="96" font-weight="700" letter-spacing="-5">Look closer.</text><text x="65" y="357" fill="#E11D48" font-family="Arial, Helvetica, sans-serif" font-size="76" font-weight="700" letter-spacing="-3">Make it yours.</text><text x="69" y="434" fill="#626773" font-family="Arial, Helvetica, sans-serif" font-size="24">The web, with your eye for detail.</text><g transform="translate(844 174) scale(4)">${mark()}</g><text x="65" y="582" fill="#626773" font-family="Arial, Helvetica, sans-serif" font-size="17" letter-spacing="2">CHROME EXTENSION · OPEN SOURCE · APACHE-2.0</text></svg>\n`);

function flatten(points) {
  const result = [points[0]];
  for (const p of points.slice(1)) {
    if (p.length === 2) result.push(p);
    else {
      const [x0, y0] = result[result.length - 1];
      for (let i = 1; i <= 12; i++) {
        const t = i / 12;
        result.push([(1 - t) ** 2 * x0 + 2 * (1 - t) * t * p[0] + t ** 2 * p[2], (1 - t) ** 2 * y0 + 2 * (1 - t) * t * p[1] + t ** 2 * p[3]]);
      }
    }
  }
  return result.slice(1).map((p, i) => [result[i], p]);
}
const frameLines = frame.flatMap(flatten);
const guideLines = guides.flatMap(flatten);
function distance(x, y, [[ax, ay], [bx, by]]) {
  const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
  return Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay));
}
function insideTile(x, y, inset = 1) {
  const qx = Math.max(Math.abs(x - 32) - 16, 0);
  const qy = Math.max(Math.abs(y - 32) - 16, 0);
  return Math.hypot(qx, qy) <= 16 - inset;
}
function sample(x, y) {
  if (!insideTile(x, y)) return [0, 0, 0, 0];
  let c = insideTile(x, y, 1.75) ? [255, 255 - y / 64 * 10, 255 - y / 64 * 8] : [240, 221, 225];
  if (frameLines.some(line => distance(x, y, line) <= 1.75) || Math.hypot(x - 32, y - 32) <= 3.3) c = crimson;
  else if (guideLines.some(line => distance(x, y, line) <= 1.1)) c = c.map((n, i) => n * .32 + crimson[i] * .68);
  return [...c, 255];
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ n >>> 1 : n >>> 1;
  return n >>> 0;
});
function chunk(type, data) {
  const buffer = Buffer.alloc(data.length + 12);
  buffer.writeUInt32BE(data.length);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);
  let crc = 0xffffffff;
  for (const byte of buffer.subarray(4, data.length + 8)) crc = crc >>> 8 ^ crcTable[(crc ^ byte) & 255];
  buffer.writeUInt32BE((crc ^ 0xffffffff) >>> 0, data.length + 8);
  return buffer;
}
function png(size) {
  const data = Buffer.alloc(size * (size * 4 + 1));
  const samples = 8;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const sum = [0, 0, 0, 0];
    for (let sy = 0; sy < samples; sy++) for (let sx = 0; sx < samples; sx++) {
      const rgba = sample((x + (sx + .5) / samples) * 64 / size, (y + (sy + .5) / samples) * 64 / size);
      for (let i = 0; i < 3; i++) sum[i] += rgba[i] * rgba[3] / 255;
      sum[3] += rgba[3];
    }
    const offset = y * (size * 4 + 1) + 1 + x * 4;
    for (let i = 0; i < 3; i++) data[offset + i] = sum[3] ? Math.round(sum[i] * 255 / sum[3]) : 0;
    data[offset + 3] = Math.round(sum[3] / samples ** 2);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(data, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
for (const size of [16, 48, 128]) fs.writeFileSync(path.join(out, `icon${size}.png`), png(size));
console.log('Generated 4 SVG brand assets and PNG extension icons at 16, 48, and 128 px.');
