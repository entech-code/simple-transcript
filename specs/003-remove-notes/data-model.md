# Data Model: Remove the Notes Functionality

## Saved meeting

Stored under the `meetings` key in `chrome.storage.local`.

| Field | Before | After |
| --- | --- | --- |
| id, meetingCode, title, description, startTime, endTime, participants, entries | In use | Unchanged |
| notes | A list of notes; empty on a new meeting | Not created on new meetings. Left as it is on meetings that already have it, and never read |

**Rules**

- A meeting saved by the previous version opens with its full transcript (FR-008).
- A `notes` list on a stored meeting, empty or not, causes no error and is never shown, exported
  or removed (FR-009).
- A meeting is empty, and is discarded when its call ends, when it has no transcript lines
  (FR-007).

## Note

No longer part of the model. Before this feature a note had an id, its text and the time it was
written.

## Messages removed

| Direction | Message | Purpose it had |
| --- | --- | --- |
| Popup to service worker | `add_note`, `update_note`, `delete_note` | Change a meeting's notes |
| Service worker to popup | `note_added`, `note_updated`, `note_deleted` | Tell an open panel about the change |

## Messages changed

| Message | Change |
| --- | --- |
| `meeting_snapshot` | No `notes` field |
| Response to the meeting-entries request | No `notes` field |

All other messages are unchanged.

## Export output

| Format | Before | After |
| --- | --- | --- |
| Markdown | A "## Notes" block before the transcript when the meeting had notes | No notes block |
| Plain text | A "=== Notes ===" block and a "=== Transcript ===" divider when the meeting had notes | Neither |
| JSON, SRT, VTT | Never contained notes | Unchanged |

For a meeting without notes every format is unchanged.
