# Data Model: Save Transcripts as Plain Text

No stored data changes. This describes the text that Copy and Download produce.

## Layout

```text
<meeting name>
<start date and time>
Attendees: <name>, <name>, <name>

<speaker> (<time>)
<text>

<speaker> (<time>)
<text>
```

| Part | Content |
| --- | --- |
| Meeting name | The title from Google Meet, or `Untitled meeting` (the name the panel shows) |
| Start date and time | The meeting's start, in the user's locale and clock style |
| Attendees line | Known names, once each, in the order they joined, the user included; devices whose name was never learned and code-shaped text left out. The whole line is left out when no name is known |
| Block | One per caption piece, as the panel shows it; consecutive pieces from one speaker are not merged |
| Block time | Hours and minutes, no seconds, user's locale and clock style |

Blocks are separated by one blank line. Nothing is escaped: `*`, `#` and `_` in speech are kept.
Lines end with `\n`.

## Example (US English)

```text
Team Daily Meeting
October 6, 2026 at 12:07 PM
Attendees: Marcus Oyelaran, Dana Whitfield, Priya Raman

Dana Whitfield (12:08 PM)
Good morning everyone.

Dana Whitfield (12:08 PM)
Let's start with the release.

Marcus Oyelaran (12:09 PM)
The build went out yesterday.
```

Downloaded as `Team Daily Meeting - 2026-10-06 12-07 - Transcript.txt`.
