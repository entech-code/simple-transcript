# Tasks: New Icon and Colours

**Input**: Design documents from `/specs/008-icon-and-colours/`

**Tests**: none requested; the icons and colours are checked by hand (quickstart.md).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: The icon (User Story 1)

- [X] T001 [US1] Copy the chosen sources into `icons/`: `icons/try-4/icon-periwinkle.svg` to `icons/icon.svg` (replacing the Notula drawing), `icons/try-4/icon-32-periwinkle.svg` to `icons/icon-32.svg`, `icons/try-4/icon-16-periwinkle-dots.svg` to `icons/icon-16.svg`; delete `icons/icon-small.svg`
- [X] T002 [US1] Add `scripts/export-icons.mjs`: find Chrome (`CHROME_PATH`, else the usual Windows, macOS and Linux locations); write a temporary page that draws `icon-16.svg` at 16px, `icon-32.svg` at 32px and `icon.svg` at 48 and 128px onto canvases with a transparent background; pass the SVGs to the page as data URLs (so the canvases can be read back) and run Chrome headless with `--dump-dom` and a virtual time budget; read the canvases' PNG data from the dumped page and write `icons/icon16.png`, `icon32.png`, `icon48.png` and `icon128.png`; delete the temporary page; fail with a clear message if Chrome is not found or a canvas is missing
- [X] T003 [US1] In `package.json`, add the script `"icons": "node scripts/export-icons.mjs"`; run it and check that the four PNGs are 16, 32, 48 and 128 pixels square with transparent corners
- [X] T004 [US1] Delete `icons/try-1`, `icons/try-2`, `icons/try-3` and `icons/try-4`, so `icons/` holds only `icon.svg`, `icon-32.svg`, `icon-16.svg` and the four PNGs (the release zip includes all of `icons/`)
- [X] T004a [US1] After a check in the real toolbar, where the icon looked small and light: replace the three sources with the bolder, larger design (thicker outline, larger bubble; `icon-32.svg` with a 3px outline on whole pixels; `icon-16.svg` edge to edge with a 2px outline, 2x2px dots and 2px bars), re-run `npm run icons`, and remove the new try folders

## Phase 2: The colours (User Story 2)

- [X] T005 [P] [US2] In `popup.html`, set the accent variables per `data-model.md`: light `--accent: #4338ca`, `--bg-active: rgba(67, 56, 202, 0.12)`, `--comment: rgba(67, 56, 202, 0.18)`, `--comment-strong: rgba(67, 56, 202, 0.38)`; dark `--accent: #818cf8`, `--bg-active: rgba(129, 140, 248, 0.18)`, `--comment: rgba(129, 140, 248, 0.2)`, `--comment-strong: rgba(129, 140, 248, 0.42)`; `--accent-text` unchanged
- [X] T006 [P] [US2] In `src/content/floating-popup.ts`, the same changes to the panel's light and dark variables
- [X] T007 [US2] Search `src/` and `popup.html` for any remaining terracotta (`b0563a`, `d2795a`, `176, 86, 58`, `210, 121, 90`) and replace it with the matching accent value; leave the red "extension updated" banner (`#b71c1c`) as it is

## Phase 3: Polish

- [X] T008 Run `npm run typecheck`, `npm test` and `npm run build`
- [X] T009 [P] Update `README.md` if it describes the icon or colours, and add `npm run icons` to its development section
- [X] T010 Manual, by the maintainer (quickstart.md steps 2 to 5)
- [X] T011 In `todo.md`, move "New icon and colours" to Completed with the date

## Dependencies

- T001 before T002 and T003; T003 before T004 (the sources are copied out before the try folders go).
- T005 and T006 are independent of Phase 1 and of each other.
