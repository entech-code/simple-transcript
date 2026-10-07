# Data Model: New Icon and Colours

No stored data changes. This lists the icon files and the colour values.

## Icon set

| Size | Used for | Source | PNG |
| --- | --- | --- | --- |
| 16px | toolbar at 100% scaling | `icons/icon-16.svg` (edge to edge; 2px outline, 2x2px dots, 2px bars, on whole pixels) | `icons/icon16.png` |
| 32px | toolbar on scaled screens | `icons/icon-32.svg` (3px outline, 4x4px dots, 4px bars, on whole pixels) | `icons/icon32.png` |
| 48px | extensions page | `icons/icon.svg` | `icons/icon48.png` |
| 128px | store and installation | `icons/icon.svg` (about 9px transparent margin) | `icons/icon128.png` |

Icon colours: outline `#818cf8`, fill `#ffffff`, bars `#4338ca`, dots `#0284c7` and `#e11d48`.

## Accent colours

| Variable | Light (was) | Light (new) | Dark (was) | Dark (new) |
| --- | --- | --- | --- | --- |
| `--accent` | `#b0563a` | `#4338ca` | `#d2795a` | `#818cf8` |
| `--bg-active` | `rgba(176, 86, 58, 0.12)` | `rgba(67, 56, 202, 0.12)` | `rgba(210, 121, 90, 0.18)` | `rgba(129, 140, 248, 0.18)` |
| `--comment` | `rgba(176, 86, 58, 0.18)` | `rgba(67, 56, 202, 0.18)` | `rgba(210, 121, 90, 0.2)` | `rgba(129, 140, 248, 0.2)` |
| `--comment-strong` | `rgba(176, 86, 58, 0.38)` | `rgba(67, 56, 202, 0.38)` | `rgba(210, 121, 90, 0.42)` | `rgba(129, 140, 248, 0.42)` |

`--accent-text` stays `#fff` (light) and `#1c1c1a` (dark). Set in `popup.html` and in the panel's
styles in `src/content/floating-popup.ts`.
