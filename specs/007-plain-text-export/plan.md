# Implementation Plan: Save Transcripts as Plain Text

**Branch**: `feat/plain-text-export` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/007-plain-text-export/spec.md`

## Summary

Copy to clipboard and Download produce plain text instead of Markdown, and downloads end in
`.txt`. The text starts with the meeting's name, its date and start time, and its attendees, then
one block per caption piece ("Dana Whitfield (2:05 PM)" and the text below), as the panel shows
them. The existing plain-text formatter, which no button uses today, is rewritten to this layout,
and every copy and download switches to it.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), target ES2022

**Primary Dependencies**: none at runtime; no dependency is added

**Storage**: unchanged. The text is built from what is stored: entries, title, start time and
participants

**Testing**: Vitest, with `TZ=UTC` (already set in `vitest.config.ts`) and Node's default `en-US`
locale, which the existing export tests already rely on

**Target Platform**: Chrome Manifest V3 extension

**Project Type**: browser extension, single project

**Constraints**: no new permission; Markdown is not offered (a format chooser is a later todo
item); the panel is unchanged

**Scale/Scope**: 1 formatter rewritten, 1 attendee function shared by 4 callers, 4 source files switched over; about
60 lines of code and 12 test cases

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
| --- | --- | --- |
| I. Data stays on the user's machine | Text is built locally and goes to the clipboard or a local file, as today. | Pass |
| II. Minimal permissions | No permission is added. | Pass |
| III. Never break the call | Nothing on the Meet page changes; formatting runs when the user copies or downloads. | Pass |
| IV. Simplicity and zero runtime dependencies | The unused plain-text formatter is rewritten rather than a new one added; one attendee function replaces three copies of the same lines. No dependency. | Pass |
| V. Verified before merge | The layout is a pure function with unit tests; typecheck, tests and build must pass; copy and download are checked by hand. | Pass |
| Technical constraints: storage | No stored shape changes. | Pass |
| Development workflow | One logical change (the export format) on `feat/plain-text-export`. | Pass |

**Post-design re-check**: unchanged. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/007-plain-text-export/
├── plan.md, spec.md, research.md
├── data-model.md        # The text layout, with an example
├── quickstart.md        # How to verify the feature
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/utils/transcript-store.ts     # exportAsText rewritten to the new layout
src/utils/meeting-attendees.ts    # meetingAttendees(meeting): the attendee list, the user included
src/utils/meeting-title.ts        # meetingFileTitle uses meetingAttendees; the Meet-code pattern exported
src/utils/export-filename.ts      # ".md" becomes ".txt"
src/background/service-worker.ts  # copies and downloads use 'txt'; the live call's heading comes from its meeting
src/content/floating-popup.ts     # 'txt' everywhere; the opened meeting formatted locally with exportAsText; text/plain; hints
src/popup/popup.ts                # 'txt'; text/plain; hints
tests/transcript-export.test.ts, tests/meeting-attendees.test.ts, tests/export-filename.test.ts
```

## Design Notes

- **Formatter**: `exportAsText(entries, heading)`, where `heading` is
  `{ title, startTime, attendees }`. It writes the name line, the date line, the attendees line
  (left out when `attendees` is empty), a blank line, then one block per entry: `Name (time)`, the
  text, a blank line. Pure, so it is tested directly. Layout in [data-model.md](data-model.md).
- **Attendees**: `meetingAttendees(meeting)`, in its own module, returns the list the attendee
  tags already show: the meeting's participant names, once each, in the order they joined, the
  user included, without devices whose name was never learned (`@…`) and without code-shaped
  text. The same few lines are repeated today in both popups' tags and the panel's count; they
  all switch to it, and so do the "Attendees:" line and `meetingFileTitle` (which removes the
  user). The tags, the transcript and the file name then always agree. It takes the meeting
  object every caller already has, like `meetingFileTitle`.
- **Where the heading comes from**:
  - A saved meeting (`EXPORT_MEETING`): the service worker has the meeting: its display title,
    start time and participants.
  - The live call (`EXPORT_TRANSCRIPT`): the service worker looks up the session's meeting the
    same way, so the panel no longer needs to send a title. Without a meeting (no call yet), the
    heading is "Untitled meeting" and the current time.
  - The opened meeting in the floating panel: formatted in the panel from its cached entries and
    meeting, as today, with `exportAsText` instead of `exportAsMarkdown`.
- **Switching over**: every `format: 'md'` request becomes `'txt'`; downloads use
  `text/plain;charset=utf-8`; the file name ends in `.txt`; "Copy as Markdown" becomes "Copy".
- **Markdown**: `exportAsMarkdown` and the `'md'` case stay in place, unused, alongside the other
  unused formats (SRT, VTT, JSON), for the later format chooser.

## Risks

- **Locale-dependent output**: dates and times follow the user's locale, so tests pin `TZ` and
  rely on Node's `en-US`. A machine with another default locale could fail the tests; the existing
  Markdown tests have the same dependency.

## Complexity Tracking

No constitution violations to justify.
