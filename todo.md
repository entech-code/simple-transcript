# Todo Items

## Planned

### Now

- [ ] Bug: rejoining a call after more than 10 minutes starts a new meeting
  - Seen 2026-10-13: the Meet tab was reloaded during a call and the call rejoined; the transcript went on in a new meeting, so the call is split in two in the meetings list
  - `findRecentMeeting` in `meeting-store.ts` measures a meeting still in progress from its start: after 10 minutes it no longer counts as recent. A reloaded tab's meeting is still in progress, since it ends only 2 minutes after the tab disconnects
  - Fix: measure a meeting in progress from its last transcript line (or its start, without lines), an ended one from its end as now; add tests for both, and for a meeting left in progress by mistake
  - Not simply "in progress always counts as recent": a recurring meeting keeps its Meet code from week to week, so a meeting left in progress by mistake would take in next week's call
  - With the same call open in two tabs, both write to one meeting, as they already do in the first 10 minutes

- [ ] Always leave the user's own name out of an untitled meeting's file name
  - Seen 2026-10-07: a two-person call was saved as "Meeting with <colleague> and <the user>"; the meeting had no `selfName`, so the user was not recognised
  - The name comes from Meet's `CreateMeetingDevice` response on joining, which was missed or not parsed on that join; the page console had already dropped the lines that would say which
  - Try Meet's `GetUser` request first: the page makes it on the home page and on every call page before joining, so it should name the user without depending on the join
  - Remember the name once it is found and use it in later meetings when a participant has it; keep it with the session across service-worker restarts; log the join response once in the service worker console
  - Seen 2026-10-13: in a call the user started, `CreateMeetingDevice` came and named them; in a call they joined, it never came, and Meet already listed two devices of theirs before they joined
  - Seen 2026-10-14 in a joined call: again no `CreateMeetingDevice`, so no `selfName`; `GetUser` was captured before joining, and the premeeting devices already included the user's own

- [ ] Follow up on the store listing
  - In the store: 2.49.0; 2.51.0 and the updated description submitted 2026-10-13, in review
  - Next upload: the release with the captions fixes of 2026-10-13
  - Updates are uploaded by hand: download the release zip and upload it in the dashboard (decided 2026-10-13). `.github/CWS_SETUP.md` has the setup for automating it later

### Next

- [ ] Be ready for the first bug reports
  - Add a GitHub issue template that asks for the version, what happened and how the call was joined, and says not to paste transcripts or logs there but to email them
  - On the support page, give the log steps their own link (`support.html#log`) and add how to get the service worker's log from `chrome://extensions`

- [ ] Fix doubled words at the end of some transcript entries
  - Seen in a real export: "worst. worst.", "really. really.", "police police", "learns learns"
  - Likely from merging caption revisions in `transcript-store.ts`; reproduce before fixing

- [ ] Capture real `captions_v2`, participant and chat messages for tests
  - Messages built from the structures documented in the code are not read by these parsers, so their content is untested
  - Record a few raw messages in a live call, rebuild their shape in `tests/helpers/samples.ts` with invented content, and add content tests
  - Done for the participant list (`tests/device-parser.test.ts` uses the shape seen in a call on 2026-10-08); captions and chat are still to do
  - `captions_v2` messages built to the documented structure are now read (see Completed, 2026-10-13); a real message's shape would still confirm that structure

### After some real use

- [ ] A "Something's wrong?" report for when captions are not coming through
  - An action in the popup builds a diagnostic report (versions, channel names, message counts, errors) and opens a pre-filled GitHub issue, with a copy button as fallback
  - The report must not contain transcript text, participant names or meeting codes, and nothing is sent automatically

- [ ] Search across saved meetings
  - A search box above the meetings list filters by title, attendee name and transcript text
  - A match in the transcript shows the matching line under the meeting

- [ ] Let the user choose the format for Copy to clipboard and Download
  - Options: plain text (`.txt`, the default), Markdown (`.md`) and JSON (`.json`), with the choice remembered
  - Today both buttons always produce plain text; the Markdown, JSON, SRT and VTT formatters still exist but nothing offers them. Decide whether SRT and VTT are offered or removed

