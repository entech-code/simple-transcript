# Todo Items

## Planned

- [ ] Capture real `captions_v2`, participant and chat messages for tests
  - Messages built from the structures documented in the code are not read by these parsers, so their content is untested
  - Record a few raw messages in a live call, rebuild their shape in `tests/helpers/samples.ts` with invented content, and add content tests
  - A suspected bug (v2 captions dropped at message number 128 or for long text) was not confirmed: a 43-minute call with 429 entries transcribed to the end. Re-check it against the real message shape

- [ ] Fix doubled words at the end of some transcript entries
  - Seen in a real export: "worst. worst.", "really. really.", "police police", "learns learns"
  - Likely from merging caption revisions in `transcript-store.ts`; reproduce before fixing

- [ ] Remove Notula from the branding and replace it with "Simple Transcript" as needed
  - Remove any ads or links to external products
  - All Notula-related features go too, including "Save to your Git repo via Notula"

- [ ] Remove the Notes functionality
  - It is not really useful and not part of the core functionality, which is the transcript
  - Existing notes are dropped, not migrated or exported: the extension is new, so there is nothing worth preserving

- [ ] Remove the language dropdown and take the caption language from Meet's own CC options
  - The transcript follows whatever language is set in Meet's caption settings, so there is one place to change it

- [ ] Show the name of the meeting instead of the unique id like `gim-mxzg-xdx`
  - In the meetings list a call is titled with its Meet code unless it was renamed by hand, which makes meetings hard to tell apart

  ![Meetings list showing Meet codes as titles](assets/todo-meeting-code-titles.png)

- [ ] Name saved transcript files like `Transcript - Entech Daily Meeting 1 - 2026-04-23 14-23.md`
  - Format is `Transcript - <meeting title> - <YYYY>-<MM>-<DD> <HH>-<mm>.md`, so files group by meeting and sort by date within it

- [ ] Error logging and reporting for when captions are not coming through
  - A "Something's wrong?" action in the popup builds a diagnostic report (versions, channel names, message counts, errors) and opens a pre-filled GitHub issue, with a copy button as fallback
  - Enable Issues on the repo and add an issue template that tells users what to include
  - The report must not contain transcript text, participant names or meeting codes, and nothing is sent automatically

- [ ] Search across saved meetings
  - A search box above the meetings list filters by title, attendee name and transcript text
  - A match in the transcript shows the matching line under the meeting

## Completed

- [x] Update Node from 22 to 24 (2026-10-02)
  - `release.yml`: `node-version: 24`; READMEs name Node 24
  - `package.json`: `packageManager` is `npm@11.19.0`, the npm that ships with Node 24

- [x] Make npm the unambiguous package manager (2026-10-02)
  - `package-lock.json` committed, `packageManager` field in `package.json`, stale `pnpm-lock.yaml` deleted
  - `release.yml`: installs with `npm ci`

- [x] Automated unit tests for the logic that does not need a browser (2026-10-02)
  - `tests/`: protobuf decoding, the `captions` parser, malformed input for every parser, the five export formats and export file naming, run with `npm test` (Vitest)
  - `src/utils/export-filename.ts`: file name shared by both popups
  - `release.yml`: runs the tests before the build
  - Content tests for `captions_v2`, participant and chat messages are deferred until real messages are captured; samples are built in code

- [x] If user opens up the same meeting at the same day, then proceed transcription in that meeting (2026-02-27)
  - `meeting-store.ts`: `findSameDayMeeting()` + `resumeMeeting()`
  - `transcript-store.ts`: `restoreEntries()` to reload live buffer with dedup maps
  - `service-worker.ts`: `ensureMeeting()` checks for same-day ended meetings before creating new ones

- [x] Renamed meeting is not saved (2026-02-27)
  - `floating-popup.ts`: Set `m.title = newTitle` in blur handler so subsequent operations use updated title

- [x] Display participants name in the meetings list (2026-02-27)
  - `floating-popup.ts`: Replaced description line with `.participant-tag` chips, removed participant count from meta

- [x] Move action buttons somewhere in the meeting card (2026-02-27)
  - `floating-popup.ts`: Moved `.meeting-item-actions` inside `.meeting-item-header`, right-aligned with `margin-left: auto`

- [x] If I open Live meeting transcription should also have back button like archived one (2026-02-27)
  - `floating-popup.ts`: Added `.back-nav` element with compact "Meetings" button, shown only in live view

- [x] It should open transcription when I click meeting card, not only meeting title (2026-02-27)
  - `floating-popup.ts`: Changed `contentEditable` check to use `getAttribute('contenteditable')` for reliable detection

- [x] If recording then icon in the list of extensions should indicate it otherwise it should be grayed with tooltip (2026-02-27)
  - `service-worker.ts`: `updateExtensionIcon(isRecording)` using OffscreenCanvas, called on start/stop/startup

- [x] I can click on extension and see all my meetings with a popup (2026-02-27)
  - `popup.html` + `src/popup/popup.ts`: standalone dark-themed meetings list
  - `service-worker.ts`: dynamic popup routing via `tabs.onActivated`/`onUpdated`
  - `rollup.config.mjs`: added IIFE build entry for `popup.ts`
