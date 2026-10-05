# Data Model: Remove the Language Dropdown

## Stored settings

In `chrome.storage.local`.

| Key or field | Before | After |
| --- | --- | --- |
| `settings.language` | The language picked last | Not read or written; left as stored |
| `settings.languageByCode` | A language per meeting code | Not read or written; left as stored |
| `recentLanguages` | The five most recent languages | Not read or written; left as stored |
| `settings.enabled`, `settings.dedupeWindowMs` | In use | Unchanged |
| `meetings`, `deviceMap` and the panel position keys | In use | Unchanged |

**Rule (FR-008)**: stored language values are never applied or shown and cause no error.

## Google Meet's own data

| Item | Before | After |
| --- | --- | --- |
| Meet's saved caption-language preference in the page's `localStorage` | Overwritten when a language was chosen or pushed | Never written by the extension |
| Meet's caption language for the call | Set and re-sent by the extension | Never set by the extension |

## Messages removed

| Message | Direction | Purpose it had |
| --- | --- | --- |
| `language_change` | Panel to service worker to page | Set the caption language |
| `language_observed` | Page to service worker | Report a language picked inside Meet |
| `language_set` | Service worker to panel | Update the dropdown |
| `captions_enabling` | Content script to page | Mark the moment captions were being turned on |

All other messages are unchanged.

## Requests to Google Meet

| Request | Before | After |
| --- | --- | --- |
| Set the caption language (`UpdateMediaSession`) | Sent as a fallback | Removed |
| Language change over the media-session channel | Sent | Removed |
| Refresh the participant list | Sent when a speaker is unknown | Unchanged |

## Caption data

Unchanged. A caption still carries its speaker device, message identity, revision, text and the
language number Meet attaches to it.
