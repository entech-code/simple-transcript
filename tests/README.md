# Tests

Unit tests for the parts of the extension that do not need a browser: decoding Google Meet's
binary messages, reading captions from them, exporting transcripts and naming exported files.

## Running

Needs Node 24.21 or later.

```bash
npm install
npm test
```

| Command                                       | What it does                                                |
| --------------------------------------------- | ----------------------------------------------------------- |
| `npm test`                                    | Runs every test once                                        |
| `npx vitest`                                  | Watch mode: re-runs the affected tests when a file is saved |
| `npx vitest run tests/caption-parser.test.ts` | Runs one file                                               |
| `npx vitest run -t "Cyrillic"`                | Runs the tests whose name matches                           |

`npm run typecheck` also type-checks this folder.

## What is covered

| File                        | Covers                                                       |
| --------------------------- | ------------------------------------------------------------ |
| `protobuf-decoder.test.ts`  | `decodeProtobuf`, `decodeProtobufRaw`, `extractAllStrings`   |
| `caption-parser.test.ts`    | Captions from the `captions` channel                         |
| `malformed-input.test.ts`   | Every parser returns nothing, and never throws, on bad input |
| `transcript-export.test.ts` | Markdown, text, JSON, SRT and VTT exports                    |
| `export-filename.test.ts`   | The name of a downloaded transcript                          |

Not covered yet: the content of `captions_v2`, participant and chat messages. Messages built from
the structures documented in the code are not read by those parsers, because the decoder's
text-or-nested guess depends on bytes that real Meet traffic carries and the comments do not
describe. These tests need the shape of a real message first.

Not covered by design: anything that needs a browser or a live call (the popups, storage, live
connections). Those are checked by hand.

## How the tests stay the same on every machine

- The time zone is fixed to UTC in `vitest.config.mts`.
- `transcript-export.test.ts` forces the `en-US` locale for dates and times, because the export
  code uses the machine's locale.

## Sample messages

Samples live in `helpers/samples.ts` and are built in code with `helpers/proto-builder.ts`, which
writes numbers, text and nested messages in the same wire format Meet uses.

**Every name, sentence and identifier in a sample must be invented.** Nothing recorded from a real
call goes into this repository as it was captured.

### Adding a sample built by hand

1. Find the message structure in the comment above the parser in
   `src/utils/rtc-message-parser.ts`.
2. Add a function or constant to `helpers/samples.ts` that builds the message with `nested`,
   `text` and `varint`, using invented content.
3. Add a test that passes it to the parser and states the expected result.

### Adding a sample from a real message

When Meet changes a format or captions stop arriving, a real message is the only reliable
reference.

1. Capture the raw bytes of one message from the browser console during a call.
2. Decode it and note its structure: which field numbers are present, at which depth, and of which
   kind (number, text, nested). Keep the numbers that are not personal, such as revision counters.
3. Rebuild the same structure in `helpers/samples.ts`, replacing every piece of content:
   - participant names with invented names;
   - spoken text with an invented sentence of similar length and script;
   - device paths with `spaces/<made-up id>/devices/<n>`;
   - meeting codes and any other identifier with made-up values.
4. Do not commit the captured bytes themselves.
5. Add a test with the expected result, and update the structure comment in
   `rtc-message-parser.ts` if the real message differs from it.
