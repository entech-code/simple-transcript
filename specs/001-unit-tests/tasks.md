# Tasks: Automated Unit Tests for Browser-Free Logic

**Input**: Design documents from `/specs/001-unit-tests/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: This feature *is* the test suite, so the test files are the implementation tasks.

**Organization**: Tasks are grouped by user story so each story can be implemented and verified
on its own.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story the task belongs to (US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the test runner and make `npm test` and type checking of tests work.

- [ ] T001 Add `vitest` (version 5) to `devDependencies` and a `"test": "vitest run"` script in `package.json`, then run `npm install`
- [ ] T002 [P] Create `vitest.config.ts` at the repository root: Node environment, include `tests/**/*.test.ts`, and set the time zone to UTC for the test run
- [ ] T003 Create `tsconfig.test.json` extending `tsconfig.json` with `noEmit`, `rootDir` set to `.` and `include` covering `src/**/*.ts`, `tests/**/*.ts` and `vitest.config.ts`; change the `typecheck` script in `package.json` to run both `tsc --noEmit` and `tsc --noEmit -p tsconfig.test.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The message builder every parsing test depends on.

- [ ] T004 Create `tests/helpers/proto-builder.ts`: a test-only builder that writes varint fields, text fields, raw byte fields and nested messages and returns a `Uint8Array`. It must not import from `src/utils/protobuf-encoder.ts`

**Checkpoint**: `npm test` runs (with no tests yet) and `npm run typecheck` passes.

---

## Phase 3: User Story 1 - Caption parsing is checked automatically (Priority: P1) 🎯 MVP

**Goal**: One command confirms that messages from both caption channels, and participant and chat
messages, are read correctly and that bad input never raises an error.

**Independent Test**: `npm test` passes on an unmodified checkout; breaking the text field read in
`parseCaptionMessage` or the raw decoding in `parseCaptionMessageV2` makes at least one test fail.

- [ ] T005 [US1] Create `tests/helpers/samples.ts` with the sample messages listed in `specs/001-unit-tests/data-model.md` (standard caption, caption with text in the alternate field, keepalive, caption v2 standard, caption v2 mostly text, caption v2 later revision, non-Latin captions, device update, chat message, malformed set), built with `tests/helpers/proto-builder.ts` to the structures documented in `src/utils/rtc-message-parser.ts`. Every name, sentence and identifier is invented; device paths use `spaces/<id>/devices/<n>` with a made-up id
- [ ] T006 [P] [US1] Create `tests/protobuf-decoder.test.ts` covering `decodeProtobuf` and `decodeProtobufRaw` from `src/utils/protobuf-decoder.ts`: varint, text, nested and fixed-width fields, and empty, truncated and over-long-length input returning without an error
- [ ] T007 [US1] Create `tests/caption-parser.test.ts` covering `parseCaptionMessage` and `parseCaptionMessageV2` from `src/utils/rtc-message-parser.ts`: device, message identity, revision and text for each channel; text in the alternate field; keepalive and unrelated messages returning `null`; Cyrillic and Japanese text unchanged; every malformed sample returning `null` without throwing. Silence `console.debug` in this file
- [ ] T008 [US1] Add the `captions_v2` regression test to `tests/caption-parser.test.ts`: for the "mostly text" v2 sample, assert that `decodeProtobuf` flattens the nested content and that `parseCaptionMessageV2` still returns the correct text, message identity and revision (SC-002)
- [ ] T009 [P] [US1] Create `tests/rtc-messages.test.ts` covering `parseDeviceInfo`, `parseDeviceCollection` and `parseChatMessage` from `src/utils/rtc-message-parser.ts` with the device and chat samples, plus malformed input returning no result without throwing
- [ ] T010 [US1] Run `npm test` and `npm run typecheck`; fix failures in the test code. If a test exposes a defect in `src/`, stop and report it instead of changing production behaviour

**Checkpoint**: User Story 1 is complete and independently verifiable.

---

## Phase 4: User Story 2 - Exported transcripts are checked automatically (Priority: P2)

