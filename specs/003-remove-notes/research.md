# Research: Remove the Notes Functionality

No items in the Technical Context were left as NEEDS CLARIFICATION. The decisions below record the
choices made and what was rejected.

## 1. Where notes are wired in

Findings from the code:

- `types.ts` defines `NoteEntry`, the `notes` list on `Meeting`, and three message names.
- `meeting-store.ts` has `addNote`, `updateNote`, `deleteNote` and `getNotes`, and gives every new
  meeting an empty `notes` list.
- `service-worker.ts` handles the three note messages, includes notes in the meeting snapshot and
  the meeting-entries response, passes notes to the exporters, and treats a meeting as empty only
  if it has no transcript lines and no notes (two places).
- `transcript-store.ts` prepends a notes block in the Markdown and text exports.
- `floating-popup.ts` holds the Notes section, its input, list, editing and deleting, the note
  count in the footer and the notes block in the meeting detail (about 76 references).
- `popup.ts` and `popup.html` show a notes block in the meeting detail and count notes in the
  footer.
- JSON, SRT and VTT exports never included notes. The tests do not reference notes.

## 2. Stored notes: ignore, do not erase

- **Decision**: leave the `notes` list on saved meetings untouched and stop reading it.
- **Rationale**: confirmed by the maintainer. It needs no code at all, cannot damage a saved
  meeting, and an old note stays recoverable by hand from the browser's storage.
- **Alternatives considered**: stripping `notes` from every meeting on update. Rejected: it is
  one-off migration code that touches every saved meeting for no visible benefit.

## 3. Saved meetings that contain only notes

- **Decision**: they stay in the list and open as a meeting with no transcription entries.
- **Rationale**: confirmed by the maintainer. Deleting them on update would remove data nobody
  asked to remove. The empty-meeting rule is applied only when a call ends, as today.
- **Alternatives considered**: deleting them on update, or hiding them from the list; both
  rejected as silent data loss.

## 4. The Transcription section header

- **Decision**: remove the "Transcription" header and its collapse control together with the
  Notes section.
- **Rationale**: the header and chevron exist to let two sections share the panel. With one
  section left, a collapsible header only costs a row and offers a way to hide the one thing the
  panel is for. The spec asks for the space to go to the transcript.
- **Alternatives considered**: keeping the header as a plain label; rejected because the panel
  title already says what the view is.

## 5. Export function signatures

- **Decision**: remove the optional `notes` parameter from `exportAsText` and `exportAsMarkdown`.
- **Rationale**: nothing passes notes any more, and an unused parameter invites them back. Calls
  that pass no notes are unaffected, so the existing tests pass unchanged.
- **Alternatives considered**: leaving the parameter in place; rejected as dead code.

## 6. Verification

- **Decision**: rely on the existing export tests plus a live-call check; add no new tests.
- **Rationale**: the tests already pin the note-free export output exactly. What is new is the
  absence of interface elements, which only a look at the popups can confirm.
