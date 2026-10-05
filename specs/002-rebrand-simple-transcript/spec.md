# Feature Specification: Rebrand to Simple Transcript and Remove Notula

**Feature Branch**: `feat/rebrand-simple-transcript`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Rebrand the extension from "Notula for Google Meet" to "Simple Transcript" and remove everything tied to Notula. Remove the Notula name from the extension's name, toolbar title, popups and documentation. Remove all ads and links to external products, including the "Build AI brain with Notula" link and links to notula.org. Remove all Notula-related features, including "Save to your Git repo via Notula" and the connection to the Notula desktop app, so the extension makes no network requests at all. Transcription, speaker names, meeting history and export keep working as before, and existing users keep their saved meetings."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The extension is called Simple Transcript everywhere (Priority: P1)

A person installs or opens the extension and sees the new name wherever a name is shown. The full
name, "Simple Transcript: Copy & Save for Google Meet", appears in the browser's list of
extensions and in the project's documentation. The short name, "Simple Transcript", appears where
space is tight: on the toolbar button, in the floating panel on the Meet page and in the toolbar
popup. The name "Notula" does not appear anywhere.

**Why this priority**: The product cannot be published under its own name while any surface still
carries another product's name.

**Independent Test**: Install the extension, open every screen it has, and read the README;
confirm the name shown is always the full or the short new name and "Notula" is never shown.

**Acceptance Scenarios**:

1. **Given** the extension is installed, **When** the user views the browser's extensions list,
   **Then** it is listed as "Simple Transcript: Copy & Save for Google Meet" with a description
   that mentions no other product.
2. **Given** the extension is installed, **When** the user hovers the toolbar button, **Then** the
   tooltip shows "Simple Transcript", and "Simple Transcript - Recording" while a meeting is being
   recorded.
3. **Given** a Meet call is open, **When** the user opens the floating panel, **Then** its title
   shows "Simple Transcript" and no mention of Notula.
4. **Given** the user is on any other tab, **When** they open the toolbar popup, **Then** its
   header shows "Simple Transcript" and no mention of Notula.

---

### User Story 2 - No promotion and nothing leaves the browser (Priority: P1)

A person using the extension sees only its own features. There is no advertising, no link to
another product and no offer to connect to another application. The extension makes no network
requests of any kind.

**Why this priority**: Removing the only outbound connection makes the privacy promise simple and
absolute: nothing is sent anywhere. It also removes the largest block of code tied to Notula.

**Independent Test**: Use every screen of the extension during and after a call and confirm there
is no promotional link, no "save to Git repo" offer and no connection prompt; watch the browser's
network activity for the extension and confirm it stays empty.

**Acceptance Scenarios**:

1. **Given** the floating panel or the toolbar popup is open, **When** the user looks through it,
   **Then** there is no "Build AI brain with Notula" link, no "Save to your Git repo via Notula"
   offer and no "Waiting for Notula" message.
2. **Given** a meeting has ended, **When** the user views it in the meetings list, **Then** no
   save-destination line, status or menu related to Notula is shown.
3. **Given** the Notula desktop application is running on the same machine, **When** the
   extension is used, **Then** it does not look for it or contact it.

---

### User Story 3 - Everything else keeps working (Priority: P1)

A person who already uses the extension updates to the rebranded version. Their saved meetings are
all still there, and live transcription, speaker names, renaming, the meetings list and export in
every format work exactly as before.

**Why this priority**: A rebrand that loses data or breaks transcription is worse than no rebrand.

**Independent Test**: With saved meetings from the previous version, update to the new version,
confirm every meeting is listed and opens, then hold a call and export it.

**Acceptance Scenarios**:

1. **Given** saved meetings from the previous version, **When** the extension is updated, **Then**
   every meeting is still listed with its title, participants and transcript.
2. **Given** a Meet call, **When** captions are spoken, **Then** they appear in the transcript
   with speaker names as before.
3. **Given** a saved meeting, **When** it is exported or copied, **Then** the output is the same
   as before the change.
4. **Given** a user who had connected the previous version to Notula, **When** they update,
   **Then** the extension works normally and shows nothing about the old connection.

---

### Edge Cases

