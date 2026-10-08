# Feature Specification: Save Transcripts as Plain Text

**Feature Branch**: `feat/plain-text-export`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "Save the transcript as plain text instead of Markdown. Copy to clipboard and Download produce plain text by default, and downloads are .txt; do this before the first release, since changing a default afterwards disrupts users. Layout: the meeting title and date at the top, then one block per speaker turn with the name and time on one line (Dana Whitfield (2:05 PM)) and the text below, separated by blank lines; times without seconds. Downloaded files then end in .txt."

## User Scenarios & Testing *(mandatory)*

Today, copying or downloading a transcript produces Markdown: a `#` heading, `**Date:**`, and
speaker names wrapped in `**` and `_`. Pasted into an email, a chat or a document that does not
read Markdown, those marks show up as clutter. Downloaded files end in `.md`, which many people
cannot open with a double click.

### User Story 1 - Copy a transcript as clean text (Priority: P1)

A person copies a meeting's transcript and pastes it into an email, a chat message or a
document. It reads cleanly: the meeting's name, date and attendees at the top, then each piece of speech
with their name and the time, and what they said below.

**Why this priority**: Copying is the quickest way to use a transcript, and pasting is where
Markdown marks are most visible.

**Independent Test**: Copy a transcript, paste it into a plain email, and check that no
Markdown marks appear and every block is readable.

**Acceptance Scenarios**:

1. **Given** a meeting titled "Team Daily Meeting", **When** its transcript is copied,
   **Then** the copied text starts with "Team Daily Meeting" on the first line, the
   meeting's date and start time on the second, and "Attendees: " followed by the attendees'
   names on the third.
2. **Given** Dana Whitfield spoke at 2:05 PM, **When** the transcript is copied, **Then** her
   words appear under a line "Dana Whitfield (2:05 PM)", with a blank line before the next
   block.
3. **Given** any transcript, **When** it is copied, **Then** the text contains no Markdown
   marks: no `#` headings, no `**` or `_` around names, no `**Date:**`.
4. **Given** a meeting without a title, **When** its transcript is copied, **Then** the first
   line is "Untitled meeting", and the attendees line shows who was in it.

---

### User Story 2 - Download a transcript as a text file (Priority: P1)

A person downloads a transcript. The file ends in `.txt`, opens with a double click in any text
editor, and contains the same text as a copy.

**Why this priority**: A `.txt` file opens everywhere without special software; this is the
file people keep.

**Independent Test**: Download a transcript, open it with a double click, and compare it with
a copy of the same transcript.

**Acceptance Scenarios**:

1. **Given** a meeting titled "Team Daily Meeting" that started at 12:07 on 2026-10-06,
   **When** its transcript is downloaded, **Then** the file is named
   `Team Daily Meeting - 2026-10-06 12-07 - Transcript.txt`.
2. **Given** that download, **When** the file is opened, **Then** its contents are the same as
   copying the same transcript.
3. **Given** a transcript with letters in any script, **When** the file is opened in a common
   text editor, **Then** the letters display correctly.

---

### Edge Cases

- A transcript with no lines: the heading lines are copied or downloaded, with nothing below.
- No attendee names known: the attendees line is left out.
- An attendee whose name was never learned (shown only as a device): left out of the attendees
  line.
- A speaker whose name was never learned: their blocks are headed with the name the extension
  shows for them, as in the panel.
- A meeting held past midnight: the date at the top is the date it started.
- Text containing characters that look like Markdown (`*`, `#`, `_`): kept as spoken; nothing is
  escaped or removed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Copy to clipboard MUST produce plain text in the layout below, everywhere a copy is
  offered: the live call, an opened meeting, and meetings in the list, in both the floating panel
  and the toolbar popup.
- **FR-002**: Download MUST save the same plain text as a copy of the same transcript, in a file
  ending in `.txt`, everywhere a download is offered.
- **FR-003**: The text MUST start with the meeting's name on the first line (its title, or
  "Untitled meeting"), then the meeting's date and start time on the second line, then
  "Attendees: " and the attendees' names, separated by commas, on the third line, then a blank
  line.
- **FR-003a**: The attendees line MUST list every attendee whose name is known, including the
  user, once each, in the order they joined. Attendees whose name was never learned MUST be left
  out, and the line MUST be left out when no name is known.
- **FR-004**: Each caption piece MUST be a block of its own, as in the panel: a line with the
  speaker's name followed by the time in brackets, such as "Dana Whitfield (2:05 PM)", then the
  spoken text on the following line or lines.
- **FR-005**: Times MUST be shown in hours and minutes, without seconds, in the user's local time
  and the clock style of their system (12-hour or 24-hour).
- **FR-006**: Blocks MUST be separated by one blank line.
- **FR-007**: Consecutive pieces from the same speaker MUST NOT be merged, so the text matches
  the panel block for block.
- **FR-008**: The text MUST contain no Markdown formatting added by the extension.
- **FR-009**: The downloaded file name MUST follow the existing pattern,
  `<name> - <YYYY>-<MM>-<DD> <HH>-<mm> - Transcript.txt`.
- **FR-010**: The hints on the meeting buttons MUST be single words: "Copy", "Export" and
  "Delete" ("Copy as Markdown" becomes "Copy").
- **FR-011**: Automated tests MUST cover the layout: the heading lines, the attendees line
  (duplicates, unnamed attendees, none known), a single block, consecutive pieces from one
  speaker kept apart, an untitled meeting, an empty transcript, and text
  containing Markdown-like characters.

### Key Entities

- **Caption piece**: one stretch of speech as Meet delivers it and the panel shows it; shown as
  the speaker's name and its time, then the text.
- **Plain-text transcript**: the meeting's name, its date and start time, its attendees, and its
  caption pieces, as copied or downloaded.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A copied transcript pasted into a plain email shows no formatting marks.
- **SC-002**: Every downloaded transcript opens with a double click in the system's default text
  editor on Windows and macOS.
- **SC-003**: A copy and a download of the same transcript have identical text.
- **SC-004**: A copied transcript has the same blocks, in the same order, as the panel shows
  for that meeting.

## Assumptions

- Plain text replaces Markdown as what Copy and Download produce. Markdown is not offered as an
  alternative in this feature; choosing a format is a later item in the todo list.
- The date line shows the meeting's start in the user's locale, such as "October 6, 2026 at 12:07
  PM" in US English.
- Lines end with a single line feed, which current text editors on Windows, macOS and Linux all
  display correctly. Files are saved as UTF-8.
- The attendees line follows Google Meet's own transcripts, which appear to list attendees at the
  top (not verified).
- The heading uses the same meeting name as the panel ("Untitled meeting" for a meeting without
  a title), not the attendee-based name used in file names.
- The extension has not been released to the store, so no one depends on the Markdown output.
