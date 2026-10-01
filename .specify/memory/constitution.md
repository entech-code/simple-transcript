<!--
Sync Impact Report (remove before committing)
- Version change: none (blank template) → 1.0.0
- Modified principles: none (initial ratification)
- Added sections: Core Principles I–V, Technical Constraints, Development Workflow, Governance
- Removed sections: none
- Follow-up TODOs: none
-->

# Notula for Google Meet Constitution

## Core Principles

### I. Data Stays on the User's Machine

- Meetings, transcripts and settings MUST be stored only in the browser's local extension storage.
- The extension MUST NOT send any data to a remote server.
- The extension MUST NOT record audio or video and MUST NOT join a call as a participant.
  Transcript text comes only from Google Meet's own caption system.
- Analytics, telemetry and remote error reporting are prohibited.

Rationale: the README and the store listing promise users that nothing leaves their browser.
A feature that breaks this promise breaks the product.

### II. Minimal Permissions

- The extension MUST run only on `https://meet.google.com/*`.
- A change that adds a permission or a host permission to `manifest.json` MUST state why no
  existing permission is sufficient, and MUST update the permissions table in `README.md` in the
  same change.
- Remotely hosted code is prohibited; everything the extension executes MUST ship in the package.

Rationale: every added permission triggers a new consent prompt for existing users and a stricter
Chrome Web Store review, and widens what a bug can reach.

### III. Never Break the Call

- Code injected into the Meet page (the `MAIN` world interceptor and the content scripts) MUST
  NOT throw into, block or alter Meet's own behaviour. A failure in the extension MUST leave the
  call working as if the extension were not installed.
- Parsers of Meet's undocumented traffic and DOM MUST treat all input as untrusted: on anything
  unexpected they return nothing and log at debug level; they do not throw.
- Unrecognised channels, message shapes and DOM structures MUST be logged at debug level so the
  next change in Meet can be diagnosed from the console.
- Each observed wire format or DOM dependency MUST be documented in a comment next to the code
  that reads it, stating what was observed.

Rationale: the extension depends on Meet internals that change without notice and differ between
user cohorts. Losing a transcript is a bug; disrupting a meeting is unacceptable.

### IV. Simplicity and Zero Runtime Dependencies

- The shipped bundle MUST have no third-party runtime dependencies. Development dependencies are
  limited to the build and type-checking toolchain.
- Adding any dependency MUST be justified in the feature plan, including why it cannot be written
  in the codebase at reasonable cost.
- All source MUST be TypeScript compiled with `strict` enabled. `any` and non-null assertions
  MUST be limited to boundaries with untyped browser or Meet data.
- Features MUST be built for a present, stated need. Speculative abstractions and configuration
  options nobody has asked for are prohibited.

Rationale: a small, dependency-free bundle is quick to review for the Chrome Web Store, has no
supply-chain exposure, and stays understandable to a small team.

### V. Verified Before Merge

- `npm run typecheck` and `npm run build` MUST pass before a change is merged.
- A change that affects caption capture, speaker attribution, storage or export MUST be verified
  by hand in a live Google Meet call, and the pull request MUST say what was checked.
- The project has no automated test suite today. Logic that does not need a browser (protobuf
  decoding, message parsing, document formatting) MUST be written as pure functions with no DOM
  or `chrome.*` access, so that tests can be added without restructuring.
- When automated tests are introduced, a bug fix in tested code MUST include a test that fails
  without the fix.

Rationale: every push to `main` is released automatically, so the checks before merge are the
only checks there are.

## Technical Constraints

- **Platform**: Chrome extension, Manifest V3, with a module service worker.
- **Language and build**: TypeScript targeting ES2022, bundled with Rollup into `dist/`.
- **Package manager**: npm.
- **Script worlds**: the interceptor runs in the page's `MAIN` world and has no access to
  `chrome.*` APIs; content scripts run in the `ISOLATED` world. They communicate only through
  `window.postMessage` messages tagged with `MESSAGE_SOURCE`, and the content bridge relays them
  to the service worker.
- **Shared values**: channel names, message types and timing constants live in `src/utils/` and
  MUST NOT be duplicated as literals, except where a script cannot import them.
- **Storage**: persisted data shapes are a compatibility contract. A change to a stored shape
  MUST keep existing users' meetings readable, by migration or by tolerant reading.
- **Versioning**: the release version is assigned by the release workflow. The `version` field in
  `manifest.json` MUST NOT be edited by hand as part of a feature.

## Development Workflow

- All changes reach `main` through a pull request from a branch. Direct commits to `main` are
  prohibited, because a push to `main` that touches anything other than top-level Markdown files
  tags a version and publishes a release.
- Branches are named by type: `feat/`, `fix/`, `chore/`, `docs/` or `refactor/`, followed by a
  short kebab-case description.
- A pull request MUST contain one logical change. Formatting-only edits MUST NOT be mixed with
  behaviour changes, and new code MUST match the style of the file it is in.
- A pull request description MUST state what changed, why, and how it was verified, and MUST call
  out any change to permissions, stored data shapes or user-visible behaviour.
- Features large enough to need a specification follow the Spec Kit sequence: specify, plan,
  tasks, implement. Small fixes do not require a specification.

## Governance

- This constitution takes precedence over other practices in this repository. Where a plan or a
  pull request conflicts with it, the plan or pull request changes, or the constitution is amended
  first.
- Amendments are made by pull request that edits this file, explains the reason, and updates the
  version and the amendment date.
- Versioning follows semantic versioning: MAJOR for removing or redefining a principle, MINOR for
  adding a principle or section or materially expanding one, PATCH for clarifications and wording.
- Every feature plan MUST include a constitution check, and every pull request review MUST
  confirm compliance. A deviation MUST be recorded in the plan with its justification and the
  simpler alternative that was rejected.

**Version**: 1.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01
