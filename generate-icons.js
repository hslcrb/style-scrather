const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(size, drawFn) {
  const width = size;
  const height = size;
  const buffer = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      buffer[idx] = r;
      buffer[idx + 1] = g;
      buffer[idx + 2] = b;
      buffer[idx + 3] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Non-interlaced
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT Chunk (Scanlines with filter byte 0)
  const scanlines = [];
  for (let y = 0; y < height; y++) {
    scanlines.push(Buffer.from([0])); // Filter type 0 (None)
    scanlines.push(buffer.subarray(y * width * 4, (y + 1) * width * 4));
  }
  const rawData = Buffer.concat(scanlines);
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc >>> 0, 8 + len);
  return chunk;
}

// CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

// Icon design: White rounded square with subtle border, deep blue/indigo icon with ruler/crosshair
function iconDrawer(x, y, w, h) {
  const r = 6 * (w / 48); // proportional corner radius
  // Rounded rect check
  const inRect = (x >= 1 && x < w - 1 && y >= 1 && y < h - 1);
  const cornerDist = (cx, cy) => Math.hypot(x - cx, y - cy);
  let inside = inRect;

  if (x < 1 + r && y < 1 + r) inside = cornerDist(1 + r, 1 + r) <= r;
  else if (x >= w - 1 - r && y < 1 + r) inside = cornerDist(w - 1 - r, 1 + r) <= r;
  else if (x < 1 + r && y >= h - 1 - r) inside = cornerDist(1 + r, h - 1 - r) <= r;
  else if (x >= w - 1 - r && y >= h - 1 - r) inside = cornerDist(w - 1 - r, h - 1 - r) <= r;

  if (!inside) return [0, 0, 0, 0];

  // Border check
  const isBorder = (x === 1 || x === w - 2 || y === 1 || y === h - 2);
  if (isBorder) {
    return [229, 231, 235, 255]; // #E5E7EB border
  }

  // Centered graphic: Minimal Stylus/Ruler + "S" curve
  const nx = x / w;
  const ny = y / h;

  // Blue grid lines background (very subtle)
  const isGrid = (Math.floor(x / (w / 6)) % 2 === 0 && Math.floor(y / (h / 6)) % 2 === 0);
  let bgR = 255, bgG = 255, bgB = 255;
  if (isGrid && w >= 48) {
    bgR = 249; bgG = 250; bgB = 251;
  }

  // Draw stylish minimal "S" or Crosshair in vibrant modern blue (#2563EB)
  const cx = w / 2;
  const cy = h / 2;
  const distCenter = Math.hypot(x - cx, y - cy);

  // Inspector Crosshair Box in center
  const boxSize = w * 0.28;
  const inBoxBorder = Math.abs(x - cx) <= boxSize && Math.abs(y - cy) <= boxSize &&
    (Math.abs(Math.abs(x - cx) - boxSize) < Math.max(1, w / 24) || Math.abs(Math.abs(y - cy) - boxSize) < Math.max(1, w / 24));

  // Small ruler tick marks or center dot
  const inCenterDot = distCenter <= Math.max(1.5, w / 16);

  if (inBoxBorder || inCenterDot) {
    return [37, 99, 235, 255]; // #2563EB
  }

  // Distance ruler guides extending from center
  const isGuide = (Math.abs(x - cx) < Math.max(0.7, w / 48) && (y < cy - boxSize || y > cy + boxSize) && y > 3 && y < h - 4) ||
                  (Math.abs(y - cy) < Math.max(0.7, w / 48) && (x < cx - boxSize || x > cx + boxSize) && x > 3 && x < w - 4);
  if (isGuide) {
    return [239, 68, 68, 220]; // Figma distance guide red (#EF4444)
  }

  return [bgR, bgG, bgB, 255];
}

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

[16, 48, 128].forEach(size => {
  const png = createPNG(size, iconDrawer);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), png);
  console.log(`Generated icon${size}.png (${png.length} bytes)`);
});
