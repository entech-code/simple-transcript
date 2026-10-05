# Research: Rebrand to Simple Transcript and Remove Notula

No items in the Technical Context were left as NEEDS CLARIFICATION. The decisions below record the
choices made and what was rejected.

## 1. How the Notula integration is wired in

Findings from the code:

- Five files exist only for Notula: `src/utils/notula.ts`, `notula-state.ts`, `notula-ui.ts`,
  `src/background/notula-sync.ts` and `src/utils/meeting-document.ts`. The last is imported only
  by `notula-sync.ts`.
- Four files call into them: `service-worker.ts` (15 references), `floating-popup.ts` (50),
  `popup.ts` (33) and `popup.html` (5).
- The interceptor, caption observer, content bridge, the stores, `types.ts` and `constants.ts`
  contain no Notula reference.
- The only network call in `src/` is `fetch` to `http://127.0.0.1:<port>/v1` in `notula.ts`.
- The manifest declares no permission for it, so no permission can be dropped.
- No test references the Notula code.

## 2. Remove outright, not hide behind a switch

- **Decision**: delete the modules and every call into them.
- **Rationale**: the spec requires the feature gone, and the constitution prefers less code. A
  disabled feature would keep the network code in the bundle and contradict "makes no network
  requests".
- **Alternatives considered**: a build-time flag or a hidden setting; rejected as speculative
  configuration nobody asked for.

## 3. Leftover Notula data in storage

- **Decision**: leave the four keys (`notula`, `notulaMeetings`, `notulaFolders`,
  `notulaNotices`) in place and never read them.
- **Rationale**: they are small, harmless and invisible. Not touching storage on update carries
  no risk to saved meetings (FR-007), and a user who goes back to the Notula build keeps their
  pairing.
- **Alternatives considered**: deleting the keys on update. Cleaner, but it adds migration code
  that runs once per user and can never be tested again afterwards. Noted as a possible later
  clean-up.

## 4. Names

- **Decision**: `name` is "Simple Transcript: Copy & Save for Google Meet" (46 characters);
  `short_name` and all in-extension titles are "Simple Transcript".
- **Rationale**: the full name is what the store searches and what the extensions list shows.
  Chrome allows 75 characters for `name` and recommends 12 or fewer for `short_name`, using it
  where space is limited; "Simple Transcript" is 17, which Chrome accepts and truncates only in
  the tightest spots. The panel title also carries the meeting name, so the long name would not
  fit there.
- **Alternatives considered**: the full name in every title; rejected for the truncation it
  causes in the panel and popup headers.

## 5. Internal names

- **Decision**: keep `MESSAGE_SOURCE = 'meetscribe'`, the `[MeetTranscript]` log prefixes and all
  storage keys. Rename the package in `package.json` from `meetscribe` to `simple-transcript`.
- **Rationale**: none of the kept names is visible to users, and `MESSAGE_SOURCE` and the storage
  keys are compatibility contracts between scripts and with stored data. The package name is
  different: only npm reads it (script output and the lockfile), and the package is private, so
  renaming it is safe and makes the project consistent with the repository name.
- **Alternatives considered**: renaming everything for consistency; rejected for the names that
  scripts or stored data depend on, as risk without visible benefit.

## 6. Website pages, store material and screenshot tooling

- **Decision**: swap the name, delete passages and links about Notula, change nothing else.
  Remove the Notula-only screenshots and the script steps that produce them; do not re-run the
  tooling.
- **Rationale**: decided in the spec (FR-010). A plain search-and-replace would leave sentences
  describing a feature that no longer exists, so those passages are deleted. Screenshots of
  removed screens cannot be regenerated and would mislead.
- **Alternatives considered**: a full rewrite now (deferred to its own todo item, after the UI is
  final), or deleting the material (rejected by the maintainer).

## 7. Constitution amendment

- **Decision**: version 1.0.0 → 1.1.0. The title becomes "Simple Transcript Constitution", and
  principle I gains the rule that the extension makes no network requests of any kind.
- **Rationale**: the rule is new, stricter guidance, which the constitution's own versioning
  policy treats as a minor change. The title change alone would be a patch.
- **Alternatives considered**: leaving the constitution for a separate change; rejected because
  FR-012 requires it and the code change is what makes the stricter rule true.

## 8. Verifying the removal

- **Decision**: verify with repository searches and a live call, not with new automated tests.
- **Rationale**: the facts to check are "no file mentions Notula" and "no source file makes a
  network call", which a search answers exactly. A test doing the same would need file-system
  access from the test code, and with it a new development dependency for its types.
- **Alternatives considered**: a test that scans `src/`; rejected for the dependency. The
  searches are listed as steps in `quickstart.md`.
