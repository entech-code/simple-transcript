# Quickstart: Verifying the Unit Tests Feature

How to confirm the feature works once it is implemented. Sample definitions are in
[data-model.md](data-model.md); decisions are in [research.md](research.md).

## Prerequisites

- Node 22.12 or later
- Dependencies installed: `npm install`

## 1. The suite runs with one command

```bash
npm test
```

**Expected**: every test passes, and the run finishes in under 30 seconds (SC-001). No browser
opens and no network access is needed.

## 2. Type checking and build still pass

```bash
npm run typecheck
npm run build
```

**Expected**: both succeed. `dist/` contains the same six bundles as before and nothing from
`tests/`.

## 3. Both caption channels are protected (SC-002)

1. In `src/utils/rtc-message-parser.ts`, temporarily change the field number that
   `parseCaptionMessage` reads the text from. Run `npm test`.
   **Expected**: at least one `captions` test fails, showing expected versus actual text.
2. Undo that change. Temporarily make `parseCaptionMessageV2` use the general decoder for the
   nested content instead of the raw one. Run `npm test`.
   **Expected**: the v2 regression test fails.
3. Undo the change and confirm the suite passes again.

## 4. Every export format is protected (SC-003)

For one format at a time in `src/utils/transcript-store.ts`, temporarily change its output (for
example, the separator in the SRT time line). Run `npm test`.

**Expected**: the test for that format fails and the others pass. Undo each change.

## 5. Results do not depend on the machine

Run the suite with a different time zone:

```bash
TZ=Asia/Tokyo npm test
```

**Expected**: the same tests pass with the same output.

## 6. No private content in samples (SC-004)

Read `tests/helpers/samples.ts`.

**Expected**: every name, sentence and identifier is invented.

## 7. The export file name is unchanged

Load the built extension in Chrome, join a Meet call, capture a few captions and export the
meeting from both the floating popup and the toolbar popup.

**Expected**: the downloaded file is named exactly as before the change, in the form
`<title> <YYYYMMDDHHmm>.md`.

## 8. The release gate

In `.github/workflows/release.yml`, confirm a test step runs after Typecheck and before Build.
The workflow is currently disabled on this fork, so this is checked by reading the file until
workflows are enabled.
