# Data Model: Name Untitled Meetings and Downloaded Transcripts

## Saved meeting

| Field | Change |
| --- | --- |
| `selfName` | New, optional. The user's own name in that call, as Google Meet shows it. Absent on meetings saved before this feature |
| `title` | Empty for a meeting without a title from Google Meet, instead of its Meet code. Meetings saved before this feature are left as they are |
| `meetingCode`, `participants` and the rest | Unchanged |

## The name shown for a meeting

Used in the meetings lists, the opened meeting, the live view, and the heading of copied and
exported transcripts.

1. A title from Google Meet is shown as it is.
2. An empty title: `Untitled meeting`. The attendees are listed under it as for any meeting.

## The name used in a downloaded file

1. A title from Google Meet is used as it is.
2. An empty title: the file is named after the meeting's other attendees, in the order they joined:

| Other attendees | Name |
| --- | --- |
| none | `Untitled meeting` |
| 1 | `Meeting with Marcus Oyelaran` |
| 2 | `Meeting with Marcus Oyelaran and Priya Raman` |
| 3 | `Meeting with Marcus Oyelaran, Priya Raman and 1 other` |
| 6 | `Meeting with Marcus Oyelaran, Priya Raman and 4 others` |

"Other attendees" are the meeting's participant names without duplicates, without unnamed devices,
without anything shaped like a Meet code, and without the user's own name. When the user's name is not known and only one name remains, the
name is `Untitled meeting`.

## The name of a downloaded file

| Meeting name | Start | File name |
| --- | --- | --- |
| `Monthly Check-in with Harbor Supply` | 2026-10-06 12:07 | `Monthly Check-in with Harbor Supply - 2026-10-06 12-07 - Transcript.md` |
| `Meeting with Marcus Oyelaran` | 2026-10-05 15:01 | `Meeting with Marcus Oyelaran - 2026-10-05 15-01 - Transcript.md` |
| `Планёрка команды` | 2026-03-09 14:05 | `Планёрка команды - 2026-03-09 14-05 - Transcript.md` |
| `Q3: Budget/Plan` | 2026-03-09 14:05 | `Q3 Budget Plan - 2026-03-09 14-05 - Transcript.md` |

## Messages

| Message | Change |
| --- | --- |
| `rtc_device_info` (interceptor to service worker) | Gains `self: true` when the device comes from `CreateMeetingDevice`, the user's own |
| `meeting_renamed` (service worker to panel) | Also sent when `selfName` is first stored |
