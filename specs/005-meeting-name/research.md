# Research: Show the Meeting's Name Instead of Its Code

No items in the Technical Context were left as NEEDS CLARIFICATION. The decisions below record the
choices made and what was rejected.

## 1. Where Google Meet reports a call's name

Observed by the maintainer in live calls on 2026-10-05, in an English-language Chrome:

| Call | Browser tab title |
| --- | --- |
| Created from a calendar event with a name | `Meet - <the event's name>` |
| Instant call with no name | `Meet - <the call's code>`, for example `Meet - kxp-mwrd-tzb` |

Not observed: the title on the "Ready to join?" screen, after leaving a call, and in other
browser languages.

The extension's code has nothing today that reads a name; a meeting's title is its code unless
the user renames it.

## 2. Read the tab title in the service worker

- **Decision**: take the title from Chrome's tab information in the service worker: once when a
  meeting is created or resumed for a tab, and whenever `chrome.tabs.onUpdated` reports a changed
  title for a tab that belongs to a call.
- **Rationale**: the service worker already has the `tabs` permission, already listens to
  `onUpdated`, and already knows which tab belongs to which call. No code is added to the Meet
  page, and nothing in Meet is touched.
- **Alternatives considered**:
  - *Watching the page's title element from a content script*: reads the same value but adds
    page-side code and a new message for no gain.
  - *Reading the name from Meet's network responses*: language-independent, but it is
    undocumented binary data that would need captured samples and can change without notice. Kept
    as a possible second source if the tab title proves unreliable.

## 3. Recognising the name

- **Decision**: accept a title of the form "Meet", a hyphen or dash, then text. The text is the
  name unless it is empty or equals the call's code.
- **Rationale**: it matches both observed forms and treats the instant-call form as "no name"
  without a special case. Allowing a dash as well as a hyphen costs nothing and guards against a
  typographic change.
- **Alternatives considered**: accepting any tab title as the name. Rejected: a bare "Meet" or a
  transient title would become a meeting's title.

## 4. Remove renaming

- **Decision**: remove every way to rename a meeting: the pencil button in both popups,
  double-click editing of a title in both lists and on the live panel, the suggestions of earlier
  titles, and the messages and store functions behind them.
- **Rationale**: decided by the maintainer: with names coming from Meet, a user has no reason to
  rename a meeting. It also makes the title rule one line (Meet's name, else the code) and removes
  the need to track who set a title.
- **Consequence**: an instant call has no label but its code, and an unhelpful name cannot be
  changed. Search across saved meetings, planned separately, is how such a call would be found.
- **Alternatives considered**: keeping renaming and marking each title's source so a hand-typed
  one is never replaced. This was the first design; it was dropped with the decision above.

## 5. Recurring calls

- **Decision**: a new meeting does not copy the title of an earlier meeting with the same code.
- **Rationale**: that carry-over existed to keep a hand-typed title on a recurring call. Meet
  reports the current name on every call, so there is nothing to remember, and a name changed in
  the calendar is picked up.

## 6. Meetings saved earlier

- **Decision**: leave stored titles as they are, including hand-typed ones.
- **Rationale**: the names of past calls were never recorded, and a title the user typed is still
  the best label those meetings have. No stored shape changes.
- **Edge**: a meeting resumed after the update (the same call rejoined within the resume window)
  takes Meet's name if the call has one, even if its title was typed by hand before.

## 7. Updating an open panel

- **Decision**: reuse the existing `meeting_renamed` message when the name is applied.
- **Rationale**: the floating panel already updates its title on that message, and the meetings
  lists read the stored title when they load.

## 8. Tests

- **Decision**: unit tests for the name function; no test for the service worker wiring.
- **Rationale**: the parsing is where a mistake would be subtle, and it is pure. The wiring
  depends on Chrome's tab events and is checked in a live call.
