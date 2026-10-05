# Research: Remove the Language Dropdown

No items in the Technical Context were left as NEEDS CLARIFICATION. The decisions below record the
choices made and what was rejected.

## 1. What the dropdown does today

Findings from the code:

- The dropdown is a second control for Google Meet's own caption language. The extension has no
  language setting of its own.
- Choosing a language sends it to Meet over the call's media-session channel, or by a request to
  Meet's `UpdateMediaSession` when that channel is not open. It also writes the choice into Meet's
  saved preference in the page's `localStorage`.
- The extension remembers the language per meeting code and the five most recent languages. When a
  call starts it pushes the remembered language to Meet.
- It reads Meet's own language announcements. One made just after captions start or a channel
  opens is treated as Meet's default and overridden; one made with Meet's dialog open is treated
  as the user's pick and adopted.
- If three captions in a row seem to be in another language, it sends its language again.
- A language chosen inside Meet updates the dropdown.

## 2. Remove the control and the control logic together

- **Decision**: remove the dropdown and all code that sets, re-sends, remembers or observes the
  caption language.
- **Rationale**: confirmed by the maintainer. The dropdown is a shortcut for a Meet setting; the
  logic behind it overrides choices made in Meet and rests on undocumented Meet internals.
- **Alternatives considered**: keeping the per-meeting memory without the dropdown. Rejected: it
  is the part that overrides Meet, and it needs all the fragile sending code.

## 3. No language indicator

- **Decision**: the panel shows nothing about the caption language.
- **Rationale**: confirmed with the spec. Showing it would mean keeping the code that reads Meet's
  announcements, which is part of what makes this area fragile.
- **Alternatives considered**: a read-only label. Deferred; it can be a feature of its own.

## 4. What must stay in the interceptor

- **Decision**: keep the `fetch` and data-channel wrappers, the captured request headers and the
  captured participant "sync" request. Remove the session identifier capture, the media-session
  channel handling and all language state and functions.
- **Rationale**: the wrappers and the headers serve caption capture and the participant-list
  refresh. The session identifier and the media-session channel are used only for language.
- **Verification**: each removed item is confirmed to have no other use before it goes; the
  compiler then confirms nothing references it.

## 5. Files that become unused

- **Decision**: delete `src/utils/protobuf-encoder.ts` and `src/utils/language-script.ts`; remove
  `LANGUAGE_CODES` and `LOCALE_TO_LANG_ID` from `constants.ts` if nothing else uses them.
- **Rationale**: the encoder builds only the two language messages, and the script check exists
  only to decide on a re-send. The constants feed the dropdown and the language checks.

## 6. Stored language settings

- **Decision**: stop reading and writing `settings.language`, `settings.languageByCode` and
  `recentLanguages`; leave what is stored.
- **Rationale**: consistent with how Notula data and notes were handled: ignoring needs no code
  and cannot harm other stored data.

## 7. Verification

- **Decision**: no new automated tests; verify in live calls.
- **Rationale**: the removed code ran only inside a live Meet page. What must be shown is that
  captions are still captured and that Meet's language is left alone, and only a call shows that.