- A meeting that was saved to a Git repository through Notula before the update: the meeting stays
  in the extension's list; the file already written to the repository is not touched.
- Leftover connection data stored by the previous version: it is ignored and never shown.
- A recording in progress while the extension updates: it continues as it would for any update.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension's full name MUST be "Simple Transcript: Copy & Save for Google Meet".
  Its short name, used where space is tight (the toolbar tooltip, the floating panel title and
  the toolbar popup header), MUST be "Simple Transcript".
- **FR-001a**: The extension's description, shown in the browser's extensions list, MUST describe
  only what the extension does and MUST NOT mention saving through another application.
- **FR-002**: The word "Notula" MUST NOT appear in anything a user of the extension can see.
- **FR-003**: The extension MUST NOT show any advertisement or link to another product or website.
- **FR-004**: The "Save to your Git repo via Notula" feature MUST be removed entirely, including
  its offers, status lines, destination menus and pairing screens.
- **FR-005**: The extension MUST NOT make any network request.
- **FR-006**: Live transcription, speaker identification, the meetings list, renaming, deleting,
  copying and export in all formats MUST behave as before.
- **FR-007**: Meetings saved by the previous version MUST remain available after the update, with
  nothing lost.
- **FR-008**: Data the previous version stored about Notula MUST NOT cause an error or appear to
  the user.
- **FR-009**: The project's README MUST describe the product under its new name, without the
  Notula feature, and MUST state that the extension makes no network requests.
- **FR-010**: In the project's public pages and store material (the website pages, the privacy
  policy, the store listing text, the promotion notes and the screenshot tooling), the name
  "Notula" MUST be replaced with "Simple Transcript". Passages that describe the removed Notula
  feature, and links to Notula, MUST be deleted. No other rewriting is done in this feature.
  The two website pages that only redirect to notula.org are deleted, since they have no content
  of their own and are not published from this repository. The screenshot tooling and its
  generated images are deleted too: they are built around the Notula feature and show the old
  interface.
- **FR-010a**: Releases published from the repository MUST carry the new name, in both the
  release title and the name of the packaged file.
- **FR-010b**: The README MUST NOT link to the "Notula for Google Meet" store listing. A link to
  the new listing is added when that listing exists.
- **FR-010c**: Repository configuration that exists only for Notula, such as the merge rule for
  Notula comment files, MUST be removed.
- **FR-011**: The extension's icon and colours MUST stay as they are in this feature.
- **FR-012**: The constitution MUST be amended so that its title uses the new name and its privacy
  principle no longer allows a connection to the local machine.

### Key Entities

- **Saved meeting**: a recorded call with its title, participants and transcript. Unchanged by
  this feature.
- **Notula connection data**: what the previous version remembered about a paired Notula
  application and where each meeting was saved. No longer read or written.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A search of everything a user can see in the extension finds zero occurrences of
  "Notula".
- **SC-002**: The extension shows zero links to other products or websites.
- **SC-003**: During a full call and an export, the extension makes zero network requests.
- **SC-004**: After updating from the previous version, 100% of saved meetings are still listed
  and open correctly.
- **SC-005**: Transcription and every export format produce the same results as before the change
  for the same call.

## Assumptions

- The rebranded extension will be published as a new Chrome Web Store listing under a new
  developer account. Creating that listing is outside this feature.
- The original author has agreed to the rebrand and to the Notula features being removed.
- Internal names that users never see (log prefixes, message identifiers and storage keys) are
  out of scope unless they contain "Notula". Renaming them risks breaking stored data for no
  visible benefit. The package name is the exception: it is renamed to `simple-transcript`, since
  nothing depends on it.
- Leftover Notula connection data is left in place and ignored, not actively deleted.
- The Notes functionality and the language dropdown are removed by their own planned features, not
  by this one.
- Adding an open-source licence file is a separate small task.
- A new icon or colour scheme is a separate later task. The current icon carries no Notula
  wording.
- A proper rewrite of the website pages, privacy policy and store listing, with new screenshots,
  is a separate task recorded in `todo.md`. This feature only swaps the name and deletes what no
  longer applies.
- Historical records keep the old name: past release notes, git history and the completed items
  in `todo.md`.
