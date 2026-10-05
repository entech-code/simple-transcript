# Implementation Plan: Rebrand to Simple Transcript and Remove Notula

**Branch**: `feat/rebrand-simple-transcript` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-rebrand-simple-transcript/spec.md`

## Summary

Rename the extension to "Simple Transcript: Copy & Save for Google Meet" (short name "Simple
Transcript") and remove the Notula integration entirely. The integration is five source files
that are deleted outright, plus the places that call into them: the service worker, the floating
panel, the toolbar popup and `popup.html`. Nothing replaces them. Deleting them also removes the
extension's only network code, so the extension makes no network requests at all.

Outside the extension code, the README is rewritten for the new name, the website pages and store
material get a name swap with Notula passages deleted, the release workflow publishes under the
new name, and the constitution is amended.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), target ES2022

**Primary Dependencies**: none at runtime; no dependency is added or removed

**Storage**: `chrome.storage.local`. The `meetings`, `settings`, `deviceMap` and
`recentLanguages` keys are untouched. Four Notula keys are no longer read or written

**Testing**: the existing Vitest suite (`npm test`, 98 tests) must still pass; no test covers the
removed code. Removal and naming are verified by repository searches and by hand in a live call

**Target Platform**: Chrome Manifest V3 extension

**Project Type**: browser extension, single project

**Performance Goals**: N/A (the change removes code)

**Constraints**: saved meetings must survive the update (FR-007); no user-visible "Notula"
(FR-002); no network request (FR-005); internal names that scripts or stored data depend on stay unchanged

**Scale/Scope**: about 1,460 lines deleted in 5 files; Notula wiring removed from 4 more files
(about 100 references); name and text changes in about 12 non-code files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
| --- | --- | --- |
| I. Data stays on the user's machine | The only network code (`src/utils/notula.ts`, calls to `127.0.0.1`) is deleted. The principle is strengthened by amendment to "no network request". | Pass |
| II. Minimal permissions | No permission is added. None can be dropped: the Notula feature used no permission of its own. The README permissions table is corrected to match the manifest. | Pass |
| III. Never break the call | The injected interceptor and caption observer are not touched. | Pass |
| IV. Simplicity and zero runtime dependencies | Net removal of code; no dependency change. | Pass |
| V. Verified before merge | Typecheck, tests and build must pass. Capture, storage and export paths run through files that are edited, so a live-call check is required, including an update from the previous version with saved meetings. | Pass |
| Technical constraints: storage | No stored shape changes. Old Notula keys are left in place and ignored, so existing data stays readable. | Pass |
| Development workflow | The feature is one logical change (remove Notula, rename). `manifest.json` version is not edited. No formatting-only edits. | Pass |
| Governance | The constitution is amended in this change: new title, and principle I states that the extension makes no network requests. Version 1.0.0 → 1.1.0 (guidance materially expanded). | Pass |

**Post-design re-check**: unchanged. No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/002-rebrand-simple-transcript/
├── plan.md              # This file
├── research.md          # Decisions and alternatives
├── data-model.md        # Stored data: what stays, what is ignored
├── quickstart.md        # How to verify the feature
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

No `contracts/` folder: the feature removes an interface and adds none.

### Source Code (repository root)

```text
DELETED
src/utils/notula.ts               # HTTP client for the Notula desktop app (the only network code)
src/utils/notula-state.ts         # Notula data in chrome.storage.local
src/utils/notula-ui.ts            # connect line, pairing screens, destination menus, promo link
src/background/notula-sync.ts     # pairing and saving logic in the service worker
src/utils/meeting-document.ts     # Markdown document sent to Notula; used by nothing else

EDITED: Notula wiring removed, name changed
src/background/service-worker.ts  # 15 references: import, startup, port and message routing, toolbar title
src/content/floating-popup.ts     # 50 references: imports, panel title, connect line, screens, save lines, styles
src/popup/popup.ts                # 33 references: imports, connect line, screens, save lines
popup.html                        # header title, connect markup, Notula styles
manifest.json                     # name, short_name, description, action title
package.json, package-lock.json   # package name: meetscribe -> simple-transcript

