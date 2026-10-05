# Quickstart: Verifying the Removal of Notes

How to confirm the feature works once it is implemented. Stored data and messages are described in
[data-model.md](data-model.md).

## Prerequisites

- Node 24, dependencies installed with `npm ci`
- Chrome with the unpacked extension loaded from the project root

## 1. Build and automated checks

```bash
npm run typecheck
npm test
npm run build
```

**Expected**: all three succeed and the same 98 tests pass, with no test changed.

## 2. No note code left

```bash
git grep -n -i -E "NoteEntry|addNote|updateNote|deleteNote|getNotes|ADD_NOTE|UPDATE_NOTE|DELETE_NOTE|note_added|note_updated|note_deleted|formatNotesBlock|notes-input|section-notes|detail-notes" -- src popup.html
```

**Expected**: no output.

## 3. The live view

Join a Meet call and open the floating panel.

**Expected**: no Notes section, no note input, and no "Transcription" header; the transcript fills
the panel and scrolls as captions arrive. The footer reads "N lines" with no mention of notes.
Resize the panel small and large: the transcript area follows, with no empty band.

## 4. Past meetings

Open a past meeting in the floating panel and in the toolbar popup.

**Expected**: only the transcript is shown, and the footer counts lines only.

## 5. Saved meetings after the update

Reload the extension (do not remove it) and open the meetings recorded with the previous build.

**Expected**: every meeting is listed and opens with its full transcript, and the service worker
console shows no errors. The maintainer does not use notes and the extension has no other users
yet, so a meeting with stored notes is not tested by hand.

## 6. Exports are otherwise unchanged

Export a meeting that never had notes and compare it with an export of the same meeting made with
the previous build.

**Expected**: the two files are identical.

## 7. Empty meetings

1. Join and leave a call without any captions. **Expected**: no meeting is left in the list.
2. End a call that has captions. **Expected**: the meeting stays in the list.
