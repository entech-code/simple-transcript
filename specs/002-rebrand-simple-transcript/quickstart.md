# Quickstart: Verifying the Rebrand

How to confirm the feature works once it is implemented. Names and stored keys are listed in
[data-model.md](data-model.md).

## Prerequisites

- Node 24, dependencies installed with `npm ci`
- Chrome with the unpacked extension loaded from the project root
- For step 6: saved meetings recorded with the previous build in that same unpacked extension

## 1. Build and automated checks

```bash
npm run typecheck
npm test
npm run build
```

**Expected**: all three succeed, 98 tests pass, and `dist/` contains the same six bundles.

## 2. No Notula left in the product (SC-001)

```bash
git grep -n -i notula -- src popup.html manifest.json
git grep -n -i notula -- dist
```

**Expected**: no output from either command.

```bash
git grep -n -i notula -- . ':!specs' ':!todo.md' ':!.specify' ':!.claude'
```

**Expected**: no output. Specs, the todo list's completed items and Spec Kit's own files may still
mention the old name as history.

## 3. No network code (SC-003)

```bash
git grep -n -E "fetch\(|XMLHttpRequest|WebSocket\(|sendBeacon|127\.0\.0\.1" -- src
```

**Expected**: no output.

## 4. Names

1. Open `chrome://extensions`. **Expected**: the card reads "Simple Transcript: Copy & Save for
   Google Meet", and its description mentions no other product.
2. Hover the toolbar button outside a call. **Expected**: "Simple Transcript".
3. Join a Meet call and hover it again once captions are being captured. **Expected**: "Simple
   Transcript - Recording".
4. Open the floating panel. **Expected**: its title starts with "Simple Transcript".
5. On another tab, open the toolbar popup. **Expected**: its header reads "Simple Transcript".

## 5. No promotion, no connection (SC-002)

In the floating panel and in the toolbar popup, with no meetings and with several meetings:

**Expected**: no "Save to your Git repo via Notula" line, no "Waiting for Notula", no "Build AI
brain with Notula" link, no save-destination line or menu on any meeting, and no gap or empty row
where those elements used to be.

Open DevTools on the extension's service worker, switch to the Network tab, then hold a short call
and export it. **Expected**: no requests.

## 6. Existing data survives (SC-004)

1. Before loading the new build, note how many meetings the previous build lists, and open one.
2. Run `npm run build` on this branch and click the reload icon on the extension card. Do not
   remove the extension.
3. Open the meetings list.

**Expected**: the same number of meetings, each with its title, participants and transcript. If
the previous build was paired with Notula, nothing about that pairing is shown and no error
appears in the service worker console.

## 7. Everything else still works (SC-005)

1. In a Meet call, speak a few sentences. **Expected**: they appear with your name.
2. Rename the meeting, copy it and export it. **Expected**: the copied text and the exported file
   are as before, and the file is named `<title> <YYYYMMDDHHmm>.md`.
3. Join and leave a call without any captions. **Expected**: no empty meeting is left in the list.
4. End a call that has captions. **Expected**: the meeting stays in the list.

## 8. Repository material

- `README.md` opens with the new name, has no Notula section, no link to the Notula store listing,
  and its permissions table matches `manifest.json`.
- `.github/workflows/release.yml` names the release "Simple Transcript `<version>`" and the file
  `simple-transcript-<version>.zip`.
- `.specify/memory/constitution.md` is titled "Simple Transcript Constitution", states that the
  extension makes no network requests, and is at version 1.1.0.
