# Feature Specification: Remove the Notes Functionality

**Feature Branch**: `feat/remove-notes`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Remove the Notes functionality from the extension. Users can no longer add, edit, delete or see notes on a meeting, in the floating panel or in the toolbar popup, and notes no longer appear in copied or exported transcripts. Notes are not core to the product, which is the transcript. Existing notes are dropped: they are not migrated, shown or exported, because the extension is new. Transcription, the meetings list and exports otherwise keep working as before."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The panel shows the transcript and nothing else (Priority: P1)

A person in a Google Meet call opens the floating panel and sees the live transcript. There is no
Notes section, no box to type a note into and no list of notes. The space the Notes section used
goes to the transcript.

**Why this priority**: The Notes section is the visible part of the feature and takes room in a
small panel from the thing people opened it for.

**Independent Test**: Open the floating panel during a call and confirm there is no Notes section,
and that the transcript fills the panel.

**Acceptance Scenarios**:

1. **Given** a call in progress, **When** the user opens the floating panel, **Then** no Notes
   section, note input or note list is shown.
2. **Given** the live view, **When** the user looks at the footer, **Then** it counts transcript
   lines only and does not mention notes.
3. **Given** a past meeting, **When** the user opens it in the floating panel or in the toolbar
   popup, **Then** only its transcript is shown, with no Notes block above it.

---

### User Story 2 - Copies and exports contain only the transcript (Priority: P1)

A person copies or exports a meeting. The result contains the meeting's title, date and
transcript, and no Notes block, whether or not the meeting had notes before.

**Why this priority**: Exports are what people keep and share. A note that can no longer be seen
or edited must not keep appearing in them.

**Independent Test**: Export and copy a meeting that had notes under the previous version and
confirm no note text and no "Notes" heading appears.

**Acceptance Scenarios**:

1. **Given** a meeting that had notes, **When** it is copied or exported as Markdown, **Then** the
   output has no "Notes" section and no note text.
2. **Given** a meeting that had notes, **When** it is exported as plain text, **Then** the output
   has no notes block and no "Transcript" divider that only existed to separate notes.
3. **Given** a meeting without notes, **When** it is copied or exported in any format, **Then**
   the output is identical to what it was before this change.

---

### User Story 3 - Everything else keeps working (Priority: P1)

A person who already uses the extension updates to the new version. Their saved meetings are still
listed with their transcripts, and live transcription, renaming, deleting, copying and exporting
work as before.

**Why this priority**: Removing a side feature must not disturb the main one or lose a transcript.

**Independent Test**: With saved meetings from the previous version, some of which have notes,
update and confirm every meeting is listed and opens with its full transcript.

**Acceptance Scenarios**:

1. **Given** saved meetings from the previous version, **When** the extension is updated, **Then**
   every meeting is still listed and opens with its transcript.
2. **Given** a call that ends with at least one transcript line, **When** it ends, **Then** the
   meeting is kept.
3. **Given** a call that ends with no transcript lines, **When** it ends, **Then** no meeting is
   left in the list.

---

### Edge Cases

- A saved meeting that has notes but no transcript lines: it stays in the list and opens as a
  meeting with no transcription entries. It is not deleted by the update.
- A meeting in progress when the extension updates, which already has notes: the notes are no
  longer shown; transcription continues.
- Notes stored by the previous version: they stay in the browser's storage untouched and are never
  shown, exported or deleted by the extension.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The floating panel MUST NOT show a Notes section, a note input or a list of notes.
- **FR-002**: The toolbar popup and the floating panel MUST NOT show notes when a past meeting is
  opened.
- **FR-003**: The extension MUST NOT offer any way to add, edit or delete a note.
- **FR-004**: Copied and exported transcripts, in every format, MUST NOT contain notes or any
  heading or divider that exists only for notes.
- **FR-005**: For a meeting without notes, copied and exported output MUST be identical to what it
  was before this change.
- **FR-006**: Line counts shown to the user MUST count transcript lines only and MUST NOT mention
  notes.
- **FR-007**: A meeting that ends with no transcript lines MUST be discarded, whether or not it
  has notes stored from before.
- **FR-008**: Meetings saved by the previous version MUST remain listed and openable, with their
  transcripts complete.
- **FR-009**: Notes stored by the previous version MUST NOT cause an error, and MUST NOT be shown,
  exported or deleted.
- **FR-010**: Live transcription, speaker names, the meetings list, renaming, deleting, copying
  and exporting MUST otherwise behave as before.
- **FR-011**: The README and the store listing text MUST NOT describe notes as a feature.

### Key Entities

- **Saved meeting**: a recorded call with its title, participants and transcript. It keeps any
  notes it already holds in storage, but the extension no longer reads or changes them.
- **Note**: a line of text a user typed during a call, with the time it was written. No longer
  created, shown or exported.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Nowhere in the extension can a user see, add, edit or delete a note.
- **SC-002**: For a meeting that had notes, copies and exports in every format contain zero note
  text.
- **SC-003**: For a meeting without notes, copies and exports in every format are character for
  character the same as before the change.
- **SC-004**: After updating from the previous version, 100% of saved meetings are still listed
  and open with their full transcripts.
- **SC-005**: A call with no transcript lines never leaves a meeting in the list.

## Assumptions

- Existing notes are dropped, not migrated or exported. The maintainer decided this because the
  extension is new and few notes exist.
- Dropped means no longer used: the stored note data is left in place and ignored, not actively
  erased. A user who needs an old note can still recover it from the browser's storage by hand.
- A saved meeting whose only content is notes is left in the list. Deleting it on update would
  remove data without being asked.
- The automated tests for exports already describe the output without notes, so they must keep
  passing unchanged.
- The language dropdown and other planned removals are separate features.
