# Quickstart: Verifying the Meeting Name

How to confirm the feature works once it is implemented. The title rules are in
[data-model.md](data-model.md).

## Prerequisites

- Node 24, dependencies installed with `npm ci`
- Chrome with the unpacked extension loaded from the project root
- A calendar event with a known name and a Google Meet link, for steps 2, 5 and 7

## 1. Build and automated checks

```bash
npm run typecheck
npm test
npm run build
```

**Expected**: all three succeed. The suite has the 98 earlier tests plus the new ones in
`tests/meeting-title.test.ts`, all passing.

## 2. A named call

Join the call from the calendar event and open the floating panel.

**Expected**: within a few seconds the block at the top of the live view shows the event's name, not the code. In the
meetings list the call is listed under that name, with the code shown as a small tag beside the
participants.

## 2a. A long name

Join a call whose name is longer than about 40 characters, or longer than 80 if one is available.

**Expected**: in the meetings list of both popups the name wraps onto a second line; a name too
long for two lines ends with an ellipsis. Hovering over the title shows the whole name. Hovering
over the row shows the Copy, Export and Delete buttons at the right end of the date line, without
the title moving.

## 3. An instant call

Start a call from Google Meet's "New meeting" and open the floating panel.

**Expected**: the title is the Meet code, as before.

## 4. No renaming

In the floating panel and in the toolbar popup:

**Expected**: a meeting's actions are Copy, Export and Delete, with no pencil button.
Double-clicking a meeting's title opens the meeting and does not make the title editable.
Double-clicking the title in the live view's block does nothing.

```bash
git grep -n -i -E "RENAME_MEETING|GET_MEETING_TITLES|renameMeeting|getMeetingTitles|findTitleByCode|contentEditable|contenteditable" -- src popup.html
```

**Expected**: no output.

## 4a. An opened meeting

Click a saved meeting in the floating panel's list, then in the toolbar popup's list.

**Expected**: the title bar reads "Simple Transcript". A "← Meetings" back row is at the top and
returns to the list. Below it is the same block as the list entry: the title on up to two
lines, the date and duration, the code and the participants. Copy, Export and Delete are on the
date line and visible without hovering. The block stays in place while the transcript scrolls.
Delete asks for confirmation and, when confirmed, returns to the list without that meeting.

## 4b. The live view

Join a call and open the floating panel.

**Expected**: the title bar reads "Simple Transcript". Below the "← Meetings" row is the block for
the call in progress: its name or code, the date and time it started with no duration, the code
and the participants, with Copy and Export visible and no Delete. When another person joins,
their name is added to the block. When the call's name appears a moment after joining, the block
updates. There is no separate Copy and Export toolbar. Before joining, no empty block is shown.

## 5. A recurring call

Join the named call, leave, and join again later so that a second meeting is created.

**Expected**: both meetings are listed under Meet's name.

## 6. Existing meetings

Open the meetings list.

**Expected**: meetings recorded before this change keep the titles they had: codes stay codes, and
hand-typed titles stay.

## 7. Export

Copy and export the named meeting.

**Expected**: the heading of the transcript is the meeting's name, and the downloaded file's name
starts with it.

## 8. Nothing else changed

**Expected**: captions are captured with speaker names as before, and the service worker console
shows no errors. No new permission prompt appeared after the update.
