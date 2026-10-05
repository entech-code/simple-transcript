# Tasks: Show the Meeting's Name Instead of Its Code

**Input**: Design documents from `/specs/005-meeting-name/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Unit tests are required for the name function (FR-010). Everything else is checked by
hand in live calls (see quickstart.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)

## Phase 1: Setup

- [ ] T001 Run `npm run typecheck`, `npm test` and `npm run build` and confirm all pass with 98 tests before any change

---

## Phase 2: Foundational

**Purpose**: The name function that both title stories depend on.

- [ ] T002 Create `tests/meeting-title.test.ts` with a test for every row of the "Name from a tab title" table in `specs/005-meeting-name/data-model.md`, plus: a code compared without regard to letter case, a name that merely contains the code, and a title with no space around the separator. Run it and confirm it fails because the module does not exist
- [ ] T003 Create `src/utils/meeting-title.ts` exporting `meetingNameFromTabTitle(tabTitle: string | undefined, meetingCode: string): string | null`: accept "Meet", optional spaces, a hyphen or dash, then text; trim the text; return `null` when the title is missing or not in that form, or when the text is empty or equals the meeting code. Run the tests and confirm they pass

---

## Phase 3: User Story 1 - A named call is saved under its name (Priority: P1) 🎯 MVP

**Goal**: A call's name from Google Meet becomes the meeting's title.

**Independent Test**: quickstart.md steps 2 and 5.

- [ ] T004 [US1] In `src/utils/meeting-store.ts`, rename `renameMeeting` to `setMeetingTitle(id, title)` (same behaviour: set the title and save), and make `createMeeting` title a new meeting with its code only, without calling `findTitleByCode`
- [ ] T005 [US1] In `src/background/service-worker.ts`, add `applyMeetName(sessionId, tabTitle)`: find the session's meeting, compute `meetingNameFromTabTitle(tabTitle, meeting.meetingCode)`, and when it yields a name that differs from the title, call `setMeetingTitle` and broadcast `meeting_renamed` for that session. A missing meeting or no name changes nothing
- [ ] T006 [US1] In `src/background/service-worker.ts`, call `applyMeetName` in two places: in the existing `chrome.tabs.onUpdated` listener when `changeInfo.title` is present and the tab belongs to a session (after `sessionStateReady`), and after a meeting is created or resumed for a session, using the tab's current title from `chrome.tabs.get`. Also remove the use of `findTitleByCode` where a meeting's code becomes known

**Checkpoint**: A named call shows its name in the panel and the list.

---

## Phase 4: User Story 2 - A call without a name keeps its code (Priority: P1)

**Goal**: No name means the code, and nothing breaks.

**Independent Test**: quickstart.md step 3; the unit tests for "no name".

- [ ] T007 [US2] Confirm by reading `applyMeetName` and its two callers that a `null` name, a failed `chrome.tabs.get`, and a tab with no session each leave the title untouched and raise no error; wrap the `chrome.tabs.get` call so a closed tab cannot reject unhandled

---

## Phase 5: User Story 3 - Titles are not edited by hand (Priority: P2)

**Goal**: No rename controls, messages or functions remain.

**Independent Test**: quickstart.md step 4, including its search.

- [ ] T008 [US3] In `src/content/floating-popup.ts`, remove the "Live title rename" block (double-click editing of the panel title and the earlier-titles suggestions with their styles), the rename button and its handler in both the list item and the restored actions, the double-click, blur and keydown handlers on a list title, the keyboard guard for editable elements, the `contenteditable` checks in click handlers, and the styles for an editable title
- [ ] T009 [P] [US3] In `src/popup/popup.ts`, remove the rename button and its handler in both the list item and the restored actions, the double-click, blur and keydown handlers on a title, and the `contenteditable` check in the click handler; in `popup.html`, remove the style for an editable title
- [ ] T010 [US3] In `src/background/service-worker.ts`, remove the `RENAME_MEETING` and `GET_MEETING_TITLES` handlers and their imports; in `src/utils/meeting-store.ts`, delete `findTitleByCode` and `getMeetingTitles`; in `src/utils/types.ts`, remove `RENAME_MEETING` and `GET_MEETING_TITLES`

---

## Phase 6: Long titles and button placement (FR-012 to FR-014)

- [ ] T011 [P] In `src/content/floating-popup.ts`, style a list title to wrap to at most two lines with an ellipsis and set its `title` attribute to the full text; move the action buttons from the title's row to the right end of the date line, shown on hover and focus
- [ ] T012 [P] In `popup.html` and `src/popup/popup.ts`, apply the same two-line title, tooltip and button placement to the list

---

## Phase 7: User Story 4 - An opened meeting looks like its entry in the list (Priority: P2)

**Goal**: The detail view starts with the meeting's block from the list, buttons always visible.

**Independent Test**: quickstart.md step 4a.

- [ ] T013 [US4] In `src/popup/popup.ts`, make the function that builds a list entry usable for the detail view: a flag keeps the buttons visible and makes the block not clickable, and a callback runs after a confirmed delete. Open a meeting by passing its summary, render a "← Meetings" back row and, below it, the block, both above the transcript in a part of the view that does not scroll; keep "Simple Transcript" in the header in every view; and remove the header's back arrow and its own copy and download buttons with their handlers; in `popup.html`, remove those elements and add the styles for the back row and the detail block
- [ ] T014 [US4] In `src/content/floating-popup.ts`, do the same for the panel's detail view: keep the existing "← Meetings" back row at the top, render the meeting's block below it and above the transcript, show "Simple Transcript" alone in the title bar instead of the meeting's title, and return to the list after a confirmed delete
- [ ] T014a [US4] In `src/content/floating-popup.ts`, show the same block in the live view for the call in progress: copy and export buttons only, the start date and time without a duration, and no block when no call is in progress; rebuild it on `meeting_snapshot`, `meeting_started`, `meeting_renamed`, `participant_update` and `meeting_ended`; make the panel's title bar a fixed "Simple Transcript" and remove the code that sets it per view; remove the Copy and Export toolbar and its styles, wiring the live block's buttons to the existing copy and export handlers

---

## Phase 8: Polish

- [ ] T015 Run `npm run typecheck`, `npm test` and `npm run build`; run a stricter pass with `--noUnusedLocals` and remove anything this change left unused; run the search in quickstart.md step 4, which must return nothing
- [ ] T016 [P] In `README.md`, change the usage line so it no longer mentions renaming meetings, and say that a meeting is titled with its Google Meet name when it has one; add `meeting-title.test.ts` to the table in `tests/README.md`; check `WEBSTORE_LISTING.md` for a mention of renaming and remove it
- [ ] T017 Manual, by the maintainer (quickstart.md steps 2 to 8): reload the unpacked extension without removing it and refresh the Meet tab; confirm a named call shows its name in the panel and the lists, a long name wraps to two lines with a tooltip, the buttons appear on the date line, an opened meeting shows the same block with the buttons visible, an instant call shows its code, no rename control exists, existing meetings keep their titles, and captions are captured as before
- [ ] T018 In `todo.md`, move "Show the name of the meeting…" to Completed with the date and a short summary, and remove the screenshot it refers to if it is no longer used

---

## Dependencies & Execution Order

- T002 before T003 (the test is written first and seen to fail).
- T004 before T005 and T006. T007 after T006.
- T008–T010 after T006, so the rename function is already repurposed before its old callers go. T010 last of the three, once nothing sends the removed messages.
- T011 and T012 after T008 and T009 (same files). T013 after T012; T014 after T011.
- T015 after all code tasks. T017 needs the build from T015.

## Implementation Strategy

- **MVP**: Phases 1 to 4. A named call gets its name; renaming still exists but is harmless.
- **Then** Phases 5 to 7 remove renaming, handle long titles and rebuild the top of the detail view.
- Stop after T015 for review and the live check (T017) before committing.