- [ ] Show the extension in the same language as Google Meet
  - About 50 texts to translate: the floating panel, the toolbar popup, and the words in copied text, exports and file names ("Untitled meeting", "Meeting with … and …", "Transcript"); dates and times already follow the browser's locale
  - By default, follow Meet's interface language, which comes from the Google Account and otherwise from Chrome. Chrome's own `chrome.i18n` follows only Chrome's language, so it can differ; the Meet page's language could be read there and remembered for the toolbar popup (to check)
  - A language choice in settings, if easy: `chrome.i18n` cannot be switched while running, so a choice means loading the chosen language's texts directly
  - "and 2 others" and "Meeting with A and B" need each language's plural and word-order rules (`Intl.PluralRules`), not word-for-word translation
  - Start with 4–5 languages picked from the store's installs by country, each checked by a native speaker; translated store listings optional
  - Captions being turned on with Meet in another language is a separate item above, and comes first

- [ ] Separate meetings by Google account (to think about)
  - Meetings are stored per Chrome profile, so meetings recorded under different Google accounts in the same profile appear in one list
  - Decide whether to record the account a meeting was held under, and whether to filter, group or label meetings by it; separate Chrome profiles already keep lists apart

- [ ] Clean up the old ways of turning captions on
  - Captions are now turned on through the captions button's `jslog` and `jsname`; the English labels, the `closed_caption` icon search and ⋮ → Settings → Captions remain as fallbacks
  - After a few weeks of use, if the Verbose log only ever shows "Found captions button, clicking", remove the label search and the Settings path
  - The Settings path opens the first `more_vert` on the page, which can be the "More options" of the user's own video tile rather than Meet's ⋮ menu (seen 2026-10-13)
  - The service worker's caption retry still starts on page load, so it fires on the pre-join screen; it is harmless there, as nothing is clicked before joining

- [ ] Turn CC back on when Meet switches it off by itself
  - Only if it is seen to happen: a call on 2026-10-12 stopped transcribing partway, cause unknown. Next time, check the CC button first
  - Must leave CC off when the user turned it off

### Keep an eye on

- [ ] Watch for an extra empty meeting when a call starts from the Meet home page
  - Seen 2026-10-06: an instant call showed two "Untitled meeting" cards, the live one and an empty one that was neither live nor ended; the empty one was deleted later, as empty meetings are
  - Not seen in the instant calls of 2026-10-08. Those logs showed that starting a call from the home page loads a new page with the code already in its address, so the earlier guess (a meeting started before the code arrived) does not fit
  - If it comes back, add logs for when a meeting is created, resumed and ended

## Completed

- [x] Bug: the transcript stopped a few minutes into a call (2026-10-13)
  - Seen 2026-10-12 and 2026-10-13: Meet's captions went on, but no more lines came, at 37 lines in one call; reloading the tab brought them back, for a while
  - From a call's 128th `captions_v2` message on, or a caption's 128th revision, the message's numbers take bytes that are not valid text. `decodeProtobuf` then took the update for nested fields instead of text, and `parseCaptionMessageV2` dropped every caption from there on. Calls on the older `captions` channel were not affected, which is likely why a 43-minute call once transcribed to the end
  - `parseCaptionMessageV2` now reads every level with `decodeProtobufRaw`, without guessing. Tests read message numbers 1 to 20,000, revisions 127 to 1,000, and a short caption, which also failed before
  - Checked in calls with a podcast playing: with the old parser, segment 126 was the last read and every message failed after it, and about 1 in 8 failed before it (long corrections taken for text); with the fix, segments went on past 137 with 3 messages not read, all of them not captions
  - The Verbose log now names the channel the first caption came on, and counts captions_v2 segments, once each, and messages not read. It does not explain why a 37-minute captions_v2 call on 2026-10-09 transcribed to the end; the channel line will tell for future calls

- [x] Turn captions on within seconds of joining, and say in the panel when they are off (2026-10-13)
  - Meet did not keep CC on from one call to the next, even without the extension, so captions are turned on in every call
  - Checked every 2 seconds for the first 3 minutes on the page, every 10 seconds after, until CC is on: CC comes on 2–3 seconds after joining instead of up to 15
  - Joining is told by the captions button, the leave-call button (`call_end`) or a participant tile, which only exist in the call; the microphone and camera are on the pre-join screen too, where the Settings fallback could open Meet's menus
  - The panel hears whether CC is on from the captions button every 3 seconds, once turning it on has been tried: "Captions are off in Meet. Turn on CC to start the transcript." before any line, "Transcript paused: captions are off in Meet." above the footer during a call. Caption text in the last 10 seconds counts as CC on, whatever the button shows
  - The "Extension updated" banner never appeared: in current Chrome a reloaded or updated extension leaves its scripts' `chrome.runtime.id` empty rather than throwing, so they never noticed. It now shows above the footer, in the panel's colours, and the scripts stop
  - Checked in English and Spanish; turning captions on also in Russian and Arabic

