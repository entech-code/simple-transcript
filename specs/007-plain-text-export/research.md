# Research: Save Transcripts as Plain Text

## Rewrite the existing plain-text formatter

- **Decision**: rewrite `exportAsText` to the new layout.
- **Rationale**: it exists for the `'txt'` format, which no button uses today. A second plain-text
  formatter would leave an unused one behind.
- **Alternatives considered**: a new `exportAsPlainText`, keeping the old one-line-per-entry
  format (`[time] Speaker: text`) for the format chooser. Rejected: nothing uses it, and the
  chooser can offer the new layout as its plain-text option.

## Date and time formatting

- **Decision**: the date line uses `toLocaleString` with a long date and a short time; block times
  use `toLocaleTimeString` with numeric hours and two-digit minutes. Both use the browser's locale.
- **Rationale**: matches the user's clock style (FR-005) without settings. In US English this gives
  "October 6, 2026 at 12:07 PM" and "2:05 PM"; with a 24-hour clock, "14:05".
- **Alternatives considered**: a fixed format such as "2026-10-06 12:07". Rejected: the spec asks
  for the user's clock style.

## The heading of a live call

- **Decision**: the service worker builds it from the session's meeting.
- **Rationale**: the worker already holds the meeting, with its start time and participants; the
  panel's copy of them can lag behind. One source for both popups.
- **Alternatives considered**: the panel sends title, start time and attendees with the request.
  Rejected: more to pass, and a second place deciding the heading.

## Line endings and encoding

- **Decision**: `\n` line endings; the download is a `text/plain;charset=utf-8` blob.
- **Rationale**: Notepad on Windows has shown `\n` correctly since 2018, as do macOS and Linux
  editors. UTF-8 keeps names and text in any script.
- **Alternatives considered**: `\r\n` on Windows. Rejected: unnecessary, and the copy and the
  download would differ by platform.
