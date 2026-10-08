# Simple Transcript – Copy & Save for Google Meet

Chrome extension for live Google Meet transcription with meeting history.

![Chrome](https://img.shields.io/badge/Chrome-Extension-blue)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)

## Features

- **Live transcription** - real-time captions captured directly from Google Meet
- **Speaker identification** - automatic attribution via RTC device tracking and DOM correlation
- **Smart merging** - consecutive messages from the same speaker within 30 seconds are combined into a single entry
- **Meeting history** - all meetings are saved locally with participants, timestamps, and full transcripts
- **Floating popup** - draggable, resizable overlay on the Meet page with auto-scroll
- **Any caption language** - the transcript follows the caption language set in Google Meet
- **Download** - save a transcript as a plain text file
- **Copy to clipboard** - one-click copy of the transcript as plain text

## Install

### From Release

1. Download the latest `.zip` from [Releases](../../releases)
2. Unzip to a folder
3. Open `chrome://extensions/`
4. Enable **Developer mode** (top right)
5. Click **Load unpacked** and select the unzipped folder

### From Source

```bash
npm install
npm run build
```

Then load the project root as an unpacked extension (same steps 3-5 above).

## Usage

1. Join a Google Meet call - captions are enabled and captured automatically
2. Click the Simple Transcript icon in the toolbar to toggle the floating transcript popup
3. Use the sidebar popup to browse past meetings, copy or export them, or delete them

A meeting created from a calendar event is titled with its name, as Google Meet shows it in the browser tab. A meeting without a name is called "Untitled meeting".

### Export

Click the export button on any meeting to download it as plain text; the copy button copies the same text. It starts with the meeting's name, start date and time, and attendees, then each caption under its speaker's name and time. Files are named `<title> - <YYYY>-<MM>-<DD> <HH>-<mm> - Transcript.txt`, for example `Team Daily Meeting - 2026-10-06 12-07 - Transcript.txt`. A meeting without a title is named after the other attendees, such as `Meeting with Marcus Oyelaran`, or `Untitled meeting` when there are none.

### Language

The transcript is in whatever language Google Meet's captions are set to. To change it, use Meet's own caption settings; the extension never changes it.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save meetings, transcripts, and settings locally |
| `alarms` | End a meeting a short while after its tab has closed |
| `host_permissions: meet.google.com` | Runs only on Google Meet, and tells a Meet tab from any other |

All data stays in your browser. Nothing is sent to an external server: transcription is Google Meet's own caption system, no audio is recorded and no bot joins the call.

The extension contacts no server other than Google Meet itself. From inside the Meet page it can ask Meet to resend the participant list, using your existing Meet session. Nothing is sent anywhere else.

## Testing

```bash
npm test
```

Runs the unit tests for message decoding, caption parsing and transcript export. They need Node 24 and no browser. See [tests/README.md](tests/README.md) for what is covered and how to add a sample message.

## Icons

The icon is drawn in `icons/icon.svg` (128 and 48px), `icons/icon-32.svg` and `icons/icon-16.svg`. After changing one, remake the PNGs the extension uses:

```bash
npm run icons
```

It renders each SVG at its exact size with the Chrome installed on your machine (set `CHROME_PATH` if Chrome is somewhere unusual) and writes `icons/icon16.png`, `icon32.png`, `icon48.png` and `icon128.png`.

## License

Simple Transcript is licensed under the [Functional Source License, Version 1.1, MIT Future License](LICENSE.md) (FSL-1.1-MIT).

In short: you may use, change and share it for any purpose, including at work, except to offer a commercial product or service that competes with it. Each version becomes available under the MIT license two years after its release. The license file is the authoritative text.

The Simple Transcript name and icon are not covered by the license.
