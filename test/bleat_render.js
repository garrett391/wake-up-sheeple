const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../src/js/02a-bleat.js', 'utf8');
const { synthBleat, BLEATS } = new Function(src + '; return { synthBleat, BLEATS };')();
function wav(path, data, sr) {
  const b = Buffer.alloc(44 + data.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + data.length * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(data.length * 2, 40);
  for (let i = 0; i < data.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(data[i] * 32767))), 44 + i * 2);
  fs.writeFileSync(path, b);
}
for (const k of Object.keys(BLEATS)) {
  const t0 = Date.now(); const d = synthBleat(48000, BLEATS[k]);
  let nan = 0; for (const v of d) if (!Number.isFinite(v)) nan++;
  console.log(k, 'samples', d.length, 'time', Date.now() - t0, 'ms', 'nonfinite', nan);
  wav(__dirname + `/../shots/audio/bleat-${k}.wav`, d, 48000);
}
