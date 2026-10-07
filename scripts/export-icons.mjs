// Renders the icon sources in icons/ to the PNGs the manifest uses, with the
// Chrome already installed: each SVG is drawn on a canvas of the exact size, so
// the 16px icon stays on its pixel grid. Run with `npm run icons`.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ICONS = process.argv[2] || 'icons';
const SIZES = [
  { size: 16, source: 'icon-16.svg' },
  { size: 32, source: 'icon-32.svg' },
  { size: 48, source: 'icon.svg' },
  { size: 128, source: 'icon.svg' },
];

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) throw new Error('Chrome not found. Set CHROME_PATH to the Chrome executable.');
  return found;
}

// The SVGs go in as data URLs, so the canvases can be read back.
const icons = SIZES.map(({ size, source }) => ({
  size,
  url: 'data:image/svg+xml;base64,' + readFileSync(join(ICONS, source)).toString('base64'),
}));

const page = `<!DOCTYPE html><html><body><pre id="out"></pre><script>
  const icons = ${JSON.stringify(icons)};
  Promise.all(icons.map(({ size, url }) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      canvas.getContext('2d').drawImage(image, 0, 0, size, size);
      resolve({ size, png: canvas.toDataURL('image/png') });
    };
    image.onerror = () => reject(new Error('could not load the ' + size + 'px source'));
    image.src = url;
  }))).then(
    (pngs) => { document.getElementById('out').textContent = JSON.stringify(pngs); },
    (error) => { document.getElementById('out').textContent = 'ERROR ' + error.message; },
  );
</script></body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'export-icons-'));
try {
  const pagePath = join(dir, 'export.html');
  writeFileSync(pagePath, page);
  const dom = execFileSync(findChrome(), [
    '--headless=new',
    '--disable-gpu',
    `--user-data-dir=${join(dir, 'profile')}`,
    '--virtual-time-budget=5000',
    '--dump-dom',
    pathToFileURL(pagePath).href,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });

  const out = dom.match(/<pre id="out">([^<]*)<\/pre>/)?.[1] ?? '';
  if (!out.startsWith('[')) throw new Error(`Chrome did not render the icons: ${out || 'no output'}`);

  for (const { size, png } of JSON.parse(out.replace(/&quot;/g, '"').replace(/&amp;/g, '&'))) {
    const file = join(ICONS, `icon${size}.png`);
    writeFileSync(file, Buffer.from(png.split(',')[1], 'base64'));
    console.log(`Wrote ${file}`);
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
