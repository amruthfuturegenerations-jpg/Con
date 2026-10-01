const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPngChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcTarget = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function generatePng(width, height, renderFn) {
  // Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per channel
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10); // deflate
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdrChunk = createPngChunk('IHDR', ihdrData);

  // Raw Scanlines: each row has 1 filter byte (0) + width * 4 bytes RGBA
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = renderFn(x / width, y / height, x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createPngChunk('IDAT', deflated);
  const iendChunk = createPngChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Render icon with industrial slate background, amber hardhat & checklist motif
function renderIcon(u, v, x, y, w, h, isMaskable = false) {
  // u, v are 0..1
  const cx = 0.5, cy = 0.5;
  const dx = u - cx, dy = v - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Default deep industrial slate
  let r = 15, g = 23, b = 42, a = 255; // #0f172a

  if (!isMaskable) {
    // Rounded corner for regular icon
    const cornerR = 0.22;
    const nx = Math.abs(dx), ny = Math.abs(dy);
    if (nx > 0.5 - cornerR && ny > 0.5 - cornerR) {
      const cdx = nx - (0.5 - cornerR);
      const cdy = ny - (0.5 - cornerR);
      if (Math.sqrt(cdx * cdx + cdy * cdy) > cornerR) {
        return [0, 0, 0, 0]; // Transparent outside rounded rect
      }
    }
  }

  // Industrial accent border
  if (Math.abs(u - 0.5) > 0.44 || Math.abs(v - 0.5) > 0.44) {
    if ((Math.floor(x / 8) + Math.floor(y / 8)) % 2 === 0) {
      return [245, 158, 11, 255]; // Amber accent stripes
    }
  }

  // Inner card / clipboard area (0.24 <= u <= 0.76, 0.38 <= v <= 0.85)
  if (u >= 0.22 && u <= 0.78 && v >= 0.36 && v <= 0.86) {
    r = 30; g = 41; b = 59; // #1e293b
    // Border
    if (u <= 0.24 || u >= 0.76 || v <= 0.38 || v >= 0.84) {
      r = 245; g = 158; b = 11; // Amber border
    }

    // Checkmark row 1 (Green)
    if (v >= 0.44 && v <= 0.52) {
      if (u >= 0.28 && u <= 0.36) {
        // Green status badge
        const cdx = u - 0.32, cdy = v - 0.48;
        if (cdx*cdx + cdy*cdy < 0.035*0.035) {
          return [16, 185, 129, 255]; // Emerald
        }
      } else if (u >= 0.40 && u <= 0.70) {
        return [226, 232, 240, 255]; // Slate text line
      }
    }

    // Checkmark row 2 (Amber)
    if (v >= 0.58 && v <= 0.66) {
      if (u >= 0.28 && u <= 0.36) {
        const cdx = u - 0.32, cdy = v - 0.62;
        if (cdx*cdx + cdy*cdy < 0.035*0.035) {
          return [245, 158, 11, 255]; // Amber
        }
      } else if (u >= 0.40 && u <= 0.64) {
        return [148, 163, 184, 255]; // Light slate text line
      }
    }

    // Checkmark row 3 (Red)
    if (v >= 0.72 && v <= 0.80) {
      if (u >= 0.28 && u <= 0.36) {
        const cdx = u - 0.32, cdy = v - 0.76;
        if (cdx*cdx + cdy*cdy < 0.035*0.035) {
          return [239, 68, 68, 255]; // Red
        }
      } else if (u >= 0.40 && u <= 0.68) {
        return [100, 116, 139, 255]; // Slate text line
      }
    }
  }

  // Safety helmet on top (0.30 <= u <= 0.70, 0.14 <= v <= 0.34)
  const hx = (u - 0.5) / 0.20;
  const hy = (v - 0.32) / 0.18;
  if (hx * hx + hy * hy <= 1.0 && v <= 0.32) {
    // Amber helmet dome
    r = 251; g = 191; b = 36; // Amber 400
    if (Math.abs(u - 0.5) < 0.035) {
      r = 254; g = 240; b = 138; // Ridge highlight
    }
  }
  // Helmet brim
  if (u >= 0.26 && u <= 0.74 && v >= 0.31 && v <= 0.36) {
    r = 217; g = 119; b = 6; // Amber 600
  }

  return [r, g, b, a];
}

const pubDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(pubDir)) fs.mkdirSync(pubDir, { recursive: true });

// 192x192
fs.writeFileSync(path.join(pubDir, 'pwa-192x192.png'), generatePng(192, 192, (u, v, x, y, w, h) => renderIcon(u, v, x, y, w, h, false)));
// 512x512
fs.writeFileSync(path.join(pubDir, 'pwa-512x512.png'), generatePng(512, 512, (u, v, x, y, w, h) => renderIcon(u, v, x, y, w, h, false)));
// 512x512 maskable (full bleed background)
fs.writeFileSync(path.join(pubDir, 'pwa-maskable-512x512.png'), generatePng(512, 512, (u, v, x, y, w, h) => renderIcon(u, v, x, y, w, h, true)));
// apple-touch-icon 180x180
fs.writeFileSync(path.join(pubDir, 'apple-touch-icon.png'), generatePng(180, 180, (u, v, x, y, w, h) => renderIcon(u, v, x, y, w, h, false)));
// favicon.ico (using 64x64 png as favicon)
fs.writeFileSync(path.join(pubDir, 'favicon.ico'), generatePng(64, 64, (u, v, x, y, w, h) => renderIcon(u, v, x, y, w, h, false)));

console.log('Successfully generated all PWA PNG icons!');
