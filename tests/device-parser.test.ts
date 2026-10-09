import { describe, expect, it } from 'vitest';
import { decodeProtobuf } from '../src/utils/protobuf-decoder';
import { parseDeviceCollection, parseDeviceInfo } from '../src/utils/rtc-message-parser';
import { undoubledName } from '../src/utils/meeting-attendees';
import { nested, text, varint } from './helpers/proto-builder';

// Meet's participant list as seen in a call on 2026-10-08: an entry for the
// room itself, named with the meeting code, next to the participants' devices.
const ROOM = 'spaces/AbCdEfGhIj';
// A number of realistic size in each entry: the decoder only takes a block for
// a nested message when it is not valid text.
const STAMP = varint(3, 1_700_000_000_000);
const roomEntry = nested(1, text(1, ROOM), text(2, 'qtr-lpzd-fga'), STAMP);
const device = (n: number, name: string): Uint8Array => nested(1, text(1, `${ROOM}/devices/${n}`), text(2, name), STAMP);

describe('parseDeviceCollection', () => {
  it('lists the participants and leaves out the room entry', () => {
    const list = nested(1, roomEntry, device(355, 'Dana Whitfield'), device(356, 'Tomás Herrera'));
    expect(parseDeviceCollection(list)).toEqual([
      { deviceId: `@${ROOM}/devices/355`, deviceName: 'Dana Whitfield' },
      { deviceId: `@${ROOM}/devices/356`, deviceName: 'Tomás Herrera' },
    ]);
  });

  it('finds no one when only the room entry is there', () => {
    expect(parseDeviceCollection(nested(1, roomEntry))).toEqual([]);
  });
});

describe('parseDeviceInfo', () => {
  it('reads a participant', () => {
    expect(parseDeviceInfo(nested(1, device(355, 'Dana Whitfield')))).toEqual({
      deviceId: `@${ROOM}/devices/355`,
      deviceName: 'Dana Whitfield',
    });
  });

  it('does not take the room entry for a participant', () => {
    expect(parseDeviceInfo(nested(1, roomEntry))).toBeNull();
  });

  it('skips the room entry to reach the participant after it', () => {
    expect(parseDeviceInfo(nested(1, roomEntry, device(355, 'Dana Whitfield')))?.deviceName).toBe('Dana Whitfield');
  });
});

// Seen in a call on 2026-10-09: Meet sends a participant's caption language in
// the place where the name would be, as a nested message. Holding only short
// text, it reads as text with its two framing bytes in front.
describe('a language setting is not a name', () => {
  const language = nested(2, text(1, 'en-US'));
  const path = (n: number): string => `${ROOM}/devices/${n}`;

  it('reads the nested language as text, framing bytes included', () => {
    // This is the misreading the rules below guard against; if the decoder
    // stops doing it, these samples no longer exercise them.
    const fields = decodeProtobuf(nested(1, text(1, path(237)), language, STAMP));
    const entry = fields[0].value as Array<{ fieldNumber: number; value: unknown }>;
    // A line feed (10) and the length (5): the bytes that frame the text inside the nested message.
    expect(entry.find((f) => f.fieldNumber === 2)?.value).toBe(String.fromCharCode(10, 5) + 'en-US');
  });

  it('does not rename a device from an update that carries its language', () => {
    const update = nested(1, text(1, path(237)), language, STAMP);
    expect(parseDeviceInfo(update)).toBeNull();
    expect(parseDeviceCollection(update)).toEqual([]);
  });

  it('does not invent a participant from a message about several devices', () => {
    const group = nested(1, nested(1, text(1, path(235)), text(1, path(236)), text(1, path(237))), language, STAMP);
    expect(parseDeviceInfo(group)).toBeNull();
    expect(parseDeviceCollection(group)).toEqual([]);
  });

  it('still reads the participants sent alongside it', () => {
    const list = nested(1, device(235, 'Priya Raman'), nested(1, text(1, path(237)), language, STAMP), device(237, 'Tomás Herrera'));
    expect(parseDeviceCollection(list).map((d) => d.deviceName)).toEqual(['Priya Raman', 'Tomás Herrera']);
  });

  it.each(['en-US', 'pt-BR', 'es-419', 'zh-Hans'])('does not take the plain language tag %s for a name', (tag) => {
    expect(parseDeviceInfo(nested(1, nested(1, text(1, path(237)), text(2, tag), STAMP)))).toBeNull();
  });

  it.each(['Li', 'Bo Chen', 'Jean-Luc Moreau', 'jo-ann', 'Mary-Jo'])('keeps the name %s', (name) => {
    expect(parseDeviceInfo(nested(1, device(240, name)))?.deviceName).toBe(name);
  });
});

describe('undoubledName', () => {
  it('halves a name the page held twice', () => {
    expect(undoubledName('Dana WhitfieldDana Whitfield')).toBe('Dana Whitfield');
  });

  it.each(['Dana Whitfield', 'Ana', 'Lili', 'Dana Whitfield Dana'])('leaves %s as it is', (name) => {
    expect(undoubledName(name)).toBe(name);
  });

  it('trims spaces', () => {
    expect(undoubledName('  Dana Whitfield ')).toBe('Dana Whitfield');
  });
});
