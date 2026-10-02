import { describe, expect, it } from 'vitest';
import { decodeProtobuf, decodeProtobufRaw, extractAllStrings } from '../src/utils/protobuf-decoder';
import { bytes, fixed32, fixed64, message, nested, text, varint } from './helpers/proto-builder';

const utf8 = (s: string): Uint8Array => new TextEncoder().encode(s);

describe('decodeProtobuf', () => {
  it('reads a one-byte number', () => {
    expect(decodeProtobuf(varint(1, 7))).toEqual([{ fieldNumber: 1, wireType: 0, value: 7 }]);
  });

  it('reads a multi-byte number', () => {
    expect(decodeProtobuf(varint(2, 482_913))).toEqual([{ fieldNumber: 2, wireType: 0, value: 482_913 }]);
  });

  it('keeps a number too large for a JavaScript number as a bigint', () => {
    const big = 2n ** 60n;
    expect(decodeProtobuf(varint(3, big))).toEqual([{ fieldNumber: 3, wireType: 0, value: big }]);
  });

  it('reads fixed-width numbers', () => {
    expect(decodeProtobuf(message(fixed32(4, 0xdeadbeef), fixed64(5, 0x0102030405060708n)))).toEqual([
      { fieldNumber: 4, wireType: 5, value: 0xdeadbeef },
      { fieldNumber: 5, wireType: 1, value: 0x0102030405060708n },
    ]);
  });

  it('reads text as a string', () => {
    expect(decodeProtobuf(text(6, 'Hello everyone'))).toEqual([{ fieldNumber: 6, wireType: 2, value: 'Hello everyone' }]);
  });

  it('reads non-Latin text without corrupting it', () => {
    const [field] = decodeProtobuf(text(6, 'Привет всем — おはよう'));
    expect(field.value).toBe('Привет всем — おはよう');
  });

  it('reads fields in order and keeps field numbers above 15', () => {
    const fields = decodeProtobuf(message(varint(1, 1), text(20, 'twenty'), varint(300, 2)));
    expect(fields.map(f => f.fieldNumber)).toEqual([1, 20, 300]);
  });

  it('reads a nested message that is not valid text as its fields', () => {
    const data = nested(1, text(1, 'device'), varint(2, 482_913));
    expect(decodeProtobuf(data)).toEqual([
      {
        fieldNumber: 1,
        wireType: 2,
        value: [
          { fieldNumber: 1, wireType: 2, value: 'device' },
          { fieldNumber: 2, wireType: 0, value: 482_913 },
        ],
      },
    ]);
  });

  it('reads nested messages several levels deep', () => {
    const data = nested(1, nested(1, nested(1, text(1, 'deep'), varint(2, 482_913))));
    const level1 = decodeProtobuf(data)[0].value;
    expect(Array.isArray(level1)).toBe(true);
    const strings = extractAllStrings(decodeProtobuf(data));
    expect(strings).toEqual([{ fieldNumber: 1, value: 'deep' }]);
  });

  // The guess decodeProtobufRaw exists to avoid: a nested message made almost
  // entirely of printable text is indistinguishable from a string.
  it('returns a nested message that is mostly printable text as one string', () => {
    const inner = message(text(3, 'Thanks for joining, let us get started.'), text(4, 'en-US'));
    const [field] = decodeProtobuf(bytes(1, inner));
    expect(typeof field.value).toBe('string');
  });

  it('returns an empty length-delimited field as empty bytes', () => {
    const [field] = decodeProtobuf(bytes(1, new Uint8Array(0)));
    expect(field.value).toBeInstanceOf(Uint8Array);
    expect(field.value).toHaveLength(0);
  });

  it('returns content that is neither text nor a message as bytes', () => {
    const raw = Uint8Array.from([0xff, 0xff, 0xff]);
    const [field] = decodeProtobuf(bytes(1, raw));
    expect(field.value).toEqual(raw);
  });

  it('returns no fields for empty input', () => {
    expect(decodeProtobuf(new Uint8Array(0))).toEqual([]);
  });

  it('stops at an unknown wire type and keeps the fields before it', () => {
    const data = message(varint(1, 7), Uint8Array.from([0x13]), varint(2, 8));
    expect(decodeProtobuf(data)).toEqual([{ fieldNumber: 1, wireType: 0, value: 7 }]);
  });

  it('stops at field number zero', () => {
    const data = message(varint(1, 7), Uint8Array.from([0x00, 0x01]));
    expect(decodeProtobuf(data)).toEqual([{ fieldNumber: 1, wireType: 0, value: 7 }]);
  });

  it.each([
    ['a tag with no value', Uint8Array.from([0x08])],
    ['a number that never ends', Uint8Array.from([0x08, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])],
    ['a length longer than the data', Uint8Array.from([0x0a, 0x64, 0x01, 0x02])],
    ['a fixed32 with too few bytes', Uint8Array.from([0x0d, 0x01, 0x02])],
    ['a fixed64 with too few bytes', Uint8Array.from([0x09, 0x01, 0x02, 0x03])],
  ])('does not throw on %s', (_name, data) => {
    expect(() => decodeProtobuf(data)).not.toThrow();
  });

  it('keeps the fields read before the data is cut off', () => {
    const data = message(varint(1, 7), Uint8Array.from([0x10]));
    expect(decodeProtobuf(data)).toEqual([{ fieldNumber: 1, wireType: 0, value: 7 }]);
  });
});

