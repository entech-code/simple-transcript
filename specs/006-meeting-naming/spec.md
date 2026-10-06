# Feature Specification: Name Untitled Meetings and Downloaded Transcripts

**Feature Branch**: `feat/meeting-naming`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "Name saved transcript files in Google Meet's order: '<meeting title> - Transcript <YYYY>-<MM>-<DD> <HH>-<mm>.md'. A meeting without a title from Google Meet should not be shown with its Meet code, which means nothing to people; call it something readable instead, for example 'Untitled meeting' or 'Meeting with <attendees>'."

## User Scenarios & Testing *(mandatory)*

A meeting created from a calendar event has a title from Google Meet. An instant meeting has
none, and the extension currently shows its Meet code, such as `eoq-yhou-uyp`, in its place.
Downloaded transcripts are named "<title> <YYYYMMDDHHmm>.md" today, and a title in a non-Latin
script is removed from the file name entirely.

### User Story 1 - A meeting without a title has a readable name (Priority: P1)

A person holds an instant meeting. In the extension it is called "Untitled meeting", with its
attendees listed under the name as for any meeting. When its transcript is downloaded, the file
is named after the other attendees, so it can be found among other files.

**Why this priority**: The code is meaningless to people and looks like an error. Every instant
meeting is affected.

**Independent Test**: Start an instant meeting with another person and confirm the extension
never shows the Meet code as its name.

**Acceptance Scenarios**:

1. **Given** an instant meeting with Alexey Kornakov, **When** the user views it in the list, the
   opened meeting or the live view, **Then** it is called "Untitled meeting", with Alexey
   Kornakov among the attendees shown under it.
2. **Given** that meeting, **When** its transcript is downloaded, **Then** the file name starts
   with "Meeting with Alexey Kornakov".
3. **Given** an instant meeting with four other people, **When** its transcript is downloaded,
   **Then** the file name starts with "Meeting with <first>, <second> and 2 others", naming the
   first two who joined.
3a. **Given** an instant meeting where the user is alone, **When** its transcript is downloaded,
   **Then** the file name starts with "Untitled meeting".
4. **Given** a meeting with a title from Google Meet, **When** the user views it, **Then** its
   title is shown as before.

---

### User Story 2 - Downloaded transcripts are named like Google Meet's own (Priority: P1)

A person downloads a transcript. The file is named with the meeting's name first, then the date
and time the meeting started, then the word "Transcript", so the date reads as the meeting's and
not as when the file was saved.

**Why this priority**: The file name is what people see in their Downloads folder and what they
search for later. It should say what the file is and which meeting it belongs to, in any
language.

**Independent Test**: Download a transcript of a named meeting and of an untitled one and check
both file names.

**Acceptance Scenarios**:

1. **Given** a meeting titled "Entech Monthly Check-in with Formula" that started at 12:07 on
   2026-10-06, **When** its transcript is downloaded, **Then** the file is named
   `Entech Monthly Check-in with Formula - 2026-10-06 12-07 - Transcript.md`.
2. **Given** an untitled meeting, **When** its transcript is downloaded, **Then** the file name
   uses the same readable name as in User Story 1, followed by the date and time and
   " - Transcript".
3. **Given** a title in a non-Latin script, **When** its transcript is downloaded, **Then** the
   title is kept in the file name.
4. **Given** a title containing characters not allowed in file names, **When** its transcript
   is downloaded, **Then** those characters are replaced and the rest of the title is kept.

---

### Edge Cases

- Two meetings with the same title on the same day: their file names differ by start time.
- Two untitled meetings on the same day: their file names differ by start time.
- A very long title: the title part of the file name is shortened so the whole name stays a
  usable length.
- A title that ends with a dot or a space: it is removed from the end of the file name, which
  Windows does not allow.
- A title made only of characters not allowed in file names: the untitled name is used.
- The copied text and the exported file's heading use the same name as the list.
- An attendee whose name the extension never learned (shown only as a device): not counted in
  the name.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST NOT show a meeting's Meet code as its name anywhere: not in the
  lists, the opened meeting, the live view, copied or exported transcripts, or file names.
- **FR-001a**: In the lists, the opened meeting, the live view, and the heading of copied and
  exported transcripts, a meeting without a title from Google Meet MUST be called "Untitled
  meeting".
- **FR-002**: In the name of a downloaded file, a meeting without a title from Google Meet MUST
  be named after its other attendees, leaving out the user:
  - one other attendee: "Meeting with <name>";
  - two: "Meeting with <name> and <name>";
  - three or more: "Meeting with <name>, <name> and N other(s)", naming the first two who joined,
    with "1 other" or "N others";
  - none, or only the user: "Untitled meeting".
  Names are shown in full, as Google Meet shows them.
- **FR-002a**: When the user's own name is not known, a meeting whose only attendee name could be
  the user MUST be called "Untitled meeting", so that a meeting is never named after the user.
- **FR-002b**: A file downloaded during a call MUST use the attendees known at that moment.
- **FR-003**: A meeting without a title from Google Meet MUST be stored with an empty title, not
  its Meet code. Meetings saved before this feature are left as they are.
- **FR-004**: The Meet code MUST stay stored with each meeting.
- **FR-005**: A downloaded transcript's file name MUST be the meeting's name, then " - ", then
  the start date as `YYYY-MM-DD`, a space, and the start time as `HH-mm` in local time, then
  " - Transcript" and the file extension.
- **FR-006**: The meeting's name in a file name MUST keep letters in any script and punctuation
  that file names allow. Characters not allowed in file names on Windows, macOS or Linux MUST be
  replaced by spaces, runs of spaces collapsed, and a trailing dot or space removed.
- **FR-007**: The meeting's name in a file name MUST be limited to 100 characters.
- **FR-008**: The heading of a copied or exported transcript MUST use the same name as the list
  ("Untitled meeting" for a meeting without a title); only the file name uses the attendees.
- **FR-009**: Automated tests MUST cover the file name for: a normal title, padding of the date
  and time, invalid characters, a non-Latin title, a trailing dot, a very long title, and an
  empty result; and the shown name for: a title from Google Meet and an empty title.

### Key Entities

- **Meeting name**: what the extension shows and exports for a meeting: its title from Google
  Meet, or the untitled name.
- **Downloaded file name**: the meeting name, the start date and time, "Transcript", and the
  extension.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No meeting is shown, copied, exported or downloaded under its Meet code.
- **SC-002**: Every downloaded transcript's name starts with the meeting's name and contains
  "Transcript" and the start date and time.
- **SC-003**: A meeting title in any script survives into the file name.
- **SC-004**: Two meetings downloaded from the same day never get the same file name unless
  they started in the same minute and have the same name.

## Assumptions

- "Transcript" comes last, after the date, so the date is not mistaken for when the file was
  saved; Google Meet's own transcripts also appear to end in "- Transcript" (not verified). A
  dash separates the title from the date, so a title ending in a number stays readable.
- The file extension stays `.md` in this feature. Making plain text the default, and `.txt` the
  extension, is the next item in the todo list.
- The name of a meeting without a title is worked out when the meeting is shown or exported,
  from its stored attendees, so it always matches the attendee tags.
- The user's own name is read from the Google Meet page during a call and stored with the
  meeting. Meetings saved before this feature do not have it; no effort is made to recover it,
  so such a meeting with a single attendee is called "Untitled meeting".
