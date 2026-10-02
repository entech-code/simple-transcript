/**
 * Sample Meet messages for the parser tests, built to the structures
 * documented in src/utils/rtc-message-parser.ts. Every name, sentence and
 * identifier here is invented — nothing was recorded from a real call.
 */
import { message, nested, text, varint } from './proto-builder';

export const DEVICE_PATH = 'spaces/AbCdEfGhIj/devices/42';

export interface CaptionFields {
  deviceId?: string;
  messageId?: number;
  messageVersion?: number;
  langId?: number;
  text: string;
  /** Meet sometimes carries the text in field 4 or 7 instead of field 6. */
  textField?: number;
}

/**
 * A message from the "captions" channel. The defaults use a message number
 * of realistic size: the decoder only recognises the wrapper as a nested
 * message when it is not valid text, which a multi-byte number guarantees.
 */
export function captionMessage(fields: CaptionFields): Uint8Array {
  const { deviceId = DEVICE_PATH, messageId = 482_913, messageVersion = 3, langId = 1, textField = 6 } = fields;
  return nested(
    1,
    text(1, deviceId),
    varint(2, messageId),
    varint(3, messageVersion),
    varint(5, langId),
    text(textField, fields.text),
  );
}

/** The periodic message the captions channel sends with no caption in it. */
export const keepaliveMessage = message(varint(2, 1));

/** A message from another channel, shaped like a participant update. */
export const unrelatedMessage = nested(
  1,
  nested(1, nested(1, text(1, DEVICE_PATH), text(2, 'Dana Whitfield'), varint(3, 1_700_000_000_000))),
);

export const CYRILLIC_TEXT = 'Привет всем, начинаем встречу';
export const JAPANESE_TEXT = 'おはようございます、会議を始めましょう';

const validCaption = captionMessage({ text: 'Thanks for joining, let us get started.' });

/** Input no parser should accept, and none may throw on. */
export const malformedMessages: Array<{ name: string; data: Uint8Array }> = [
  { name: 'empty', data: new Uint8Array(0) },
  { name: 'cut off part-way through', data: validCaption.slice(0, validCaption.length - 9) },
  { name: 'cut off inside the first tag', data: Uint8Array.from([0x0a]) },
  { name: 'a length longer than the data', data: Uint8Array.from([0x0a, 0x64, 0x01, 0x02, 0x03]) },
  { name: 'a number that never ends', data: Uint8Array.from([0x08, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]) },
  { name: 'arbitrary bytes', data: Uint8Array.from([0xde, 0xad, 0xbe, 0xef, 0x00, 0x13, 0x37, 0xff, 0x80, 0x01]) },
  { name: 'all zero bytes', data: new Uint8Array(16) },
];
