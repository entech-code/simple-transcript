# Feature Specification: Automated Unit Tests for Browser-Free Logic

**Feature Branch**: `feat/unit-tests`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: "Add automated unit tests for the logic that does not need a browser: protobuf decoding, caption parsing for both the `captions` and `captions_v2` channels, transcript export formats and file naming. Tests use captured Google Meet payloads as fixtures, so a change in Meet's message format or a regression in export output is caught before a release is published."

## User Scenarios & Testing *(mandatory)*

The users of this feature are the people who maintain the extension. End users of the extension
see no change; they benefit indirectly, because a broken build is caught before it reaches them.

### User Story 1 - Caption parsing is checked automatically (Priority: P1)

A maintainer changes the code that reads Google Meet's caption messages, or any code it relies on.
Before the change is merged, they run one command and learn within seconds whether captions from
both of Meet's caption channels (`captions` and `captions_v2`) are still read correctly.

**Why this priority**: Caption parsing is the core of the product and the part most exposed to
breakage. The `captions_v2` problem meant some users captured no transcript at all, and nothing
but a live call could reveal it. This story alone delivers a usable safety net.

**Independent Test**: Run the test command on an unmodified checkout and see every caption test
pass; then deliberately break the caption parsing and see at least one test fail with a message
naming what was expected.

**Acceptance Scenarios**:

1. **Given** a sample message for the `captions` channel, **When** the tests run, **Then** they
   confirm the message yields the expected speaker device, message identity, revision number and
   caption text.
2. **Given** a sample message for the `captions_v2` channel, **When** the tests run, **Then**
   they confirm the same fields are read correctly from that channel's different layout.
3. **Given** a message that is empty, truncated or not a caption at all, **When** it is parsed,
   **Then** the tests confirm the result is "no caption" and that no error is raised.

---

### User Story 2 - Exported transcripts are checked automatically (Priority: P2)

A maintainer changes how transcripts are exported or how exported files are named. They run the
same command and learn whether every export format still produces exactly the expected output for
a known sample meeting.

**Why this priority**: Exports are what users keep. A regression here silently corrupts files
people rely on, but it is less likely than a caption break because it does not depend on Google
Meet's internals.

**Independent Test**: Run the test command and see each export format compared against a stored
expected output for a sample transcript; change one format's output and see only that format's
test fail.

**Acceptance Scenarios**:

1. **Given** a sample transcript with several speakers, **When** it is exported as Markdown, plain
   text, JSON, SRT and VTT, **Then** the tests confirm each output matches the expected content
   for that format.
2. **Given** a meeting with a title and a start time, **When** a file name is produced for it,
   **Then** the tests confirm the name follows the current naming rule, including when the title
   contains characters that are invalid in file names.

---

### Edge Cases

- A message that is empty, cut off part-way through, or of a different kind (participant
  information, chat): it is rejected without an error.
- Caption text in a non-Latin script (for example Cyrillic or Japanese): it is read and exported
  without corruption.
- A transcript with no entries: every export format produces well-formed output.
- Export output containing times: the result is the same regardless of the time zone of the
  machine running the tests.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST provide a single documented command that runs all automated tests
  and reports what failed, with expected versus actual results.
- **FR-002**: The tests MUST run without a web browser, a Google account, network access or a live
  meeting.
- **FR-003**: The tests MUST cover the decoding of Meet's binary messages and caption reading for
  both the `captions` and `captions_v2` channels, each using at least one sample message built to
  the message structure documented in the code. Participant and chat messages are covered where
  their structure is documented.
- **FR-004**: The tests MUST confirm that malformed, truncated, empty or unrelated messages
  produce "no result" and never raise an error.
- **FR-005**: The tests MUST cover every export format the extension offers (Markdown, plain text,
  JSON, SRT and VTT) and the naming of exported files.
- **FR-006**: Sample messages MUST be constructed with invented content. The repository MUST NOT
  contain real participant names, spoken text, meeting codes or meeting identifiers. If a real
  recorded message is added later to reproduce a failure, such content MUST be replaced with
  invented values before it is saved.
- **FR-007**: The project MUST document how to run the tests and how to add a new sample message
  with its expected result, including how to remove private content from it.
- **FR-008**: The release process MUST run the tests and MUST stop without publishing when any
  test fails.
- **FR-009**: Adding the tests MUST NOT change what the extension does for end users or what the
  published package contains. Logic that is mixed with browser-only code MAY be moved so that it
  can be tested, provided its behaviour is unchanged.

### Key Entities

- **Sample message**: one binary message in the layout Google Meet uses, labelled with the channel
  it belongs to and built with invented content. A real recorded message may replace or join it
  later, with private content removed.
- **Sample transcript**: an invented meeting with a title, a start time, several speakers and a
  series of spoken entries, used as the input for export and file-naming tests.
- **Expected result**: what the extension should produce from a given sample, stored alongside it
  so the two are compared on every run.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer can run the complete test suite with one command and get a result in
  under 30 seconds on a typical development machine.
- **SC-002**: Both caption channels are covered: breaking the reading of either one causes at
  least one test to fail. This includes the defect behind the `captions_v2` fix, where caption
  content was flattened into one garbled string.
- **SC-003**: All five export formats are covered: changing the output of any one causes at least
  one test to fail.
- **SC-004**: A review of the stored sample messages finds no real names, spoken text or meeting
  identifiers.

## Assumptions

- End-to-end tests that drive a real Google Meet call are out of scope, as are user-interface
  code, storage and the handling of live connections. Behaviour that needs a live call continues
  to be verified by hand, as the constitution requires.
- The Notes functionality and the Notula integration are scheduled for removal and are not
  covered. Export tests use transcripts without notes.
- File-naming tests describe the naming rule as it is today. The planned change to the naming
  format is a separate feature, which will update these tests.
- Sample messages are constructed from the message structures documented in the code, not
  recorded from live calls, so that no real names or speech enter the repository. The tests
  therefore confirm the code against its documented understanding of Meet's formats; they cannot
  detect a format change by themselves. When a failure is reported in future, the maintainer will
  supply real recorded messages, which are then added as samples with private content removed.
- The automated release process is currently not running on this repository. Enabling it is
  outside this feature; until then the tests are run by hand before a release.
- Tooling added for testing is used only during development, consistent with the constitution's
  rule that the published package has no third-party runtime dependencies.
