# Research: Automated Unit Tests for Browser-Free Logic

No items in the Technical Context were left as NEEDS CLARIFICATION. The decisions below record the
choices made and what was rejected.

## 1. Test runner

- **Decision**: Vitest 5, as a development dependency, run with `npm test` (`vitest run`).
- **Rationale**: it runs TypeScript and ES modules directly with no build step or extra
  configuration, which matches the project's `module: ES2022` setup. It is a development tool
  only, so the constitution's zero-runtime-dependency rule is unaffected. Writing a test harness
  in the codebase instead would cost more than the dependency and give worse failure output.
- **Alternatives considered**:
  - *Node's built-in test runner*: adds no dependency, but needs a separate TypeScript loader or a
    compile step, and its expected-versus-actual output is weaker.
  - *Jest*: needs extra configuration for TypeScript and ES modules.

## 2. Node version

- **Decision**: run tests on Node 22; change the release workflow from Node 20 to Node 22.
- **Rationale**: Vitest 5 requires Node 22.12 or later. The local machine already has Node 22.
  The build output does not depend on the Node version.
- **Alternatives considered**: pinning an older Vitest major that supports Node 20; rejected
  because Node 20 has reached end of life.

## 3. Where sample messages come from

- **Decision**: build sample messages in test code with a small test-only builder, using invented
  content and the message structures documented in comments in `rtc-message-parser.ts`.
- **Rationale**: decided in the spec (FR-006): no real names, speech or meeting identifiers enter
  the repository. Building messages in code also makes each sample readable, because the fields
  are named where they are written.
- **Known limit**: the tests confirm the code against its documented understanding of Meet's
  formats. They catch regressions when the code changes, but cannot detect Meet changing a format.
  Real recorded messages will be added, with private content removed, when a failure is reported.
- **Alternatives considered**:
  - *Recorded binary files*: closest to reality, but contain private content and are opaque to
    read in review.
  - *Reusing the production encoder*: rejected, because the tests would then check the code
    against itself, and the encoder's helpers are not exported.

## 4. Time zone and locale in export tests

- **Decision**: fix the time zone to UTC for the test run and force the `en-US` locale for the
  date and time formatting calls inside the tests. Do not change production code.
- **Rationale**: the export formatters call `toLocaleTimeString` and `toLocaleDateString` with the
  machine's default locale, so output differs between machines. Fixing both in the test run makes
  expected output exact and repeatable while leaving user-visible behaviour untouched (FR-009).
- **Alternatives considered**:
  - *Passing a locale into the formatters*: cleaner, but changes production signatures; better
    done as part of the planned file-naming and export work.
  - *Loose assertions with patterns*: would miss real regressions in the output.

## 5. Export file naming

- **Decision**: move the file-name logic out of the two `download()` functions into one pure
  function in `src/utils/export-filename.ts`, and have both call it.
- **Rationale**: the logic is duplicated in `floating-popup.ts` and `popup.ts`, inside functions
  that need a browser, so it cannot be tested where it is. The spec allows moving logic when
  behaviour is unchanged (FR-009). The extraction also gives the planned file-naming feature a
  single place to change.
- **Alternatives considered**: testing the popups with a simulated browser; rejected as far
  heavier than the logic warrants.

## 6. Type checking of tests

- **Decision**: add `tsconfig.test.json`, which extends the main configuration and includes
  `tests/`, and run it as part of `npm run typecheck`.
- **Rationale**: the main `tsconfig.json` has `rootDir: src` and is used by the Rollup build, so
  adding `tests/` to it would affect the build. A second configuration keeps the build untouched
  while holding test code to the same strict settings.
- **Alternatives considered**: not type-checking tests; rejected because the constitution requires
  strict TypeScript for all source.

## 7. Release gate

- **Decision**: add a `npm test` step to `.github/workflows/release.yml` directly after Typecheck
  and before Build.
- **Rationale**: a failing step stops the job, so no package is built or published (FR-008).
- **Note**: workflows are currently disabled on this fork. Enabling them is a repository setting
  outside this feature.
