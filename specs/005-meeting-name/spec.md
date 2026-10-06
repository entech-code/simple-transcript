# Feature Specification: Show the Meeting's Name Instead of Its Code

**Feature Branch**: `feat/meeting-name`

**Created**: 2026-10-05

**Status**: Draft

**Input**: User description: "Show the name of the meeting instead of the unique id like gim-mxzg-xdx. In the meetings list a call is titled with its Meet code unless it was renamed by hand, which makes meetings hard to tell apart." Amended by the maintainer on 2026-10-05: "Remove the ability to rename a meeting. I don't see a user wanting to rename a meeting for any reason."

## User Scenarios & Testing *(mandatory)*

Every Google Meet call has a code such as `gim-mxzg-xdx`. A call created from a calendar event
also has a name, such as "Entech Daily Meeting". Google Meet shows that name in the browser tab's
title, as "Meet - Entech Daily Meeting". A call with no name shows its code there instead, as
"Meet - eoq-yhou-uyp". Both forms were observed in live calls on 2026-10-05.

Today the extension titles every meeting with its code unless the user renames it by hand.

### User Story 1 - A named call is saved under its name (Priority: P1)

A person joins a call that has a name. In the extension, the live panel and the meetings list show
that name as the meeting's title, without the person doing anything.

**Why this priority**: This is the feature. A list of codes cannot be told apart; a list of names
can.

**Independent Test**: Join a call created from a calendar event with a known name and confirm the
floating panel's title and the meeting's entry in the list show that name.

**Acceptance Scenarios**:

1. **Given** a call named "Entech Daily Meeting", **When** the user joins it, **Then** the
   meeting's title in the floating panel and in the meetings list is "Entech Daily Meeting".
2. **Given** a call whose name is not known at the moment the meeting starts being recorded,
   **When** the name becomes known during the call, **Then** the title changes from the code to
   the name.
3. **Given** a named call that has ended, **When** the user opens the meetings list later,
   **Then** the meeting is still listed under its name.
4. **Given** a named meeting, **When** it is copied or exported, **Then** the name is used as the
   transcript's heading and in the downloaded file's name.
5. **Given** a recurring named call, **When** it is joined on another day, **Then** the new
   meeting is titled with the name Google Meet shows at that time.

---

### User Story 2 - A call without a name keeps its code (Priority: P1)

A person starts an instant call that has no name. The extension shows the call's code as its
title, as it does today.

**Why this priority**: The extension must never show a wrong or empty title. The code is the
correct fallback and is what users see today.

**Independent Test**: Start an instant call from Google Meet's "New meeting" and confirm its title
is the Meet code.

**Acceptance Scenarios**:

1. **Given** an instant call with no name, **When** the user joins it, **Then** the meeting's
   title is its Meet code.
2. **Given** any call, **When** the name cannot be read for any reason, **Then** the title is the
   Meet code and transcription is unaffected.

---

### User Story 3 - Titles are not edited by hand (Priority: P2)

A person looks at a meeting in the floating panel or the toolbar popup. Its title is shown as
text. There is no rename button, and clicking or double-clicking the title does not make it
editable.

**Why this priority**: With names coming from Google Meet, renaming has no purpose, and removing
it leaves fewer controls and one simple rule for what a title is. It comes after the first two
stories because it removes something instead of delivering the name.

**Independent Test**: In both popups, look for a rename control on a meeting and double-click a
meeting's title and the live panel's title; confirm nothing becomes editable.

**Acceptance Scenarios**:

1. **Given** the meetings list in either popup, **When** the user looks at a meeting's actions,
   **Then** there is no rename button; copy, export and delete remain.
2. **Given** the meetings list, **When** the user double-clicks a meeting's title, **Then** the
   title does not become editable and the meeting opens as on a single click.
3. **Given** a call in progress, **When** the user double-clicks the meeting's title in the live
   view, **Then** it does not become editable and no list of earlier titles is offered.

---

### User Story 4 - An opened meeting looks like its entry in the list (Priority: P2)

A person clicks a meeting in the list to read its transcript. At the top they see the same block
they clicked: the full title, the date and duration, the code and the participants, with the copy,
export and delete buttons in the same place, now always visible. The transcript is underneath.

**Why this priority**: A long name does not fit in a one-line header, and the opened meeting
should show the same details the list did. It builds on the title work of the first stories.

**Independent Test**: Open a saved meeting in the floating panel and in the toolbar popup and
compare the top of the view with the meeting's entry in the list.

**Acceptance Scenarios**:

1. **Given** a saved meeting, **When** the user opens it, **Then** the title bar reads "Simple
   Transcript", a "Meetings" back control is at the top, and below it the meeting's title, date,
   duration, code and participants are laid out as in the list.
2. **Given** an opened meeting, **When** the user is not hovering over anything, **Then** the
   copy, export and delete buttons are visible on the date line.
3. **Given** an opened meeting, **When** the user deletes it and confirms, **Then** the meeting is
   removed and the meetings list is shown.
4. **Given** an opened meeting with a long transcript, **When** the user scrolls, **Then** the
   block at the top stays in view.
5. **Given** a call in progress, **When** the user opens the floating panel, **Then** the title
   bar reads "Simple Transcript" and the same block is shown for the live call, with its running
   duration, with copy and export buttons and without a delete button.
6. **Given** a call in progress, **When** another person joins or the call's name becomes known,
   **Then** the block updates without the panel being reopened.

---

### Edge Cases

- The tab title is not in the expected form, for example just "Meet", or a form the extension does
  not recognise: the title stays as the code.
- The name becomes known only after several seconds, or the tab title changes more than once while
  the page loads: the title settles on the name once it is known, and does not flicker back to
  the code.
