# Implementation Plan: New Icon and Colours

**Branch**: `feat/icon-and-colours` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/008-icon-and-colours/spec.md`

## Summary

Replace the Notula icon with the chosen periwinkle speech bubble at 16, 32, 48 and 128px,
and switch the panel's and popup's terracotta accent to the icon's indigo (light theme) and
periwinkle (dark theme). The three chosen SVGs become the icon sources; a small script renders
them to the PNGs the manifest uses, with headless Chrome, so the PNGs can be remade at any time.
The exploration folders are removed before merge.

## Technical Context

**Language/Version**: TypeScript 5.7 for the extension; a plain Node 24 script (`.mjs`) for the
export

**Primary Dependencies**: none added. The export uses the Chrome already installed on the
maintainer's machine

**Storage**: none

**Testing**: no unit tests: nothing here is logic. Checked by eye and by a pixel check of the 16px
PNG (quickstart); typecheck, tests and build must still pass

**Target Platform**: Chrome Manifest V3 extension

**Project Type**: browser extension, single project

**Constraints**: the release zip includes all of `icons/`, so only the sources and the four PNGs
may remain there; manifest paths stay `icons/icon<size>.png`

**Scale/Scope**: 3 SVG sources, 4 PNGs, 1 export script, colour variables in 2 places
(`popup.html` and the panel's styles in `floating-popup.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
| --- | --- | --- |
| I. Data stays on the user's machine | No data involved. | Pass |
| II. Minimal permissions | No permission change. | Pass |
| III. Never break the call | Only colours of the extension's own panel change; nothing in Meet. | Pass |
| IV. Simplicity and zero runtime dependencies | No dependency; the export script is a development tool, not shipped code, and uses the installed Chrome. | Pass |
| V. Verified before merge | Typecheck, tests and build pass; the icons and both themes are checked by hand. | Pass |
| Technical constraints | Manifest icon paths unchanged. | Pass |
| Development workflow | One change (the brand) on `feat/icon-and-colours`. | Pass |

**Post-design re-check**: unchanged. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/008-icon-and-colours/
├── plan.md, spec.md, research.md
├── data-model.md        # Icon sizes and the colour changes
├── quickstart.md        # How to verify
└── checklists/requirements.md
```

### Source Code (repository root)

```text
icons/icon.svg                # 128 and 48px source; replaces the Notula drawing
icons/icon-32.svg             # 32px source: 3px outline, shapes on whole pixels
icons/icon-16.svg             # 16px source: edge to edge, 2px outline; replaces icon-small.svg
icons/icon16.png, icon32.png, icon48.png, icon128.png   # rendered from the sources
icons/try-*                   # removed
scripts/export-icons.mjs      # renders the PNGs with headless Chrome
package.json                  # "icons" script
popup.html                    # accent variables
src/content/floating-popup.ts # accent variables (panel styles)
```

## Design Notes

- **Export**: `scripts/export-icons.mjs` writes a temporary page that draws each SVG onto a canvas
  of the target size, runs the installed Chrome headless with `--dump-dom` to collect the canvases
  as PNG data, and writes the four files. It finds Chrome at the usual Windows, macOS and Linux
  locations, or `CHROME_PATH`. Drawing at the exact size, rather than shrinking a large render,
  keeps the 16px icon on its pixel grid. Run with `npm run icons`; a folder can be given to
  render another set (`node scripts/export-icons.mjs icons/try-2`), which is how candidates were
  compared as PNGs.
- **Colours**: the accent variables in `popup.html` and the panel's styles change together:
  | Variable | Light | Dark |
  | --- | --- | --- |
  | `--accent` | `#4338ca` | `#818cf8` |
  | `--accent-text` | `#fff` (unchanged) | `#1c1c1a` (unchanged) |
  | `--bg-active` | `rgba(67, 56, 202, 0.12)` | `rgba(129, 140, 248, 0.18)` |
  | `--comment` | `rgba(67, 56, 202, 0.18)` | `rgba(129, 140, 248, 0.2)` |
  | `--comment-strong` | `rgba(67, 56, 202, 0.38)` | `rgba(129, 140, 248, 0.42)` |

  The tints keep today's opacities, so their strength does not change; only the hue does.
- **Untouched**: neutrals, warning and danger colours, and the red "extension updated" banner
  (`#b71c1c`), which is a warning.
- **Cleanup**: the try folders hold the exploration, including empty files; they are deleted in
  the same branch so the release zip does not include them. `icon-small.svg` is removed.

## Risks

- **Headless Chrome output differs from the toolbar's rendering**: both use Skia; checked by
  viewing the 16px PNG magnified (quickstart).
- **The warm greys look off next to indigo**: noted in the spec as a follow-up.

## Complexity Tracking

No constitution violations to justify.
