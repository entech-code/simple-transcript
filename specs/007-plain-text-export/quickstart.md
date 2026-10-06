# Quickstart: Verifying Plain-Text Export

The layout is in [data-model.md](data-model.md).

## 1. Automated checks

```bash
npm run typecheck
npm test
npm run build
```

**Expected**: all succeed; the new cases in `tests/transcript-export.test.ts` pass.

## 2. Copy from the live call

Reload the extension and the Meet tab, join a call with captions, speak, then copy from the panel
and paste into a plain email or Notepad.

**Expected**: the meeting's name, date and time, and attendees at the top; one block per piece as
in the panel; no `#`, `**` or `_` marks.

## 3. Download from the live call, an opened meeting, and the list

**Expected**: each file ends in `.txt`, opens with a double click, and has the same text as a copy
of the same meeting.

## 4. The toolbar popup

Copy and download a meeting from the toolbar popup.

**Expected**: same as from the panel. The buttons' hints say "Copy", "Export" and "Delete".

## 5. An untitled meeting

**Expected**: the first line is "Untitled meeting"; the attendees line shows who was there; the
file is named after the other attendees, as before.
