// Renders the Chrome Web Store images in store/ from the pages in
// store/source/, with the Chrome already installed. Each page is drawn at the
// exact size the store asks for. Run with `npm run store-images`.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const IMAGES = [
  { page: 'transcript.html', file: 'screenshot-1-transcript.png', width: 1280, height: 800 },
  { page: 'meetings.html', file: 'screenshot-2-meetings.png', width: 1280, height: 800 },
  { page: 'text-file.html', file: 'screenshot-3-text-file.png', width: 1280, height: 800 },
  { page: 'promo-tile.html', file: 'promo-tile-440x280.png', width: 440, height: 280 },
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

const chrome = findChrome();
const profile = mkdtempSync(join(tmpdir(), 'store-images-'));
try {
  for (const { page, file, width, height } of IMAGES) {
    const out = resolve('store', file);
    execFileSync(chrome, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      `--user-data-dir=${profile}`,
      `--window-size=${width},${height}`,
      `--screenshot=${out}`,
      pathToFileURL(resolve('store', 'source', page)).href,
    ], { stdio: 'ignore' });
    if (!existsSync(out)) throw new Error(`Chrome did not write ${file}`);
    console.log(`Wrote store/${file} (${width}x${height})`);
  }
} finally {
  rmSync(profile, { recursive: true, force: true });
}
