# Tasks: Save Transcripts as Plain Text

**Input**: Design documents from `/specs/007-plain-text-export/`

**Tests**: Unit tests are required for the layout (FR-011).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Foundational (blocks both stories)

- [X] T001 [P] Add `meetingAttendees(meeting)` in a new `src/utils/meeting-attendees.ts`: the meeting's participant names, the user included, once each (compared without spacing or letter case), in the order they joined, without names starting with "@" and without code-shaped text (the pattern exported from `src/utils/meeting-title.ts`). Use it for the attendee tags in `src/popup/popup.ts` and `src/content/floating-popup.ts`, for `countParticipants`, and in `meetingFileTitle`, which then removes the user's own name
- [X] T002 [P] Add `tests/meeting-attendees.test.ts`: order kept, the user included, duplicates once, unnamed devices and code-shaped text left out, no participants; the existing `meetingFileTitle` tests must still pass unchanged
- [X] T003 In `src/utils/transcript-store.ts`, rewrite `exportAsText(entries, heading)` with `heading: { title: string; startTime: number; attendees: string[] }`, per `data-model.md`: the title line; the start as `toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })`; "Attendees: " and the names joined with ", ", left out when there are none; a blank line; then per entry "<speaker> (<time>)" with the time from `toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })`, the text, and a blank line; consecutive entries from one speaker not merged; nothing escaped
- [X] T004 In `tests/transcript-export.test.ts`, replace the `exportAsText` tests: the heading lines, the attendees line left out when empty, one block, two consecutive blocks from one speaker kept apart, alternating speakers, "Untitled meeting", an empty transcript, and text with `*`, `#` and `_` kept; the Markdown, SRT, VTT and JSON tests stay as they are

## Phase 2: Copy as plain text (User Story 1)

- [X] T005 [US1] In `src/background/service-worker.ts`, make `formatExport` take the meeting (display title via `meetingDisplayTitle`, start time, `meetingAttendees(meeting)`) for `'txt'`; `EXPORT_MEETING` passes the stored meeting; `EXPORT_TRANSCRIPT` passes the session's meeting, or "Untitled meeting" and the current time when there is none
- [X] T006 [US1] In `src/content/floating-popup.ts`, request `format: 'txt'` for the live call and list entries; format the opened meeting locally with `exportAsText` from `detailMeeting` instead of `exportAsMarkdown`; the copy hint "Copy as Markdown" becomes "Copy", including where it is restored after "Copied!"
- [X] T007 [P] [US1] In `src/popup/popup.ts`, request `format: 'txt'`; the copy hint becomes "Copy", including where it is restored after "Copied!"

## Phase 3: Download a text file (User Story 2)

- [X] T008 [P] [US2] In `src/utils/export-filename.ts` and `tests/export-filename.test.ts`, the file name ends in ".txt"
- [X] T009 [US2] In `src/content/floating-popup.ts` and `src/popup/popup.ts`, download as a `text/plain;charset=utf-8` blob

## Phase 4: Polish

- [X] T010 Run `npm run typecheck`, `npm test` and `npm run build`; run the stricter `--noUnusedLocals` pass
- [X] T011 [P] Update `README.md`: the Export section (plain text, `.txt`, the layout) and the "Export formats" feature line, which lists formats the UI does not offer; `WEBSTORE_LISTING.md` if it mentions Markdown
- [X] T012 Manual, by the maintainer (quickstart.md steps 2 to 5)
- [X] T013 In `todo.md`, move "Save the transcript as plain text…" to Completed with the date

## Dependencies

- T001 before T003's callers (T005, T006); T003 before T005 and T006.
- T005 to T009 change different call sites; T006 and T009 both touch `floating-popup.ts` and `popup.ts`, so run them in order.
- The Markdown exporter and its `'md'` case stay, unused, for the later format chooser.
