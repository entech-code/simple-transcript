# Implementation Plan: Name Untitled Meetings and Downloaded Transcripts

**Branch**: `feat/meeting-naming` | **Date**: 2026-10-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/006-meeting-naming/spec.md`

## Summary

Two naming changes. First, a meeting without a title from Google Meet is shown as "Untitled
meeting" instead of its Meet code, and its downloaded file is named after its other attendees
("Meeting with Alexey Kornakov"), or "Untitled meeting" when there is no one else. Second, downloaded transcripts are named in Google Meet's order:
"<name> - <YYYY>-<MM>-<DD> <HH>-<mm> - Transcript.md", keeping titles in any script.

The name is worked out when a meeting is shown or exported, from what is already stored, plus the
user's own name, which is now taken from Meet's own data when the browser joins the call and
stored with the meeting.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), target ES2022

**Primary Dependencies**: none at runtime; no dependency is added

**Storage**: `chrome.storage.local`, key `meetings`. Each meeting gains an optional `selfName`:
the user's own name in that call. A meeting without a title from Google Meet is stored with an
empty title instead of its Meet code. Meetings saved before this feature are left as they are

**Testing**: Vitest. Unit tests for the display name and the file name, both pure. The rest is
checked by hand in calls

**Target Platform**: Chrome Manifest V3 extension

**Project Type**: browser extension, single project

**Constraints**: no new permission; nothing in Google Meet is changed; the Meet code stays stored
(FR-004); old meetings are not migrated (FR-003)

**Scale/Scope**: 2 utility modules extended, 2 test files, 5 source files edited; about 80 lines
of code and 30 test cases

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
| --- | --- | --- |
| I. Data stays on the user's machine | The user's own name is stored with the meeting in local storage, like the attendee names already are. Nothing is sent anywhere. | Pass |
| II. Minimal permissions | No permission is added. | Pass |
| III. Never break the call | The user's name is read with the selector the caption observer already uses. Reading it changes nothing in Meet; failing to find it changes nothing either. | Pass |
| IV. Simplicity and zero runtime dependencies | Two pure functions and a small new message. No dependency. | Pass |
| V. Verified before merge | Both naming rules are pure and get unit tests. Typecheck, tests and build must pass. Named, instant, solo and group calls are checked by hand. | Pass |
| Technical constraints: storage | A stored shape gains an optional field; meetings without it are read as before. | Pass |
| Development workflow | One logical change (how meetings and files are named) on `feat/meeting-naming`. | Pass |

**Post-design re-check**: unchanged. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-meeting-naming/
├── plan.md, spec.md, tasks.md
├── data-model.md        # The naming rules, with examples
├── quickstart.md        # How to verify the feature
└── checklists/requirements.md
```

### Source Code (repository root)

```text
src/utils/meeting-title.ts        # meetingDisplayTitle and meetingFileTitle
src/utils/meeting-store.ts        # a new meeting starts with an empty title
src/utils/export-filename.ts      # exportFileName in Google's order, any script, invalid characters replaced
src/utils/types.ts                # Meeting.selfName (optional)
src/injected/interceptor.ts       # marks the device from CreateMeetingDevice as the user's own
src/content/caption-observer.ts   # no longer takes a Meet code on the page for a name
src/background/service-worker.ts  # stores selfName on the session's meeting; exports use the display name
src/popup/popup.ts                # lists and opened meeting show the display name
src/content/floating-popup.ts     # same, plus the live view and copy/export of the live call
tests/meeting-title.test.ts, tests/export-filename.test.ts
```

## Design Notes

- **Empty title**: a new meeting starts with an empty title, not its Meet code, and the
  unknown-code patch no longer copies the code into the title. Only a title from Google Meet
  fills it. `meetingTitleFromTabTitle` still rejects the code, which Meet shows in the tab title
  of an instant call.
- **Display name** (`meetingDisplayTitle(meeting)`): the stored title, or "Untitled meeting" when
  it is empty. Used in the lists, the header blocks, the live view and the heading of copied and
  exported transcripts.
- **File name title** (`meetingFileTitle(meeting)`): the stored title; when it is empty, build the
  attendee list: the meeting's participant names in the order they were added, without
  duplicates, without unnamed devices (names starting with "@") and without the user's own name.
  Then apply the rules in data-model.md. When `selfName` is unknown and only one name is left, the
  result is "Untitled meeting", since that name may be the user's.
- **Where the file name title is used**: only when a download's file name is made, in both
  popups. The popups already hold the meeting (participants and `selfName`), so they compute it
  locally and pass it to `exportFileName`. The stored `title` is not changed by this.
- **The user's own name**: when the browser joins a call, Meet registers it with a
  `CreateMeetingDevice` request, and the response names the device: the user's own. The
  interceptor already reads that response as device info; it now marks it as the user's own. The
  service worker keeps the name on the session, since it can come before the meeting exists, and
  stores it as the meeting's `selfName` once there is one, broadcasting `meeting_renamed` so an
  open panel recomputes the name. (Meet's page no longer sets `data-self-name`, which was the
  first idea; checked in a call on 2026-10-06.)
- **A Meet code is not a name**: the page scanner picked up the meeting code from Meet's page and
  attached it to a speaking device. The scanner now rejects code-shaped text, and the file name
  skips such names in meetings saved earlier.
- **Live updates**: the panel already re-renders the live header on `participant_update`, so the
  name follows people as they join. It also takes `selfName` from `meeting_renamed`.
- **File name**: the file name title, " - ", the start date and time in local time, " - Transcript.md".
  Characters not allowed on Windows, macOS or Linux, and control characters, become spaces; runs
  of spaces collapse; the name is cut to 100 characters; a trailing dot or space is removed. An
  empty result becomes "Untitled meeting". The draft written before the spec already does this.

## Risks

- **The user's name is not found** if Meet changes the `CreateMeetingDevice` response. Mitigation:
  FR-002a, so the worst case for a lone name is "Untitled meeting", never a meeting named after
  the user.
- **A participant appears under two spellings** (from the DOM and from Meet's data). Mitigation:
  duplicates are removed by exact name; a near-duplicate would only make the count slightly high.

## Complexity Tracking

No constitution violations to justify.
