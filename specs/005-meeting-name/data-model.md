# Data Model: Show the Meeting's Name Instead of Its Code

## Saved meeting

Stored under the `meetings` key in `chrome.storage.local`. No field is added or removed.

| Field | Before | After |
| --- | --- | --- |
| `title` | The Meet code, or a title typed by the user | Meet's name for the call, else the Meet code |
| All other fields | In use | Unchanged |

Meetings saved before this feature keep the titles they have, including hand-typed ones.

## Title rules

1. **A new meeting** is titled with its Meet code.
2. **When Meet reports a name** for the call, and it differs from the meeting's title, the title
   becomes that name.
3. **A reported name that equals the code, is empty, or is in an unrecognised form** is not a name
   and changes nothing. A title is therefore never changed back from a name to the code.
4. **Nothing else changes a title.** There is no renaming by hand.

## Name from a tab title

| Tab title | Meeting code | Name |
| --- | --- | --- |
| `Meet - Entech Daily Meeting` | any | `Entech Daily Meeting` |
| `Meet - eoq-yhou-uyp` | `eoq-yhou-uyp` | none |
| `Meet –  Budget review  ` (dash, extra spaces) | any | `Budget review` |
| `Meet - Q3 - Planning` | any | `Q3 - Planning` |
| `Meet` | any | none |
| `Meet - ` | any | none |
| `Google Calendar`, an empty title, or anything not starting with "Meet" and a separator | any | none |

## Messages

| Message | Change |
| --- | --- |
| `rename_meeting` (popup to service worker) | Removed |
| `get_meeting_titles` (popup to service worker) | Removed |
| `meeting_renamed` (service worker to popup) | Kept. Now sent when Meet's name is applied, not when a user renames |

All other messages are unchanged.
