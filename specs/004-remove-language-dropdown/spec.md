# Feature Specification: Remove the Language Dropdown

**Feature Branch**: `feat/remove-language-dropdown`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Remove the language dropdown and take the caption language from Meet's own CC options. The transcript follows whatever language is set in Meet's caption settings, so there is one place to change it. The extension stops controlling Meet's caption language entirely."

## User Scenarios & Testing *(mandatory)*

Google Meet has its own setting for the language captions are written in. Today the extension
adds a second control for the same setting, and also changes Meet's language on its own: it
remembers a language for each recurring meeting and switches Meet to it when the call starts.

### User Story 1 - One place to set the language (Priority: P1)

A person wants captions, and therefore the transcript, in a particular language. They set it in
Google Meet's caption settings, the way anyone using Meet captions does. The extension's floating
panel has no language control.

**Why this priority**: Two controls for one setting is confusing, and the dropdown takes space in
the panel's toolbar for something most people set once.

**Independent Test**: Open the floating panel during a call and confirm it has no language
control; change the language in Meet's caption settings and confirm the transcript continues in
the new language.

**Acceptance Scenarios**:

1. **Given** a call in progress, **When** the user opens the floating panel, **Then** no language
   dropdown or other language control is shown.
2. **Given** a call in progress, **When** the user changes the caption language in Google Meet's
   settings, **Then** new transcript entries are in that language.

---

### User Story 2 - The extension never changes Meet's language (Priority: P1)

A person sets a caption language in Google Meet. It stays as they set it. The extension does not
switch it when a call starts, does not switch it back later, and does not alter what Meet
remembers for next time.

**Why this priority**: Today a language chosen in Meet can be replaced by one the extension
remembered for that meeting, which looks like Meet ignoring the user. This behaviour also depends
on undocumented parts of Meet and is the kind of code most likely to break.

**Independent Test**: With a meeting for which the previous version had remembered a different
language, join the call and confirm Meet's caption language stays at whatever Meet itself had set.

**Acceptance Scenarios**:

1. **Given** a recurring meeting for which the previous version remembered a language, **When**
   the user joins it, **Then** the caption language is the one Google Meet has set, not the
   remembered one.
2. **Given** a call in progress, **When** captions arrive in a language other than one the
   previous version had stored, **Then** the extension does nothing about it.
3. **Given** a full call, **When** it is observed from start to end, **Then** the extension sends
   no request to change the caption language.

---

### User Story 3 - Transcription keeps working in every language (Priority: P1)

A person holds calls in any language Google Meet can caption. The transcript is captured with
speaker names exactly as before, whichever language is set.

**Why this priority**: Removing a control must not affect what the product is for.

**Independent Test**: Hold a call with Meet's captions set to English and another set to a
non-Latin language, and confirm both are transcribed.

**Acceptance Scenarios**:

1. **Given** Meet's caption language is English, **When** people speak, **Then** the transcript is
   captured as before.
2. **Given** Meet's caption language is one written in another script, **When** people speak,
   **Then** the transcript is captured without corruption.
3. **Given** a new call, **When** the user joins, **Then** captions are still turned on
   automatically, as today.

---

### Edge Cases

- A call where people speak a language other than the one set in Meet: the captions come out
  garbled, as they do in Meet itself. The extension records what Meet produces and does not try to
  correct the setting.
- A user who relied on the per-meeting memory, for example a daily call in one language and client
  calls in another: they change the language in Meet when they switch. Meet keeps the last
  language chosen.
- Language settings stored by the previous version: they are ignored and never applied.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The floating panel MUST NOT show a language dropdown or any other control for the
  caption language.
- **FR-002**: The extension MUST NOT change Google Meet's caption language, at the start of a call
  or at any later time.
- **FR-003**: The extension MUST NOT change what Google Meet remembers as the user's caption
  language.
- **FR-004**: The extension MUST NOT remember a caption language for a meeting, and MUST NOT keep
  a list of recently used languages.
- **FR-005**: The extension MUST NOT send any request to Google Meet whose purpose is to set the
  caption language.
- **FR-006**: The transcript MUST be captured in whatever language Google Meet is captioning in,
  with speaker names, as before.
- **FR-007**: Captions MUST still be turned on automatically when a call is joined.
- **FR-008**: Language settings stored by the previous version MUST NOT be applied, shown or cause
  an error.
- **FR-009**: The README and the store listing text MUST say that the transcript follows the
  caption language set in Google Meet, and MUST NOT describe a language selector, a per-meeting
  language memory or a fixed number of supported languages offered by the extension.
- **FR-010**: The README and the constitution MUST no longer list setting the caption language
  among the requests the extension makes to Google Meet.

### Key Entities

- **Caption language**: the language Google Meet writes captions in. It is a Google Meet setting,
  per person. After this feature the extension only receives captions in it.
- **Stored language settings**: the last language chosen in the extension, a language per
  recurring meeting, and a list of recent languages, kept by the previous version. No longer read
  or written.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The extension shows zero controls for the caption language.
- **SC-002**: Over a full call, the extension makes zero changes to Google Meet's caption language
  and sends zero requests to set it.
- **SC-003**: A caption language set in Google Meet is still the language in use at the end of the
  call, including for a meeting where the previous version had remembered a different one.
- **SC-004**: Calls captioned in a Latin-script and in a non-Latin-script language are both
  transcribed completely.

## Assumptions

- The maintainer confirmed that the extension should stop controlling Meet's caption language
  entirely, including the per-meeting memory and the automatic re-sending of a language.
- The panel does not show which language Meet is currently using. A user who sees captions in the
  wrong language checks Meet's caption settings, as they would without the extension.
- No hint is shown when the spoken language seems not to match the caption language. That could
  be added later as its own feature.
- Turning captions on automatically at the start of a call is unchanged; only the language is no
  longer touched.
- Language settings stored by the previous version are left in place and ignored, not erased.
- The other request the extension makes to Google Meet, refreshing the participant list, is out of
  scope and stays.
