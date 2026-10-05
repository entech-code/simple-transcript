# Implementation Plan: Remove the Language Dropdown

**Branch**: `feat/remove-language-dropdown` | **Date**: 2026-10-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/004-remove-language-dropdown/spec.md`

## Summary

Remove the language dropdown from the floating panel and everything behind it that controls
Google Meet's caption language: sending a language to Meet, re-sending it when Meet or the
captions disagree, writing it into Meet's saved preference, remembering a language per meeting and
keeping a list of recent languages. Afterwards the extension only receives captions, in whatever
language Meet is set to.

This also removes one of the two requests the extension makes to Google Meet's server. The other,
refreshing the participant list, stays.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), target ES2022

**Primary Dependencies**: none at runtime; no dependency is added or removed

**Storage**: `chrome.storage.local`. `settings.language`, `settings.languageByCode` and the
`recentLanguages` key are no longer read or written; they are left in place. The script also
stops editing Meet's own saved preference in the page's `localStorage`

**Testing**: the existing Vitest suite (`npm test`, 98 tests) must pass unchanged. No test covers
the removed code. Behaviour is checked by hand in live calls

**Target Platform**: Chrome Manifest V3 extension

**Project Type**: browser extension, single project

**Performance Goals**: N/A (the change removes code)

**Constraints**: caption capture, speaker names and automatic enabling of captions must be
unaffected (FR-006, FR-007); the participant-list refresh must keep working; no request to set the
caption language may remain (FR-005)

**Scale/Scope**: 2 files deleted, 7 edited; about 190 language-related lines removed, 80 of them
in the injected interceptor

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Result |
| --- | --- | --- |
| I. Data stays on the user's machine | One of the two requests the extension makes to Google Meet is removed. The constitution's list of those requests is updated to match. | Pass |
| II. Minimal permissions | `manifest.json` is not touched. | Pass |
| III. Never break the call | This principle is the main reason for the feature: the extension stops altering Meet's behaviour (its caption language and its saved preference). The interceptor is edited, so the change must leave caption capture exactly as it is. | Pass, with live verification |
| IV. Simplicity and zero runtime dependencies | Net removal of code that depends on undocumented Meet internals; no dependency change. | Pass |
| V. Verified before merge | Typecheck, tests and build must pass. The interceptor and the service worker are edited, so live calls are required: one in a Latin-script language, one in another script, and one on a meeting with a remembered language. | Pass |
| Technical constraints: storage | Stored settings lose two fields going forward; existing settings stay readable because the extra fields are ignored. | Pass |
| Development workflow | One logical change on `feat/remove-language-dropdown`; no formatting-only edits; `manifest.json` version not edited. | Pass |

**Post-design re-check**: unchanged. No violations, so Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-remove-language-dropdown/
├── plan.md              # This file
├── research.md          # Decisions and alternatives
├── data-model.md        # Stored settings and messages that change
├── quickstart.md        # How to verify the feature
├── checklists/
│   └── requirements.md
└── tasks.md             # Created later by /speckit-tasks
```

No `contracts/` folder: the feature removes internal messages and adds no interface.

### Source Code (repository root)

```text
DELETED
src/utils/protobuf-encoder.ts     # builds the two "set language" messages; nothing else uses it
src/utils/language-script.ts      # guesses whether caption text fits a language; used only to re-send

EDITED
src/injected/interceptor.ts       # wanted/sent language state, sending over the call channel and by request,
                                  # re-sending, reading Meet's own announcement, writing Meet's saved preference
src/background/service-worker.ts  # pushing a language when a call starts, remembering it, the two language messages
src/content/floating-popup.ts     # the dropdown, its list building, handlers and styles
src/content/content-bridge.ts     # relaying the language messages between page and service worker
src/content/caption-observer.ts   # the "captions are being enabled" signal, which only the language code used
src/utils/types.ts                # LANGUAGE_CHANGE, LANGUAGE_OBSERVED, CAPTIONS_ENABLING; settings.language, languageByCode
src/utils/constants.ts            # LANGUAGE_CODES and LOCALE_TO_LANG_ID, if nothing else uses them
README.md, WEBSTORE_LISTING.md    # language wording
.specify/memory/constitution.md   # the list of requests to Meet
todo.md                           # item moved to Completed
```

**Structure Decision**: no new files. Two modules are deleted and the files that used them are
edited.

## Design Notes

- **Order of work**: remove the senders first (the panel's dropdown, then the service worker's
  pushing and remembering, then the relay), then the interceptor's language code, then the unused
  modules, message names and constants. The compiler reports missed references once the message
  names are deleted.
- **What stays in the interceptor**: the wrapping of the page's `fetch` and of the data channels
  is shared with caption capture and with the participant-list refresh. Only the language parts
  come out. The captured request headers and the captured "sync" request stay, because the
  participant refresh needs them. The captured session identifier is used only for the language
  request and goes.
- **The media-session channel**: the interceptor watches this channel only to send a language over
  it and to read Meet's language announcement from it. That watching is removed. Caption channels
  are handled separately and are untouched.
- **Captions in another language**: the check that compared each caption with the wanted language
  ran inside the caption handlers. Its call is removed from both handlers; the handlers otherwise
  stay as they are.
- **The caption's language number**: the parsers still report the `langId` Meet sends with a
  `captions` message. It is data, not control, and the tests assert it, so it stays.
- **Automatic enabling of captions**: unchanged. The clicks that turn captions on stay; only the
  message that told the interceptor "captions are being enabled" is removed, because its sole use
  was to time a language re-send.
- **The panel's toolbar**: with the dropdown gone, the toolbar holds the Copy and Export buttons
  only. Its layout is checked by eye.
- **Documentation**: the README's "31 languages" feature line and "Language" section become a
  statement that the transcript follows Meet's caption language. The store listing's line about
  picking a language and a recurring call keeping it is replaced likewise. The README and the
  constitution stop listing the caption-language request.

## Risks

- **Damaging caption capture while editing the interceptor.** The language code is woven through
  the same `fetch` and data-channel wrappers that capture captions. Mitigation: remove only code
  whose every use is language-related, let the compiler confirm, and verify capture in live calls
  on both a `captions` and, if available, a `captions_v2` client.
- **Breaking the participant-list refresh.** It shares the captured headers with the language
  request. Mitigation: keep the header capture; verify that speaker names still appear.
- **A user with a remembered language.** After the update Meet uses its own stored language, which
  may differ from what the extension used to force. This is the intended behaviour; it is noted in
  the pull request.

## Out of Scope

- Showing the current caption language, or hinting at a mismatch.
- The participant-list refresh request.
- Erasing stored language settings.
- Removing the unused `langId` from the caption data.

## Complexity Tracking

No constitution violations to justify.
