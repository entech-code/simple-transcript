# Implementation Plan: Automated Unit Tests for Browser-Free Logic

**Branch**: `feat/unit-tests` | **Date**: 2026-10-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-unit-tests/spec.md`

## Summary

Add a unit test suite that runs in Node with one command (`npm test`) and covers the logic that
does not need a browser: binary message decoding, caption parsing for the `captions` and
`captions_v2` channels, participant and chat message parsing, the five transcript export formats
and export file naming. Sample messages are built in test code with invented content, following
the message structures documented in the source. The test runner is Vitest, added as a
development dependency. The release workflow gains a test step next to typecheck.

One small production change is needed: the export file name is currently built inside two copies
of a browser-only `download()` function, so that logic moves into one shared pure function that
both call. Behaviour is unchanged.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), target ES2022

**Primary Dependencies**: none at runtime. Development: Rollup 4, TypeScript; this feature adds
Vitest 5 (development only)

**Storage**: N/A (tests use no storage; no stored data shape changes)

**Testing**: Vitest 5, run in Node through `npm test`

**Target Platform**: tests run on Node 22 (local and CI); the product remains a Chrome Manifest V3
extension

**Project Type**: browser extension, single project

**Performance Goals**: the full suite completes in under 30 seconds (SC-001); expected a few
seconds

**Constraints**: no browser, no network, no Google account (FR-002); no real names, speech or
meeting identifiers in the repository (FR-006); the published package is unchanged (FR-009)

**Scale/Scope**: 5 test files covering 4 source modules, 1 new shared source function, about 50
test cases

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
| --- | --- | --- |
| I. Data stays on the user's machine | No network use. Sample messages contain only invented content (FR-006). | Pass |
| II. Minimal permissions | `manifest.json` is not touched. | Pass |
| III. Never break the call | The tests assert that every parser returns "no result" on malformed input and never throws, which makes this principle checkable. | Pass |
| IV. Simplicity and zero runtime dependencies | Vitest is a development dependency and is not bundled. Justification for adding it is in [research.md](research.md). No new abstractions beyond one extracted function. | Pass |
| V. Verified before merge | `npm run typecheck` and `npm run build` must pass. The file-name extraction touches export, so one export download is verified by hand in a live call. The suite itself is the automated testing this principle anticipates. | Pass |
| Development workflow | One logical change on `feat/unit-tests`. No formatting-only edits to existing files. `manifest.json` version is not edited. | Pass |

**Post-design re-check**: unchanged. The design adds no runtime dependency, no permission and no
stored-data change. No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/001-unit-tests/
├── plan.md              # This file
├── research.md          # Decisions and alternatives
├── data-model.md        # Sample message and sample transcript definitions
├── quickstart.md        # How to verify the feature
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Created later by /speckit-tasks
```

No `contracts/` folder: the feature exposes no interface to users or other systems.

### Source Code (repository root)

```text
src/
└── utils/
    ├── export-filename.ts        # NEW: pure function for the export file name
    ├── protobuf-decoder.ts       # tested, unchanged
    ├── rtc-message-parser.ts     # tested, unchanged
    └── transcript-store.ts       # export formatters tested, unchanged
src/content/floating-popup.ts     # CHANGED: download() calls the shared function
src/popup/popup.ts                # CHANGED: download() calls the shared function

tests/
├── helpers/
│   ├── proto-builder.ts          # test-only builder for binary sample messages
│   └── samples.ts                # sample messages and the sample transcript
├── protobuf-decoder.test.ts
├── caption-parser.test.ts        # captions and captions_v2, incl. the v2 regression
├── rtc-messages.test.ts          # participant and chat messages
├── transcript-export.test.ts     # Markdown, text, JSON, SRT, VTT
├── export-filename.test.ts
└── README.md                     # how to run tests and add a sample

vitest.config.ts                  # NEW: test settings (UTC time zone, tests/ folder)
tsconfig.test.json                # NEW: type-checks tests/ without changing the build
package.json                      # CHANGED: "test" script, vitest devDependency
.github/workflows/release.yml     # CHANGED: test step, Node 22
README.md                         # CHANGED: short "Testing" section
```

**Structure Decision**: tests live in a top-level `tests/` folder, outside `src/`. Rollup bundles
only the six entry points under `src/`, and the release package zips only `manifest.json`,
`popup.html`, `dist/` and `icons/`, so nothing under `tests/` can reach the published package.

## Design Notes

- **Sample messages** are produced by a small test-only builder (`tests/helpers/proto-builder.ts`)
  that writes varint, text and nested fields. It is written independently of the production
  encoder so the tests do not check the code against itself.
- **The `captions_v2` regression** (SC-002) is a test that builds a v2 message whose nested content
  is almost entirely printable text, confirms the general decoder flattens it, and confirms the v2
  parser still returns the correct text and identifiers.
- **Time and locale**: the export formatters use the machine's time zone and locale. The tests fix
  the time zone to UTC and force the `en-US` locale inside the test run, so results are identical
  on every machine. Production code is not changed.
- **Debug logging**: the parsers log at debug level; tests silence `console.debug`.
- **Type checking of tests**: `npm run typecheck` is extended to also check `tests/` through
  `tsconfig.test.json`, so the existing gate covers the new code.
- **Release workflow**: a `npm test` step is added after Typecheck. Vitest 5 requires Node 22, so
  the workflow's Node version moves from 20 to 22. The workflow is currently disabled on this
  fork; until it is enabled the tests are run by hand.

## Out of Scope

- Notes and Notula code, including `meeting-document.ts` (scheduled for removal).
- The caption merge and de-duplication logic in `transcript-store.ts` (stateful; a candidate for a
  later feature).
- `language-script.ts` and `protobuf-encoder.ts`.
- Committing a `package-lock.json` and switching CI to `npm ci`.

## Complexity Tracking

No constitution violations to justify.
