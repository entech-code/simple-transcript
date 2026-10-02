/**
 * Test-only builder for protobuf wire-format messages. Written independently
 * of src/utils/protobuf-encoder.ts so the decoder is not tested against the
 * project's own encoder.
 */

const WIRE_VARINT = 0;
const WIRE_FIXED64 = 1;
const WIRE_LENGTH_DELIMITED = 2;
const WIRE_FIXED32 = 5;

const textEncoder = new TextEncoder();

function rawVarint(value: number | bigint): number[] {
  let v = BigInt(value);
  const out: number[] = [];
  do {
    let byte = Number(v & 0x7fn);
    v >>= 7n;
    if (v > 0n) byte |= 0x80;
    out.push(byte);
  } while (v > 0n);
  return out;
}

function tag(fieldNumber: number, wireType: number): number[] {
  return rawVarint((fieldNumber << 3) | wireType);
}

/** Joins encoded fields into one message. */
export function message(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((sum, p) => sum + p.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function varint(fieldNumber: number, value: number | bigint): Uint8Array {
  return Uint8Array.from([...tag(fieldNumber, WIRE_VARINT), ...rawVarint(value)]);
}

export function bytes(fieldNumber: number, value: Uint8Array): Uint8Array {
  return Uint8Array.from([...tag(fieldNumber, WIRE_LENGTH_DELIMITED), ...rawVarint(value.length), ...value]);
}

export function text(fieldNumber: number, value: string): Uint8Array {
  return bytes(fieldNumber, textEncoder.encode(value));
}

/** A length-delimited field whose content is itself a message. */
export function nested(fieldNumber: number, ...parts: Uint8Array[]): Uint8Array {
  return bytes(fieldNumber, message(...parts));
}

export function fixed32(fieldNumber: number, value: number): Uint8Array {
  const out = new Uint8Array(tag(fieldNumber, WIRE_FIXED32).length + 4);
  out.set(tag(fieldNumber, WIRE_FIXED32));
  new DataView(out.buffer).setUint32(out.length - 4, value, true);
  return out;
}

export function fixed64(fieldNumber: number, value: bigint): Uint8Array {
  const out = new Uint8Array(tag(fieldNumber, WIRE_FIXED64).length + 8);
  out.set(tag(fieldNumber, WIRE_FIXED64));
  new DataView(out.buffer).setBigUint64(out.length - 8, value, true);
  return out;
}
