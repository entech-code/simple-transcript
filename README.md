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
- **31 languages** - English, Spanish, Portuguese, French, German, Russian, Japanese, Chinese, and more
- **Export formats** - Markdown, plain text, JSON, SRT, and VTT
- **Copy to clipboard** - one-click copy as Markdown

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
3. Use the sidebar popup to browse past meetings, rename them, or export

### Export

Click the export button on any meeting to download as Markdown. Files are named `Title YYYYMMDDHHmm.md`.

### Language

Use the language selector in the floating popup to switch transcription language. The setting persists across sessions.

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save meetings, transcripts, and settings locally |
| `activeTab` | Detect when you're on Google Meet |
| `tabs` | Track tab changes for popup routing |
| `alarms` | End a meeting a short while after its tab has closed |
| `host_permissions: meet.google.com` | Only runs on Google Meet |

All data stays in your browser. Nothing is sent to an external server: transcription is Google Meet's own caption system, no audio is recorded and no bot joins the call.

The extension contacts no server other than Google Meet itself. From inside the Meet page it can ask Meet to change the caption language and to resend the participant list, using your existing Meet session. Nothing is sent anywhere else.

## Testing

```bash
npm test
```

Runs the unit tests for message decoding, caption parsing and transcript export. They need Node 24 and no browser. See [tests/README.md](tests/README.md) for what is covered and how to add a sample message.
