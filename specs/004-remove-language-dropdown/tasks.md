# Tasks: Remove the Language Dropdown

**Input**: Design documents from `/specs/004-remove-language-dropdown/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No new automated tests. The existing suite must pass unchanged; behaviour is checked by
hand in live calls (see quickstart.md).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2, US3)

## Phase 1: Setup

- [X] T001 Run `npm run typecheck`, `npm test` and `npm run build` and confirm all pass with 98 tests before any change

---

## Phase 2: User Story 1 - One place to set the language (Priority: P1)

**Goal**: The floating panel has no language control.

**Independent Test**: quickstart.md step 3.

- [X] T002 [US1] In `src/content/floating-popup.ts`, remove the `lang-select` element, `buildLanguageSelector` and the recent-languages state, the change handler, the handling of `MSG.LANGUAGE_CHANGE` and of the `language_set` port message, the line that shows or hides the dropdown per view, the `LANGUAGE_CODES` import and the `.lang-select` styles; check the toolbar still lays out the Copy and Export buttons cleanly

---

## Phase 3: User Story 2 - The extension never changes Meet's language (Priority: P1)

**Goal**: No code sets, re-sends, remembers or observes the caption language.

**Independent Test**: quickstart.md steps 2, 5 and 6.

- [X] T003 [US2] In `src/background/service-worker.ts`, remove `syncLanguageToMeet` and its three calls, `rememberLanguage`, and the `MSG.LANGUAGE_CHANGE` and `MSG.LANGUAGE_OBSERVED` handlers; reword comments that mention the language
- [X] T004 [P] [US2] In `src/content/content-bridge.ts`, remove the relay of `MSG.LANGUAGE_OBSERVED` from the page and of `MSG.LANGUAGE_CHANGE` to the page; keep the relay of `MSG.REFRESH_DEVICES`
- [X] T005 [P] [US2] In `src/content/caption-observer.ts`, remove the `captions_enabling` message posted before each click and its constant, and reword the comment above `clickAndWait`; keep the clicks that turn captions on
- [X] T006 [US2] In `src/injected/interceptor.ts`, remove the caption-language section: the wanted and sent language state and its counters and timers, `setWantedLanguage`, `nudgeLanguage`, `schedulePush`, `applyLanguage`, `persistLanguageCode`, `sendUpdateMediaSession`, `watchMediaSession` and its three call sites, `dialogOpen`, `noteMeetCaptionConfig` and its call site, `checkCaptionLanguage` and its two call sites, the handling of `MSG.LANGUAGE_CHANGE` and `MSG.CAPTIONS_ENABLING`, and the capture of the session identifier. Keep the `fetch` and data-channel wrappers, the captured request headers, the captured participant "sync" request, `refreshDeviceInfo` and both caption handlers. Before removing each item, confirm every use of it is language-related
- [X] T007 [US2] Delete `src/utils/protobuf-encoder.ts` and `src/utils/language-script.ts`
- [X] T008 [US2] In `src/utils/types.ts`, remove `LANGUAGE_CHANGE`, `LANGUAGE_OBSERVED` and `CAPTIONS_ENABLING` from `MSG`, and `language` and `languageByCode` from `Settings` and `DEFAULT_SETTINGS`; in `src/utils/constants.ts`, remove `LANGUAGE_CODES` and `LOCALE_TO_LANG_ID` if nothing else uses them

---

## Phase 4: User Story 3 - Transcription keeps working in every language (Priority: P1)

**Goal**: Nothing else changed.

**Independent Test**: quickstart.md steps 1, 4 and 7.

- [X] T009 [US3] Run `npm run typecheck`, `npm test` and `npm run build`; fix every reference the compiler reports; confirm the 98 tests pass with no test file changed; run a stricter pass with `--noUnusedLocals` and remove anything this change left unused. Then run the search in quickstart.md step 2, which must return nothing
- [X] T010 [US3] Read the final diff of `src/injected/interceptor.ts` in full and confirm that the caption handlers, the `fetch` wrapper's capture of headers and of the participant request, and `refreshDeviceInfo` are unchanged apart from the removed language calls

---

## Phase 5: Polish

- [X] T011 [P] In `README.md`, replace the "31 languages" feature line and the "Language" section with a statement that the transcript follows the caption language set in Google Meet, and remove the caption-language request from the paragraph about requests to Google Meet
- [X] T012 [P] In `WEBSTORE_LISTING.md`, replace the line about 31 languages, picking a language and a recurring call keeping it with a statement that the transcript follows Meet's caption language
- [X] T013 [P] In `.specify/memory/constitution.md`, change principle I so that the only request listed is refreshing the participant list; set the version to 1.1.2
- [X] T014 Manual, by the maintainer (quickstart.md steps 3 to 7): reload the unpacked extension without removing it; confirm the panel has no dropdown; captions start automatically and are transcribed with speaker names; a language chosen in Meet's caption settings stays and is transcribed, including one in a non-Latin script; no error appears in the Meet tab's console or the service worker's
- [X] T015 In `todo.md`, move "Remove the language dropdown…" to Completed with the date and a short summary

---

## Dependencies & Execution Order

- T002 first: it removes the only sender of a language choice.
- T003 before T008 (the service worker uses the message names and settings fields). T004 and T005 can run alongside T003.
- T006 after T003–T005, so that nothing still sends the page a language message.
- T007 after T006 (the interceptor is their only user). T008 after T002–T007.
- T009 and T010 after T008. T011–T013 can run any time. T014 needs the build from T009.

## Implementation Strategy

Stop after T010 for review. The diff of `src/injected/interceptor.ts` is the part to read, and the
live check (T014) is what proves caption capture was not disturbed.