- [x] Turn captions on when Meet is in another language (2026-10-13)
  - Meet's icons had moved to the `google-symbols` font, so every icon check had stopped matching; outside English, the captions button, found by its English label, was not found either, and captions stayed off
  - The captions button is now found by `jslog` 211197 or `jsname` "RrG0hf", the same in every language, and its icon tells on (`closed_caption`) from off (`closed_caption_off`); it is clicked only while off, and checked afterwards
  - The panel's message reads "No captions yet. If people are speaking, turn on captions (CC) in Meet", and the auto-enable warning is a Verbose console line, no longer listed on the Extensions page
  - Checked in English, Spanish, Russian and Arabic

- [x] Published on the Chrome Web Store: submitted 2026-10-08 as version 2.49.0 (non-trader), live by 2026-10-13

- [x] A participant's caption language is no longer taken for their name: Meet's language messages renamed a speaker to a mangled "en-US" and added a phantom attendee (2026-10-09)
- [x] Chrome Web Store listing: the text, the answers for the privacy practices form, three screenshots and the promo tile (2026-10-08)
- [x] Meetings with many attendees in the lists: up to four are named; from five, the first three and a "+N more" button that names the rest in place (2026-10-08)
- [x] Website: a home page, the privacy policy and a support page, published with GitHub Pages at https://entech-code.github.io/simple-transcript/ (2026-10-08)
- [x] Clean up the Copy, Export and Delete icons: drawn icons instead of text characters, slightly larger, the same in the panel and the toolbar popup, with a tick after copying (2026-10-07)
- [x] Don't offer Delete for a meeting that is in progress: its card and opened view show only Copy and Export, in the panel and the toolbar popup (2026-10-07)
- [x] New icon and colours: a white speech bubble with a periwinkle outline and coloured speaker dots, and an indigo accent in the panel and popup instead of Notula's terracotta (2026-10-06)
- [x] Save the transcript as plain text instead of Markdown: Copy and Download give plain text with the meeting's name, date and attendees at the top, and downloads end in `.txt` (2026-10-06)
- [x] Name saved transcript files `<title> - <YYYY>-<MM>-<DD> <HH>-<mm> - Transcript.md`, with "Transcript" last so the date reads as the meeting's (2026-10-06)
- [x] Call a meeting without a title "Untitled meeting", and name its files after the other attendees (2026-10-06)
- [x] Show the name of the meeting instead of the unique id like `fdo-yjcn-pqk` (2026-10-06)
  - A meeting is titled with its title from Google Meet, read from the browser tab ("Meet - <title>"); a call without one keeps its code
  - Renaming by hand removed; the Meet code is stored but no longer shown
  - Meetings lists show titles on up to two lines with Copy, Export and Delete on the date line; an opened meeting and the live view start with the same block under "← Meetings"
  - The floating panel's title bar keeps only Close

- [x] Delete the leftover MeetScribe files (2026-10-05)
  - Removed `meetscribe/`, `meetscribe.zip`, `demo.html` and `seed-demo-data.js`; none was part of the build or the release package

- [x] Remove the language dropdown and take the caption language from Meet's own CC options (2026-10-05)
  - Dropdown removed from the floating panel; the transcript follows whatever language Meet's captions are set to
  - The extension no longer sets, re-sends or remembers a caption language, and no longer writes Meet's saved preference
  - `protobuf-encoder.ts` and `language-script.ts` deleted; the request to Meet that set the language is gone

- [x] Remove the Notes functionality (2026-10-05)
  - Notes section and the "Transcription" header removed from the floating panel; notes block removed from past meetings in both popups
  - Note messages, storage functions and types deleted; Markdown and text exports no longer have a notes block
  - A meeting is empty when it has no transcript lines; notes already in storage are left there, unread

- [x] Remove Notula from the branding and replace it with "Simple Transcript" (2026-10-05)
  - Named "Simple Transcript – Copy & Save for Google Meet"; "Simple Transcript" in the toolbar tooltip, panel title and popup header
  - Notula save feature, pairing screens, promo link and the only network code removed; five modules deleted
  - README, store listing text, release names and constitution updated; the notula.org redirect pages and the screenshot tooling deleted

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
