# Quickstart: Verifying the New Icon and Colours

## 1. Automated checks

```bash
npm run typecheck
npm test
npm run build
```

**Expected**: all succeed (nothing in them changes).

## 2. The PNGs

```bash
npm run icons
```

**Expected**: `icons/icon16.png`, `icon32.png`, `icon48.png` and `icon128.png` are rewritten. Open
`icon16.png` in an image viewer zoomed to 800%: the outline is 2 pixels wide and the bars and dots
have hard edges. Open `icon128.png`: a transparent margin surrounds the bubble.

## 3. The toolbar and extensions page

Reload the extension at `chrome://extensions`.

**Expected**: the new icon on the extensions page and in the toolbar, in light and dark Chrome
themes, as large as the icons next to it.

## 4. The panel and popup

Open the floating panel in a call and the toolbar popup, in light and dark mode.

**Expected**: no terracotta anywhere; the live marker, the selected meeting, highlighted buttons and
focus rings are indigo in light mode and periwinkle in dark mode; the yellow notice and red delete
are unchanged.

## 5. The release contents

**Expected**: `icons/` holds only `icon.svg`, `icon-32.svg`, `icon-16.svg` and the four PNGs.