- Google Meet changes the tab title during the call for another reason: a title that no longer
  matches the expected form is ignored and the last good name is kept.
- A call's name is changed in the calendar while the call is in progress: the title follows the
  new name.
- Meetings saved before this feature: they keep their current titles, including titles the user
  typed by hand. Names that were never recorded cannot be recovered.
- An instant call: it is listed by its code and told apart by date and participants.
- A name containing characters that are not allowed in file names: the downloaded file's name is
  cleaned as it is today.
- A long name: wherever a meeting's block is shown it wraps onto a second line, and anything
  beyond two lines is cut off. Hovering shows the whole name.
- Two different calls with the same name: they are listed separately under the same title and
  told apart by date and participants.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When a call has a name, the extension MUST use that name as the meeting's title in
  the floating panel, the toolbar popup, the meetings list, and copied and exported transcripts.
- **FR-002**: When a call has no name, or the name cannot be determined, the meeting's title MUST
  be its Meet code.
- **FR-003**: The extension MUST treat a reported name that equals the call's code as "no name".
- **FR-004**: If the name becomes known or changes after the meeting has started being recorded,
  the title MUST be updated to the name, including in a panel that is already open.
- **FR-005**: The extension MUST NOT offer any way to rename a meeting: no rename button, no
  editing of a title by clicking or double-clicking it, and no suggestions of earlier titles.
- **FR-006**: A new meeting MUST NOT take its title from an earlier meeting with the same code.
- **FR-007**: Reading the name MUST NOT change anything in Google Meet, and a failure to read it
  MUST NOT affect the call or the transcript.
- **FR-008**: Meetings saved before this feature MUST keep their titles and remain readable.
- **FR-009**: The meeting's name MUST stay in the browser's local storage with the rest of the
  meeting and MUST NOT be sent anywhere.
- **FR-010**: Automated tests MUST cover how a title is derived from Google Meet's tab title: a
  named call, a call with no name, an unrecognised form, and a name with leading or trailing
  spaces.
- **FR-011**: The README and the store listing text MUST NOT describe renaming meetings.
- **FR-012**: In the meetings lists, a title MUST be shown on up to two lines; a longer title is
  cut off with an ellipsis. The full title MUST be available by hovering over it.
- **FR-013**: The floating panel's title bar MUST show the product name, "Simple Transcript", in
  every view, and never a meeting's title.
- **FR-014**: The action buttons on a meeting in the list (copy, export, delete) MUST appear at
  the right end of the line that shows the date and duration, when the meeting is hovered or
  focused. They MUST NOT take width from the title.
- **FR-015**: When a saved meeting is opened to view its transcript, in either popup, the top of
  the view MUST show the meeting the same way as in the list: the title on up to two lines, the
  date and duration, and the code and participants. Its action buttons MUST be in the same place
  as in the list and MUST always be visible. The transcript follows below.
- **FR-015a**: In that view the title bar of the popup MUST show the product name, "Simple
  Transcript", not the meeting's title, and a "Meetings" back control MUST be shown at the top,
  above the meeting's block.
- **FR-016**: Deleting a meeting from that view MUST ask for confirmation as in the list, and on
  confirmation MUST return to the meetings list.
- **FR-017**: During a live call, the floating panel MUST show the same block for the call in
  progress, below the "Meetings" back control: the title on up to two lines, the date and time
  the call started with its running duration as the list shows it ("3 min (live)"), and the
  participants. It MUST have copy and export buttons, always visible, and MUST NOT have a delete
  button. The title and the participants
  MUST update as the name becomes known and as people join.
- **FR-018**: Before a call is in progress, the live view MUST NOT show an empty block.
- **FR-019**: The floating panel's title bar MUST have only a close button. The meetings list is
  reached from the "Meetings" back control, and the live call from its entry at the top of the
  list. The panel cannot be minimised; it is closed and reopened from the toolbar icon.

### Key Entities

- **Meeting title**: what the extension shows for a meeting: Google Meet's name for the call, or
  the Meet code when there is none.
- **Meeting name**: the name Google Meet reports for a call, present for calls created from a
  calendar event and absent for instant calls. Google Calendar calls this the event's title; this
  document says "name" only to tell it apart from the title the extension shows. In the code the
  value is `meetingTitle`, and the browser tab's text it is read from is `meetingTabTitle`.
- **Meet code**: the identifier in the call's address. Always present; the fallback title.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A call that has a name is listed under that name within 10 seconds of joining, with
  no action by the user.
- **SC-002**: A call with no name is listed under its Meet code, 100% of the time.
- **SC-003**: Nowhere in the extension can a meeting's title be edited.
- **SC-004**: No meeting is ever shown with an empty title or with the literal text "Meet".
- **SC-005**: Meetings saved before the change are all still listed with the titles they had.

## Assumptions

- Google Meet reports a call's name in the browser tab's title as "Meet - " followed by the name,
  and reports the call's code in the same place when there is no name. Both were observed on
  2026-10-05 in an English-language browser. Other languages may format the title differently;
  where the form is not recognised the extension falls back to the code.
- The title's form before joining ("Ready to join?") and after the call ends has not been
  observed. The extension accepts a name only while the form is recognised, so an unexpected form
  at those moments leaves the title unchanged.
- The maintainer decided that renaming is removed entirely. An instant call therefore has no label
  other than its code, and a name the user finds unhelpful cannot be changed.
- A meeting that is resumed after this feature, and whose title was typed by hand before it, takes
  Google Meet's name if the call has one.
- The name is the calendar event's title as the user sees it in Google Meet. It can contain other
  people's names, as calendar events often do; it is stored only locally, like the transcript.
- The planned change to the names of downloaded files is a separate feature. The file name
  follows from the title as it does today.
