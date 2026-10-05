# Implementation Plan: Remove the Notes Functionality

**Branch**: `feat/remove-notes` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-remove-notes/spec.md`

## Summary

Remove notes from the extension: the Notes section in the floating panel, the notes shown with a
past meeting in both popups, the three note messages and their storage functions, and the notes
block in the Markdown and text exports. Nothing replaces them. Notes already stored inside saved
meetings are left where they are and no longer read.

With Notes gone the live view has a single section, so the "Transcription" header and its
collapse control are removed too and the transcript fills the panel.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), target ES2022

**Primary Dependencies**: none at runtime; no dependency is added or removed

**Storage**: `chrome.storage.local`, key `meetings`. New meetings are created without a `notes`
list. The `notes` list on already-saved meetings is not read, changed or removed

**Testing**: the existing Vitest suite (`npm test`, 98 tests). The export tests already describe
output without notes and must pass unchanged. The interface is checked by hand in a live call

**Target Platform**: Chrome Manifest V3 extension

**Project Type**: browser extension, single project

**Performance Goals**: N/A (the change removes code)

**Constraints**: exports for meetings without notes must be identical to today (FR-005); saved
meetings must stay listed with full transcripts (FR-008); stored notes must cause no error
(FR-009)

**Scale/Scope**: 7 files edited, none added or deleted; about 135 references to notes removed,
most of them in `floating-popup.ts`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
| --- | --- | --- |
| I. Data stays on the user's machine | No network code is added. Stored notes are neither sent nor erased. | Pass |
| II. Minimal permissions | `manifest.json` is not touched. | Pass |
| III. Never break the call | The injected interceptor and caption observer are not touched. | Pass |
| IV. Simplicity and zero runtime dependencies | Net removal of code and of a feature outside the product's core; no dependency change. | Pass |
| V. Verified before merge | Typecheck, tests and build must pass. Storage and export code is edited, so a live-call check is required, including an update over saved meetings that have notes. | Pass |
| Technical constraints: storage | The stored shape loses an optional part going forward; existing meetings stay readable because the extra `notes` list on them is ignored. | Pass |
| Development workflow | One logical change on `feat/remove-notes`; no formatting-only edits; `manifest.json` version not edited. | Pass |

**Post-design re-check**: unchanged. No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-remove-notes/
├── plan.md              # This file
├── research.md          # Decisions and alternatives
├── data-model.md        # What changes in stored meetings and messages
├── quickstart.md        # How to verify the feature
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

No `contracts/` folder: the feature removes internal messages and adds no interface.

### Source Code (repository root)

```text
EDITED
src/utils/types.ts                # NoteEntry and Meeting.notes removed; ADD_NOTE, UPDATE_NOTE, DELETE_NOTE removed
src/utils/meeting-store.ts        # addNote, updateNote, deleteNote, getNotes removed; new meetings have no notes list
src/utils/transcript-store.ts     # formatNotesBlock removed; exportAsText and exportAsMarkdown lose the notes parameter
src/background/service-worker.ts  # 3 note message handlers removed; notes dropped from snapshots, responses and exports;
                                  # a meeting is empty when it has no transcript lines
src/content/floating-popup.ts     # Notes section, its state, handlers, rendering and styles removed;
                                  # Transcription header removed; footer counts lines only
src/popup/popup.ts                # notes block in the meeting detail removed; footer counts lines only
popup.html                        # styles for the notes block removed
todo.md                           # item moved to Completed
```

**Structure Decision**: no files are added or deleted. `README.md` and `WEBSTORE_LISTING.md` do
not mention notes and need no change.

## Design Notes

- **Order of work**: remove the callers first (the popups, then the service worker), then the
  functions and types they used. Once `NoteEntry` and the message names are deleted, the compiler
  reports any reference that was missed.
- **Stored notes stay put.** The store saves whole meeting objects, so a `notes` list that an old
  meeting already carries is written back unchanged each time, without any code naming it. No
  migration or clean-up runs.
- **Empty-meeting rule**: in the two places that decide whether a meeting is empty (when a call
  ends, and the sweep of orphaned meetings), the test becomes "no transcript lines". Saved
  meetings are not re-examined on update, so an old meeting that has only notes stays in the list.
- **Exports**: `exportAsText` and `exportAsMarkdown` lose their optional notes parameter. Called
  without notes they already produce today's output, which is what the tests check.
- **Live view layout**: the Notes section and the Transcription header both go, along with the
  collapse behaviour, which made sense only with two sections. The transcript area takes the full
  height of the panel.
- **Messages**: `note_added`, `note_updated` and `note_deleted` are no longer broadcast, and the
  `notes` field is dropped from `meeting_snapshot` and from the meeting-entries response.

## Risks

- **Layout of the live view.** Styles for the transcript were written for a two-section panel.
  Mitigation: visual check of the live view at small and large panel sizes.
- **A missed reference in the floating panel**, which holds most of the note code. Mitigation: the
  compiler after the types are removed, and the live-call check.

## Out of Scope

- Erasing stored notes from users' browsers.
- Deleting saved meetings that contain only notes.
- The language dropdown and the other planned removals.

## Complexity Tracking

No constitution violations to justify.
