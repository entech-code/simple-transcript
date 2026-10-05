# Data Model: Rebrand to Simple Transcript and Remove Notula

This feature changes no stored shape. It stops using some stored data and leaves the rest alone.

## Stored data that stays in use

All in `chrome.storage.local` unless noted. Nothing here changes.

| Key | Holds |
| --- | --- |
| `meetings` | Every saved meeting: title, Meet code, times, participants, transcript entries, notes |
| `settings` | The caption language and related settings |
| `deviceMap` | Speaker device identifiers and their display names |
| `recentLanguages` | Recently used caption languages |
| panel position and size keys | Where the floating panel was last placed |
| `sessions` (`chrome.storage.session`) | Live state of calls in progress |

**Rule (FR-007)**: after the update every meeting under `meetings` is listed and opens as before.

## Stored data that is no longer used

Written by the previous version; from this feature on, never read, written or deleted.

| Key | Held |
| --- | --- |
| `notula` | The pairing with the Notula desktop application: port and token |
| `notulaMeetings` | For each meeting, where it was saved and the state of that save |
| `notulaFolders` | The repository and folder remembered for each Meet code |
| `notulaNotices` | Which one-time notices the user had already seen |

**Rule (FR-008)**: the presence of any of these keys, in any state, must not cause an error or
show anything to the user.

## Messages removed

Between the popups and the service worker:

- every message whose type starts with `notula_` (for example `notula_check`,
  `notula_pair_start`, `notula_pair_cancel`);
- the `notula_snapshot` message sent on the popup port.

All other message types are unchanged.

## Names

| Where | Value |
| --- | --- |
| Manifest `name`, README title, store listing | Simple Transcript: Copy & Save for Google Meet |
| Manifest `short_name`, toolbar title, panel title prefix, popup header | Simple Transcript |
| Toolbar title while recording | Simple Transcript - Recording |
| Release title | Simple Transcript `<version>` |
| Release file | `simple-transcript-<version>.zip` |
| `package.json` name | `simple-transcript` |
