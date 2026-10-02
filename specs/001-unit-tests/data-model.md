# Data Model: Automated Unit Tests for Browser-Free Logic

This feature stores no user data and changes no stored shape. The entities below are test inputs
that live in `tests/helpers/samples.ts`.

## Sample message

One binary message in the layout Google Meet uses, built in code with invented content.

| Attribute | Description |
| --- | --- |
| Channel | Which data channel it belongs to: `captions`, `captions_v2`, `collections` or `meet_messages` |
| Fields | The field numbers and values written into the message, following the structure documented in `rtc-message-parser.ts` |
| Expected result | What the matching parser must return, or "no result" |

Samples to define:

| Sample | Channel | Purpose |
| --- | --- | --- |
| Caption, standard | `captions` | Device, message identity, revision, language and text are read |
| Caption, text in alternate field | `captions` | Text is found when Meet places it in a different field |
| Keepalive | `captions` | A message without caption content yields "no result" |
| Caption v2, standard | `captions_v2` | Fields are read from the deeper v2 layout |
| Caption v2, mostly text | `captions_v2` | Regression for the flattening defect (SC-002) |
| Caption v2, later revision | `captions_v2` | Revision number is reported so the caller can keep the newest |
| Caption, non-Latin text | both | Cyrillic and Japanese text survive unchanged |
| Device update | `collections` | Device identifier and display name are read |
| Chat message | `meet_messages` | Sender and text are read |
| Malformed set | all | Empty, truncated, over-long length and random bytes yield "no result" without an error |

**Rule**: every name, sentence, device path and identifier in a sample is invented. Device paths
use the documented form `spaces/<id>/devices/<n>` with a made-up id.

## Sample transcript

An invented meeting used as input for export and file-naming tests.

| Attribute | Description |
| --- | --- |
| Title | An invented meeting title; variants include one with characters invalid in file names and an empty one |
| Start time | A fixed moment, expressed in UTC |
| Entries | Several spoken entries from at least two invented speakers, each with a fixed time, including one with non-Latin text |

Variants: the standard transcript, and an empty transcript with no entries.

## Expected result

The exact output each export format must produce for the sample transcript, and the exact file
name for each title variant. Stored next to the test that uses it and compared on every run.

## New source function

`exportFileName(title, startTime)` in `src/utils/export-filename.ts` returns the file name used
when a transcript is downloaded. It reproduces today's rule exactly: the title with characters
other than letters, digits, space, underscore and hyphen removed, then a space, then the start
time as `YYYYMMDDHHmm` in local time, then `.md`.
