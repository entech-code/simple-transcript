# Implementation Plan: Show the Meeting's Name Instead of Its Code

**Branch**: `feat/meeting-name` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/005-meeting-name/spec.md`

## Summary

Title each meeting with the name Google Meet shows for the call, and remove renaming by hand.

The name is read from the browser tab's title, which Meet sets to "Meet - " followed by the
call's name, or followed by the call's code when it has no name. The extension's service worker
already receives Chrome's notifications about tab changes; it will use the title in those
notifications, so no new code runs inside the Meet page.

With renaming gone, a title is always Meet's name for the call, or else the code. The rename
button, title editing, the list of earlier titles and the carry-over of a title to the next call
with the same code are all removed.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), target ES2022

**Primary Dependencies**: none at runtime; no dependency is added

**Storage**: `chrome.storage.local`, key `meetings`. No field is added or removed. The `title` of
a meeting is now set from Meet's name

**Testing**: Vitest (`npm test`). New unit tests for deriving a name from a tab title. The
behaviour in a call and the removed controls are checked by hand

**Target Platform**: Chrome Manifest V3 extension

**Project Type**: browser extension, single project

**Performance Goals**: the name appears within 10 seconds of joining (SC-001); in practice as soon
as Meet sets the tab title

**Constraints**: no new permission (the `tabs` permission already exposes tab titles); nothing in
Google Meet is changed (FR-007); existing meetings stay readable with their titles (FR-008)

**Scale/Scope**: 1 new source file, 1 new test file, 6 files edited. About 40 lines added for the
name and about 200 removed with renaming

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
| --- | --- | --- |
| I. Data stays on the user's machine | The name is stored with the meeting in local storage and sent nowhere. No request is added. | Pass |
| II. Minimal permissions | No permission is added. Tab titles are available through the existing `tabs` permission and the existing host permission for `meet.google.com`. | Pass |
| III. Never break the call | No code is added to the Meet page. The service worker only reads the tab's title. An unrecognised title yields no name, never an error. | Pass |
| IV. Simplicity and zero runtime dependencies | One small pure function and a few lines in the service worker; a feature and its supporting code are removed. No dependency. | Pass |
| V. Verified before merge | The new logic is pure and gets unit tests. Typecheck, tests and build must pass. A named call, an instant call and the absence of rename controls are checked by hand. | Pass |
| Technical constraints: storage | No stored shape changes. | Pass |
| Development workflow | One logical change on `feat/meeting-name` (where titles come from); `manifest.json` version not edited. | Pass |

**Post-design re-check**: unchanged. No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/005-meeting-name/
├── plan.md              # This file
├── research.md          # Decisions and alternatives
├── data-model.md        # The title rule and the name-from-title table
├── quickstart.md        # How to verify the feature
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

No `contracts/` folder: the feature adds no interface to users or other systems.

### Source Code (repository root)

```text
NEW
src/utils/meeting-title.ts        # pure: the meeting name from a tab title
tests/meeting-title.test.ts       # unit tests for it

EDITED
src/background/service-worker.ts  # reads the tab title when a meeting starts and when the title changes;
                                  # RENAME_MEETING and GET_MEETING_TITLES handlers removed
src/utils/meeting-store.ts        # renameMeeting becomes setMeetingTitle (used for Meet's name);
                                  # findTitleByCode and getMeetingTitles removed
src/content/floating-popup.ts     # rename button, title editing in the list and on the live title,
                                  # title suggestions and their styles removed