**Goal**: One command confirms that all five export formats and the export file name still produce
exactly the expected output.

**Independent Test**: `npm test` passes; changing the output of one export format makes only that
format's test fail.

- [ ] T011 [US2] Create `src/utils/export-filename.ts` exporting `exportFileName(title: string, startTime: number): string`, reproducing the current rule exactly: remove characters other than letters, digits, space, underscore and hyphen from the title and trim it, then a space, the start time as `YYYYMMDDHHmm` in local time, and `.md`
- [ ] T012 [US2] In `src/content/floating-popup.ts`, change `download()` to set `a.download` from `exportFileName(title, startTime)` and remove the inline name-building lines; change nothing else in the file
- [ ] T013 [P] [US2] In `src/popup/popup.ts`, change `download()` to set `a.download` from `exportFileName(title, startTime)` and remove the inline name-building lines; change nothing else in the file
- [ ] T014 [US2] Add the sample transcript and its variants (standard with at least two invented speakers and one non-Latin entry, empty transcript, titles with invalid characters and an empty title) to `tests/helpers/samples.ts`, with fixed UTC times
- [ ] T015 [US2] Create `tests/transcript-export.test.ts` covering `exportAsMarkdown`, `exportAsText`, `exportAsJson`, `exportAsSrt` and `exportAsVtt` from `src/utils/transcript-store.ts` against exact expected output, for the standard and the empty transcript, without notes. Force the `en-US` locale for `toLocaleTimeString` and `toLocaleDateString` inside the tests
- [ ] T016 [P] [US2] Create `tests/export-filename.test.ts` covering `exportFileName` from `src/utils/export-filename.ts`: a normal title, a title with invalid characters, an empty title, and zero-padding of month, day, hour and minute
- [ ] T017 [US2] Run `npm test`, `npm run typecheck` and `npm run build`; confirm `dist/` contains the same six bundles and nothing from `tests/`

**Checkpoint**: User Stories 1 and 2 both pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [ ] T018 In `.github/workflows/release.yml`, change `node-version` from 20 to 22 and add a `Test` step running `npm test` after the `Typecheck` step and before `Build` (FR-008)
- [ ] T019 [P] Create `tests/README.md` explaining how to run the tests and how to add a new sample message with its expected result, including how to replace real names, speech and identifiers with invented values (FR-007)
- [ ] T020 [P] Add a short "Testing" section to `README.md` with the `npm test` command and a link to `tests/README.md`
- [ ] T021 Run steps 1 to 6 of `specs/001-unit-tests/quickstart.md`, including the deliberate-break checks for both caption channels and each export format, and revert every deliberate break
- [ ] T022 Manual check by the maintainer (step 7 of `specs/001-unit-tests/quickstart.md`): in a live Google Meet call, export a meeting from the floating popup and from the toolbar popup and confirm the file name is `<title> <YYYYMMDDHHmm>.md` as before

---

## Dependencies & Execution Order

- **Setup (T001–T003)**: no dependencies. T002 can run alongside T001; T003 follows T001 because both edit `package.json`.
- **Foundational (T004)**: needs Setup. Blocks User Story 1.
- **User Story 1 (T005–T010)**: needs T004. T005 comes first; T006 and T009 can run in parallel with T007; T008 follows T007 (same file).
- **User Story 2 (T011–T017)**: needs Setup only, so it does not depend on User Story 1, except that T014 edits `tests/helpers/samples.ts` created in T005. T012 and T013 follow T011; T015 follows T014; T016 follows T011.
- **Polish (T018–T022)**: needs both stories. T022 needs a built extension and a live call.

## Parallel Opportunities

- T002 with T001
- T006 and T009 with T007
- T013 with T012; T016 with T015
- T019 and T020 with T018

## Implementation Strategy

- **MVP**: Phases 1 to 3. This alone protects caption parsing on both channels, which is the part
  most likely to break.
- **Then**: Phase 4 adds export and file-name coverage and the one production change.
- **Finally**: Phase 5 wires the tests into the release workflow, documents them and verifies the
  whole feature.
