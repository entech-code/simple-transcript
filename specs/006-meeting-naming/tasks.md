# Tasks: Name Untitled Meetings and Downloaded Transcripts

**Input**: Design documents from `/specs/006-meeting-naming/`

**Tests**: Unit tests are required for both naming rules (FR-009).

## Format: `[ID] [P?] [Story] Description`

## Phase 1: File names (User Story 2)

- [X] T001 [US2] Rewrite `exportFileName` in `src/utils/export-filename.ts` to Google's order with the date as `YYYY-MM-DD` and the time as `HH-mm`, keeping letters in any script, replacing characters invalid in file names with spaces, collapsing spaces, limiting the title to 100 characters, removing a trailing dot or space, and falling back to "Untitled meeting" (draft written before the spec)
- [X] T002 [US2] Rewrite `tests/export-filename.test.ts` for the new format (draft written before the spec)

## Phase 2: Names for meetings without a title (User Story 1)

- [X] T003 [US1] In `src/utils/types.ts`, add optional `selfName` to `Meeting`
- [X] T003a [US1] In `src/utils/meeting-store.ts`, start a new meeting with an empty title instead of its Meet code; in `src/background/service-worker.ts`, stop the unknown-code patch from copying the code into the title
- [X] T004 [US1] In `src/utils/meeting-title.ts`, keep `meetingDisplayTitle` (the title, else "Untitled meeting"; done) and add `meetingFileTitle(meeting)` taking `participants` and `selfName` and applying the attendee rules in `data-model.md`, including "Untitled meeting" when the user's name is unknown and one name remains
- [X] T005 [US1] In `tests/meeting-title.test.ts`, test each row of the attendee table in `data-model.md`, the user's name left out, an unknown user's name with one and with two attendees, duplicate names, unnamed devices, and real titles kept
- [X] T006 [US1] In `src/injected/interceptor.ts`, send the device from `CreateMeetingDevice` with `self: true` (Meet no longer sets `data-self-name`); in `src/content/caption-observer.ts`, reject code-shaped text as a name
- [X] T007 [US1] In `src/background/service-worker.ts`, keep the own name on the session and store it as the meeting's `selfName` when the meeting exists, broadcasting `meeting_renamed`
- [X] T008 [P] [US1] In `src/content/floating-popup.ts`, take `selfName` from `meeting_renamed` along with the title, and name downloads with `meetingFileTitle` for the live call, an opened meeting and list entries
- [X] T009 [P] [US1] In `src/popup/popup.ts`, name downloads with `meetingFileTitle` for list entries and the opened meeting; the display name stays "Untitled meeting" (draft)

## Phase 3: Polish

- [X] T010 Run `npm run typecheck`, `npm test` and `npm run build`; run the stricter `--noUnusedLocals` pass
- [X] T011 [P] Update `README.md` (Export section: the new file name; untitled meetings) and `WEBSTORE_LISTING.md` if they describe file names
- [ ] T012 Manual, by the maintainer (quickstart.md steps 2 to 6)
- [X] T013 In `todo.md`, move "Name saved transcript files…" and "Call a meeting without a title…" to Completed with the date
