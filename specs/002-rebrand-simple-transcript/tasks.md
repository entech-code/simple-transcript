# Tasks: Rebrand to Simple Transcript and Remove Notula

**Input**: Design documents from `/specs/002-rebrand-simple-transcript/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No new automated tests. The existing suite must keep passing; removal and naming are
verified by repository searches and by hand (see quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be implemented and verified
on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)

## Phase 1: Setup

**Purpose**: Record a known-good starting point.

- [X] T001 Run `npm run typecheck`, `npm test` and `npm run build` and confirm all pass with 98 tests before any change
- [X] T002 Manual, by the maintainer: with the current build loaded as the unpacked extension, record at least one meeting and note how many meetings are listed, so the update can be checked in T022

---

## Phase 2: User Story 1 - The extension is called Simple Transcript everywhere (Priority: P1)

**Goal**: Every name the extension shows is the new one.

**Independent Test**: The extensions list shows "Simple Transcript: Copy & Save for Google Meet";
the toolbar tooltip, panel title and popup header show "Simple Transcript".

- [X] T003 [P] [US1] In `manifest.json`, set `name` to "Simple Transcript: Copy & Save for Google Meet", add `short_name` "Simple Transcript", set `description` to "Live Google Meet transcription with speaker names. Copy or save any call as Markdown, text, JSON or subtitles." and set `action.default_title` to "Simple Transcript". Do not change `version`
- [X] T004 [P] [US1] In `src/background/service-worker.ts`, change the toolbar title from `'Notula - Recording'` / `'Notula'` to `'Simple Transcript - Recording'` / `'Simple Transcript'`
- [X] T005 [P] [US1] In `src/content/floating-popup.ts`, change the panel title prefix from "Notula" to "Simple Transcript"
- [X] T006 [P] [US1] In `popup.html`, change the header title from "Notula for Google Meet" to "Simple Transcript" and reword the comment that calls the colours "Notula's palette"
- [X] T007 [P] [US1] In `package.json`, rename the package from `meetscribe` to `simple-transcript`, then run `npm install --package-lock-only` so `package-lock.json` follows

**Checkpoint**: The build succeeds and the new names show; the Notula feature is still present.

---

## Phase 3: User Story 2 - No promotion and nothing leaves the browser (Priority: P1)

**Goal**: The Notula feature, its promotion and the extension's only network code are gone.

**Independent Test**: No Notula row, screen, menu or link in either popup; `git grep -i notula --
src popup.html manifest.json` and the network-code search in quickstart.md step 3 return nothing.

- [X] T008 [US2] In `src/background/service-worker.ts`, remove the `notula-sync` import and every use of it: the `notula.configure` call, the `noteUpdate` call in the install/update handler, the startup `notula.check`, the `notula_snapshot` message and `notula.check` on popup connect, both `notula_`-prefixed message routes, and the `notula.onMeetingEnded` call. Keep the surrounding meeting-end logic that discards a meeting with no transcript and no notes, and reword comments that mention Notula
- [X] T009 [US2] In `src/content/floating-popup.ts`, remove the imports from `notula-ui` and `notula-sync`, the Notula state (snapshot, pairing stage, context), the connect line and "Waiting for Notula" markup, the `screen` element and its rendering, the save and live lines on meetings, the destination menu, the promo link, `sendNotula` and its handlers, the handling of `notula_snapshot`, and the CSS that only served those elements
- [X] T010 [P] [US2] In `src/popup/popup.ts`, remove the imports from `notula-ui` and `notula-sync`, the Notula state and context, the connect line handling, the screen rendering, the save lines on meetings, the destination menu and the handling of `notula_snapshot`
- [X] T011 [P] [US2] In `popup.html`, remove the connect offer and "Waiting for Notula" elements, the `screen` element, and the CSS that only served the Notula connect line, screens, menus and promo link
- [X] T012 [US2] Delete `src/utils/notula.ts`, `src/utils/notula-state.ts`, `src/utils/notula-ui.ts`, `src/background/notula-sync.ts` and `src/utils/meeting-document.ts`
- [X] T013 [US2] Run `npm run typecheck` and `npm run build`; fix every reference the compiler reports. Then run `git grep -n -i notula -- src popup.html manifest.json` and `git grep -n -E "fetch\(|XMLHttpRequest|WebSocket\(|sendBeacon|127\.0\.0\.1" -- src`; both must return nothing

**Checkpoint**: The extension builds with no Notula code and no network code.

---

## Phase 4: User Story 3 - Everything else keeps working (Priority: P1)

**Goal**: Saved meetings survive the update and transcription, the meetings list and exports
behave as before.

**Independent Test**: quickstart.md steps 6 and 7.

- [X] T014 [US3] Run `npm test` and confirm all 98 tests pass
- [X] T015 [US3] Review `src/content/floating-popup.ts`, `src/popup/popup.ts` and `popup.html` for layout that depended on the removed elements (spacing, empty containers, a footer that held only the promo link) and remove what is left over, so neither popup shows a gap or an empty row

**Checkpoint**: Code complete for the extension itself.

---

## Phase 5: Polish & Repository Material

- [ ] T016 [P] Rewrite `README.md` for the new name: title "Simple Transcript: Copy & Save for Google Meet"; remove the Chrome Web Store link and install section for the Notula listing, the "Save to a Git repo" feature line, and the "Saving into a Git repository" and "How it talks to Notula" sections; correct the permissions table to match `manifest.json` (`storage`, `activeTab`, `tabs`, `alarms`, host `meet.google.com`); state that the extension makes no network requests
- [ ] T017 [P] In `docs/index.html`, `docs/privacy.html`, `docs/store-tile-marquee.html`, `docs/store-tile-small.html`, `WEBSTORE_LISTING.md` and `PROMOTION.md`, replace "Notula for Google Meet" and "Notula" with "Simple Transcript", and delete sentences, sections and links about saving through Notula, about notula.org or pointing to the Notula store listing. Change nothing else
- [ ] T018 [P] In `shoot/`, replace the Notula name in `page.cjs`, `shots.cjs`, `tiles.cjs` and `tile.html`; remove the shots of Notula-only screens (saved, picker, pairing) from the scripts and delete their images under `shoot/out/`. Do not run the tooling
- [ ] T019 [P] In `.github/workflows/release.yml`, change the zip name to `simple-transcript-<version>.zip` (both places) and the release name to "Simple Transcript <version>"; delete `.gitattributes`, whose only line is the Notula merge rule
- [ ] T020 [P] Amend `.specify/memory/constitution.md`: title "Simple Transcript Constitution"; in principle I add "The extension MUST NOT make any network request."; set the version to 1.1.0 and the amendment date to 2026-10-05
- [ ] T021 Run quickstart.md steps 1 to 3 and step 8, including `git grep -n -i notula -- . ':!specs' ':!todo.md' ':!.specify' ':!.claude'`, which must return nothing
- [ ] T022 Manual, by the maintainer (quickstart.md steps 4 to 7): reload the unpacked extension without removing it; confirm the names, that no Notula element or gap remains in either popup, that the meetings from T002 are all listed and open, that a new call is transcribed, renamed, copied and exported as before, that a call without captions leaves no empty meeting, and that the service worker shows no network requests and no errors
- [ ] T023 In `todo.md`, move "Remove Notula from the branding…" to Completed with the date and a short summary of what changed

---

## Dependencies & Execution Order

- **Setup (T001–T002)**: first. T002 must happen before the new build is loaded.
- **User Story 1 (T003–T007)**: independent single-line edits in five different files.
- **User Story 2 (T008–T013)**: T008–T011 remove the callers; T012 deletes the modules only after
  them; T013 verifies. T009 touches the same file as T005, and T011 the same file as T006, so
  within a file do the rename first.
- **User Story 3 (T014–T015)**: after T013.
- **Polish (T016–T023)**: T016–T020 can start any time; T021 and T022 need everything else.

## Parallel Opportunities

- T003–T007 with each other
- T010 and T011 with T009
- T016–T020 with each other

## Implementation Strategy

- **Stop after Phase 3** for review: at that point the extension is renamed and Notula-free, and
  the diff is the risky part of the feature (the service worker and the two popups).
- **Then Phases 4 and 5**: clean-up of leftovers, the documents, and the manual check in a live
  call before merging.
