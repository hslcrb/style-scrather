// Reproducible extension ZIP: Node standard library only, no upload or remote code.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const crypto = require('node:crypto');

function collectFiles(root) {
  const files = ['LICENSE', 'manifest.json'];
  const walk = dir => {
    for (const item of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
      if (item.name.startsWith('.')) continue;
      const file = `${dir}/${item.name}`;
      if (item.isSymbolicLink()) throw new Error(`Package must not contain symlinks: ${file}`);
      if (item.isDirectory()) walk(file);
      else if (item.isFile() && /\.(?:js|css|html|svg|png|ico|json)$/i.test(item.name)) files.push(file);
    }
  };
  for (const dir of ['background', 'content', 'popup', 'icons']) walk(dir);
  return files.sort();
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  for (let bit = 0; bit < 8; bit++) n = (n & 1) ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function makeZip(entries) {
  const records = [], directory = [];
  let offset = 0;
  for (const { name, data } of entries) {
    const filename = Buffer.from(name, 'utf8');
    const compressed = zlib.deflateRawSync(data, { level: 9 });
    const crc = crc32(data);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x800, 6); // UTF-8 paths
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(33, 12); // 1980-01-01: stable across builds and timezones
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(filename.length, 26);
    records.push(local, filename, compressed);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(33, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(filename.length, 28);
    central.writeUInt32LE(offset, 42);
    directory.push(central, filename);
    offset += local.length + filename.length + compressed.length;
  }
  const centralData = Buffer.concat(directory);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralData.length, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...records, centralData, end]);
}

function build(root = path.resolve(__dirname, '..')) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) throw new Error('Invalid extension version');
  const files = collectFiles(root);
  const required = [manifest.background.service_worker, manifest.action.default_popup,
    ...Object.values(manifest.action.default_icon), ...manifest.content_scripts.flatMap(s => s.js || [])];
  for (const file of required) if (!files.includes(file)) throw new Error(`Missing packaged asset: ${file}`);
  const entries = files.map(name => ({ name, data: fs.readFileSync(path.join(root, name)) }));
  const output = path.join(root, 'dist');
  fs.mkdirSync(output, { recursive: true });
  const unpacked = path.join(output, 'style-scratcher');
  fs.rmSync(unpacked, { recursive: true, force: true });
  for (const { name, data } of entries) {
    const dest = path.join(unpacked, name);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, data);
  }
  const zip = makeZip(entries);
  const basename = `style-scratcher-${manifest.version}.zip`;
  const archive = path.join(output, basename);
  fs.writeFileSync(archive, zip);
  const sha256 = crypto.createHash('sha256').update(zip).digest('hex');
  fs.writeFileSync(`${archive}.sha256`, `${sha256}  ${basename}\n`);
  if (fs.existsSync(path.join(root, 'website/index.html'))) {
    const site = path.join(output, 'site');
    fs.rmSync(site, { recursive: true, force: true });
    fs.cpSync(path.join(root, 'website'), site, { recursive: true });
    fs.cpSync(path.join(root, 'icons'), path.join(site, 'icons'), { recursive: true });
  }
  const result = { version: manifest.version, files: files.length, bytes: zip.length, sha256, archive };
  console.log(JSON.stringify(result, null, 2));
  return result;
}
if (require.main === module) build();
module.exports = { build, collectFiles, makeZip };