EDITED: name and text
README.md                         # new name; Notula sections, store link and badge removed; permissions table corrected
docs/index.html, docs/privacy.html, docs/store-tile-*.html
WEBSTORE_LISTING.md, PROMOTION.md
shoot/*.cjs, shoot/*.html         # name swap; Notula-only shots removed
.github/workflows/release.yml     # release title and zip file name
.gitattributes                    # Notula merge rule removed (file deleted if empty)
.specify/memory/constitution.md   # title and principle I, version 1.1.0
todo.md                           # item moved to Completed
```

**Structure Decision**: no new files or folders. The feature deletes five modules and edits the
files that referenced them.

## Design Notes

- **Order of work**: remove the callers first (service worker, then the two popups and
  `popup.html`), then delete the five modules. The build fails on any reference that was missed,
  which makes TypeScript the safety net for the removal.
- **Names in the extension**: `manifest.json` gets the full name in `name`, plus `short_name`
  "Simple Transcript". The toolbar title is "Simple Transcript", and "Simple Transcript -
  Recording" while recording. The panel title prefix and the popup header show "Simple
  Transcript".
- **Manifest description**: "Live Google Meet transcription with speaker names. Copy or save any
  call as Markdown, text, JSON or subtitles." It stays within Chrome's 132-character limit.
- **Messages and ports**: `notula_*` message types and the `notula_snapshot` port message are
  removed together with their senders and handlers. No other message type changes.
- **Styles**: CSS that only served the Notula connect line, screens, menus and promo link is
  removed from `floating-popup.ts` and `popup.html`. The shared palette stays; only the comment
  naming it "Notula's palette" is reworded.
- **Stored data**: the keys `notula`, `notulaMeetings`, `notulaFolders` and `notulaNotices` stay
  in users' storage untouched. No migration or cleanup code is added.
- **Internal names**: `MESSAGE_SOURCE`, log prefixes and storage keys are unchanged. The one
  exception is the package name in `package.json`, which changes from `meetscribe` to
  `simple-transcript`. Nothing reads it except npm, so the rename is cosmetic.
- **Website pages and store material**: "Notula for Google Meet" and "Notula" become "Simple
  Transcript"; sentences, sections and links about saving through Notula or about notula.org are
  deleted; nothing else is rewritten. Links to the Notula store listing are removed.
- **Screenshot tooling** (`shoot/`): the shots of Notula-only screens (saved, picker, pairing)
  and their generated images are removed, and names are swapped. The tooling is not re-run in
  this feature; new screenshots belong to the store listing task.
- **Release workflow**: the zip becomes `simple-transcript-<version>.zip` and the release title
  "Simple Transcript <version>".

## Risks

- **A missed reference in a large file.** `floating-popup.ts` is 2,900 lines with 50 Notula
  references mixed into rendering code. Mitigation: the compiler flags every dangling reference
  once the modules are deleted, and the live-call check exercises both popups.
- **Layout gaps where Notula elements were.** Removing the connect line and save lines may leave
  spacing that was tuned around them. Mitigation: visual check of both popups, with and without
  meetings.
- **Behaviour tied to Notula hooks.** The service worker calls Notula when a meeting ends and on
  update. Those calls are removed; the surrounding meeting-end logic (deleting empty meetings)
  must stay. Mitigation: explicit task and live check that an empty meeting is still discarded
  and a real one is kept.

## Out of Scope

- A new icon and colours, and a full rewrite of the website pages, privacy policy and store
  listing (both in `todo.md`).
- An MIT licence file.
- The Notes functionality and the language dropdown (their own planned features).
- The tracked `meetscribe/` folder and `meetscribe.zip`, which predate the Notula rename.
- Deleting leftover Notula data from users' storage.

## Complexity Tracking

No constitution violations to justify.