describe('decodeProtobufRaw', () => {
  it('reads numbers the same way as decodeProtobuf', () => {
    const data = message(varint(1, 7), varint(2, 482_913), fixed32(4, 9), fixed64(5, 10n));
    expect(decodeProtobufRaw(data)).toEqual([
      { fieldNumber: 1, wireType: 0, value: 7 },
      { fieldNumber: 2, wireType: 0, value: 482_913 },
      { fieldNumber: 4, wireType: 5, value: 9 },
      { fieldNumber: 5, wireType: 1, value: 10n },
    ]);
  });

  it('returns text as raw bytes without guessing', () => {
    const [field] = decodeProtobufRaw(text(3, 'Hello everyone'));
    expect(field.value).toEqual(utf8('Hello everyone'));
  });

  it('returns a nested message as raw bytes without guessing', () => {
    const inner = message(text(3, 'Thanks for joining, let us get started.'), text(4, 'en-US'));
    const [field] = decodeProtobufRaw(bytes(1, inner));
    expect(field.value).toEqual(inner);
  });

  it('lets the caller decode a mostly-text nested message that decodeProtobuf flattens', () => {
    const inner = message(text(3, 'Thanks for joining, let us get started.'), text(4, 'en-US'));
    const [outer] = decodeProtobufRaw(bytes(1, inner));
    const fields = decodeProtobufRaw(outer.value as Uint8Array);
    expect(fields.map(f => f.fieldNumber)).toEqual([3, 4]);
    expect(fields[0].value).toEqual(utf8('Thanks for joining, let us get started.'));
  });

  it('returns no fields for empty input', () => {
    expect(decodeProtobufRaw(new Uint8Array(0))).toEqual([]);
  });

  it('keeps the fields read before a length that is longer than the data', () => {
    const data = message(varint(1, 7), Uint8Array.from([0x12, 0x64, 0x01]));
    expect(decodeProtobufRaw(data)).toEqual([{ fieldNumber: 1, wireType: 0, value: 7 }]);
  });

  it.each([
    ['a tag with no value', Uint8Array.from([0x08])],
    ['a number that never ends', Uint8Array.from([0x08, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])],
    ['an unknown wire type', Uint8Array.from([0x13, 0x01])],
    ['a fixed64 with too few bytes', Uint8Array.from([0x09, 0x01, 0x02, 0x03])],
  ])('does not throw on %s', (_name, data) => {
    expect(() => decodeProtobufRaw(data)).not.toThrow();
  });
});

describe('extractAllStrings', () => {
  it('collects strings from every level with their field numbers', () => {
    const data = message(text(1, 'top'), nested(2, text(3, 'inner'), varint(4, 482_913)));
    expect(extractAllStrings(decodeProtobuf(data))).toEqual([
      { fieldNumber: 1, value: 'top' },
      { fieldNumber: 3, value: 'inner' },
    ]);
  });

  it('returns nothing when there are no strings', () => {
    expect(extractAllStrings(decodeProtobuf(varint(1, 7)))).toEqual([]);
  });
});