src/popup/popup.ts                # rename button and title editing removed
popup.html                        # style for an editable title removed
src/utils/types.ts                # RENAME_MEETING and GET_MEETING_TITLES removed
README.md, tests/README.md, todo.md
```

**Structure Decision**: the one piece of logic that can be wrong in interesting ways, parsing the
tab title, lives in a pure module with tests. The service worker and the store only call it.

## Design Notes

- **Reading the name**: `meetingNameFromTabTitle(tabTitle, meetingCode)` returns the name, or
  nothing. It accepts a title that starts with "Meet", a separator (hyphen or dash) and some text;
  trims the text; and returns nothing when the text is empty or equals the meeting code. Anything
  else, such as a bare "Meet", returns nothing.
- **When the name is read**: in two places in the service worker. First, when a meeting is created
  or resumed for a tab, the tab's current title is fetched once. Second, the existing
  `chrome.tabs.onUpdated` listener reacts to a changed title on a tab that belongs to a call. Both
  call the same function to apply the name.
- **Applying the name**: if a name was read and differs from the meeting's title, the title is set
  to it, saved, and the existing `meeting_renamed` message is broadcast, which the open panel
  already handles. If no name was read, nothing changes, so a good name is never replaced by the
  code.
- **A new meeting's title** is the Meet code until a name is read. It no longer copies the title
  of an earlier meeting with the same code.
- **Removing renaming**: the pencil button and its handler in both popups; double-click editing of
  a title in both lists; double-click editing of the live panel's title together with its
  suggestions of earlier titles; the `rename_meeting` and `get_meeting_titles` messages; and the
  store functions behind them. The keyboard guard that stopped keystrokes reaching Meet while a
  title was being edited goes too, since nothing in the panel is editable any more.
- **Long titles**: wherever a meeting's block is shown, the title wraps to at most two lines and
  is then cut off with an ellipsis; its full text is set as the element's tooltip.
- **Action buttons**: the buttons move out of the title's row and onto the line with the date and
  duration, at its right end. In the list they appear on hover and focus, as today; they no
  longer take width from the title.
- **The opened meeting**: each popup has one function that builds a meeting's block (title, date
  line with buttons, code and participants). The list uses it for every entry; the detail view
  uses it once at the top, with a flag that keeps the buttons visible and makes the block not
  clickable. The block sits above the scrolling transcript, so it stays in view. To build it the
  detail view needs the whole meeting, not just its id and title, so opening a meeting passes the
  meeting's summary along.
- **Headers in the detail view**: in both popups the title bar shows "Simple Transcript" and no
  meeting title. A "← Meetings" back row sits at the top of the view, above the meeting's block.
  The floating panel already has that row; the toolbar popup gains it, replacing the back arrow
  in its header. The toolbar popup's separate copy and download buttons are removed, since the
  block has them, and in the floating panel the Copy and Export toolbar is hidden in the detail
  view for the same reason; it stays in the live view.
- **Delete from the detail view**: the same confirmation as in the list; on success the view
  returns to the list.
- **The live view**: the floating panel shows the same block for the call in progress, below the
  "← Meetings" row and above the live transcript. A second flag on the block builder selects the
  live form: copy and export only, and the start date and time without a duration. The block is
  rebuilt when the meeting starts, when its name is applied (`meeting_renamed`) and when a
  participant is added. With no call in progress the block is not rendered. The panel's title bar
  becomes a fixed "Simple Transcript"; the code that wrote "Live", "Meetings" or a meeting's
  title into it is removed, as is the separate Copy and Export toolbar, which is now empty in
  every view. The footer keeps the line count, participant count and running time.
- **Service worker restarts**: Chrome may stop the service worker mid-call. The title-change
  listener waits for the saved session state to be restored before looking up the tab's meeting,
  as the other listeners do.

## Risks

- **The tab title's form in other languages or at other moments.** Only the English in-call form
  was observed. Mitigation: unrecognised forms yield no name, so the worst case is today's
  behaviour (the code as title). The unit tests pin the recognised forms.
- **Google changes the tab title's wording.** Mitigation: the same fallback; the parsing sits in
  one tested function that is easy to adjust. With renaming removed there is no manual fix for a
  user, so this fallback matters more than before.
- **A wrong name sticks.** If Meet briefly showed another call's name in the title, the meeting
  would take it until the next title change. Mitigation: the name is applied only to the meeting
  currently tied to that tab, and later title changes correct it.
- **Removing an existing control.** A user who relied on renaming loses it. The maintainer judged
  this acceptable; the extension has not had a public release under its own name.

## Out of Scope

- Renaming meetings saved before this feature, or changing their stored titles.
- Reading the name from Meet's network data.
- The new file-name format and the plain-text default, which are the next two features.

## Complexity Tracking

No constitution violations to justify.
