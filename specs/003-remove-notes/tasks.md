# Tasks: Remove the Notes Functionality

**Input**: Design documents from `/specs/003-remove-notes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No new automated tests. The existing suite must pass unchanged; the interface is checked
by hand (see quickstart.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)

## Phase 1: Setup

- [X] T001 Run `npm run typecheck`, `npm test` and `npm run build` and confirm all pass with 98 tests before any change

---

## Phase 2: User Story 1 - The panel shows the transcript and nothing else (Priority: P1)

**Goal**: No notes anywhere in the interface.

**Independent Test**: quickstart.md steps 3 and 4.

- [X] T002 [US1] In `src/content/floating-popup.ts`, remove the Notes section markup, its element references, the `notes` and `detailNotes` state, note rendering, adding, editing and deleting, the handling of `note_added`, `note_updated` and `note_deleted`, the `notes` field read from `meeting_snapshot` and from the meeting-entries response, the notes block in the meeting detail, and the CSS that only served notes
- [X] T003 [US1] In `src/content/floating-popup.ts`, remove the "Transcription" section header, its chevron and the section collapse code, and adjust the styles so the transcript fills the live view
- [X] T004 [US1] In `src/content/floating-popup.ts`, make the footer count transcript lines only
- [X] T005 [P] [US1] In `src/popup/popup.ts`, remove the notes block from the meeting detail, treat a meeting as empty when it has no entries, and make the footer count lines only
- [X] T006 [P] [US1] In `popup.html`, remove the `.detail-notes`, `.detail-notes-title`, `.note-item`, `.note-time` and `.note-text` styles

---

## Phase 3: User Story 2 - Copies and exports contain only the transcript (Priority: P1)

**Goal**: No notes block in any export.

**Independent Test**: the export tests pass unchanged.

- [X] T007 [US2] In `src/utils/transcript-store.ts`, delete `formatNotesBlock` and remove the `notes` parameter and the notes block from `exportAsText` and `exportAsMarkdown`
- [X] T008 [US2] In `src/background/service-worker.ts`, stop passing notes to `formatExport` and remove its `notes` parameter

---

## Phase 4: User Story 3 - Everything else keeps working (Priority: P1)

**Goal**: The note messages, functions and types are gone, and the rest is intact.

**Independent Test**: quickstart.md steps 1, 2, 5 and 7.

- [X] T009 [US3] In `src/background/service-worker.ts`, remove the `ADD_NOTE`, `UPDATE_NOTE` and `DELETE_NOTE` handlers and the note imports, drop `notes` from the `meeting_snapshot` message and the meeting-entries response, and change both empty-meeting checks to "no transcript lines"; reword the comments that mention notes
- [X] T010 [US3] In `src/utils/meeting-store.ts`, delete `addNote`, `updateNote`, `deleteNote` and `getNotes`, and stop giving a new meeting a `notes` list
- [X] T011 [US3] In `src/utils/types.ts`, delete `NoteEntry`, the `notes` field of `Meeting`, and the `ADD_NOTE`, `UPDATE_NOTE` and `DELETE_NOTE` message names
- [X] T012 [US3] Run `npm run typecheck`, `npm test` and `npm run build`; fix every reference the compiler reports; confirm the 98 tests pass with no test file changed. Then run the search in quickstart.md step 2, which must return nothing

---

## Phase 5: Polish

- [X] T013 Manual, by the maintainer (quickstart.md steps 3 to 7): reload the unpacked extension without removing it; confirm the live view has no Notes section and no Transcription header and the transcript fills the panel at small and large sizes; past meetings open with their transcripts; copy and export work; a call without captions leaves no meeting
- [X] T014 In `todo.md`, move "Remove the Notes functionality" to Completed with the date and a short summary

---

## Dependencies & Execution Order

- T002–T004 edit the same file and run in order. T005 and T006 can run alongside them.
- T007 before T008. T009 after T008 (same file).
- T010 and T011 come after all callers are removed (T002–T009), so the compiler can confirm nothing still uses them.
- T012 after T011. T013 needs the build from T012.
