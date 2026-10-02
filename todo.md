# Todo Items

## Planned

- [ ] Automated unit tests for the logic that does not need a browser
  - Cover protobuf decoding, caption parsing (`captions` and `captions_v2`), export formats and file naming, using captured Meet payloads as fixtures
  - Run with Vitest locally and in the release workflow before a build is published

- [ ] Fix `captions_v2` parsing dropping captions
  - `parseCaptionMessageV2` returns nothing when the message number or revision reaches 128, or the caption data reaches 128 bytes (about 75 characters of text), so long sentences and captions later in a call are lost
  - Read the message with the raw decoder from the top instead of relying on the decoder's text-or-nested guess; add tests for each case and verify in a live call

- [ ] Make npm the unambiguous package manager
  - Commit `package-lock.json`, add a `packageManager` field to `package.json` and delete the stale `pnpm-lock.yaml`
  - Switch the release workflow from `npm install` to `npm ci`

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

- [x] If user opens up the same meeting at the same day, then proceed transcription in that meeting
  - `meeting-store.ts`: `findSameDayMeeting()` + `resumeMeeting()`
  - `transcript-store.ts`: `restoreEntries()` to reload live buffer with dedup maps
  - `service-worker.ts`: `ensureMeeting()` checks for same-day ended meetings before creating new ones

- [x] Renamed meeting is not saved
  - `floating-popup.ts`: Set `m.title = newTitle` in blur handler so subsequent operations use updated title

- [x] Display participants name in the meetings list
  - `floating-popup.ts`: Replaced description line with `.participant-tag` chips, removed participant count from meta

- [x] Move action buttons somewhere in the meeting card
  - `floating-popup.ts`: Moved `.meeting-item-actions` inside `.meeting-item-header`, right-aligned with `margin-left: auto`

- [x] If I open Live meeting transcription should also have back button like archived one
  - `floating-popup.ts`: Added `.back-nav` element with compact "Meetings" button, shown only in live view

- [x] It should open transcription when I click meeting card, not only meeting title
  - `floating-popup.ts`: Changed `contentEditable` check to use `getAttribute('contenteditable')` for reliable detection

- [x] If recording then icon in the list of extensions should indicate it otherwise it should be grayed with tooltip
  - `service-worker.ts`: `updateExtensionIcon(isRecording)` using OffscreenCanvas, called on start/stop/startup

- [x] I can click on extension and see all my meetings with a popup
  - `popup.html` + `src/popup/popup.ts`: standalone dark-themed meetings list
  - `service-worker.ts`: dynamic popup routing via `tabs.onActivated`/`onUpdated`
  - `rollup.config.mjs`: added IIFE build entry for `popup.ts`
