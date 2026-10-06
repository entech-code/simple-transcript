# Quickstart: Verifying Meeting and File Names

The naming rules are in [data-model.md](data-model.md).

## 1. Automated checks

```bash
npm run typecheck
npm test
npm run build
```

**Expected**: all succeed; the new cases in `tests/meeting-title.test.ts` and
`tests/export-filename.test.ts` pass.

## 2. A named call

Join a call created from a calendar event and download its transcript.

**Expected**: the list shows the event's title, and the file is named
`<title> - <YYYY>-<MM>-<DD> <HH>-<mm> - Transcript.md`.

## 3. An instant call alone

Start an instant meeting and stay alone.

**Expected**: it is called "Untitled meeting" in the live view and the list; a download is named
`Untitled meeting - <date> <time> - Transcript.md`.

## 4. An instant call with one other person

**Expected**: it is called "Meeting with <their name>", not with your name, and the name appears
once they have joined.

## 5. An instant call with three or more others

**Expected**: "Meeting with <first>, <second> and N other(s)".

## 6. Nothing else changed

**Expected**: captions are captured with speaker names, and the service worker console shows no
errors.
