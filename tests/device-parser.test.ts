import { describe, expect, it } from 'vitest';
import { parseDeviceCollection, parseDeviceInfo } from '../src/utils/rtc-message-parser';
import { undoubledName } from '../src/utils/meeting-attendees';
import { nested, text, varint } from './helpers/proto-builder';

// Meet's participant list as seen in a call on 2026-10-08: an entry for the
// room itself, named with the meeting code, next to the participants' devices.
const ROOM = 'spaces/3Gweibc4XcoB';
// A number of realistic size in each entry: the decoder only takes a block for
// a nested message when it is not valid text.
const STAMP = varint(3, 1_700_000_000_000);
const roomEntry = nested(1, text(1, ROOM), text(2, 'tem-bhsy-bdv'), STAMP);
const device = (n: number, name: string): Uint8Array => nested(1, text(1, `${ROOM}/devices/${n}`), text(2, name), STAMP);

describe('parseDeviceCollection', () => {
  it('lists the participants and leaves out the room entry', () => {
    const list = nested(1, roomEntry, device(355, 'Eric Popivker'), device(356, 'Alex Netrebskiy'));
    expect(parseDeviceCollection(list)).toEqual([
      { deviceId: `@${ROOM}/devices/355`, deviceName: 'Eric Popivker' },
      { deviceId: `@${ROOM}/devices/356`, deviceName: 'Alex Netrebskiy' },
    ]);
  });

  it('finds no one when only the room entry is there', () => {
    expect(parseDeviceCollection(nested(1, roomEntry))).toEqual([]);
  });
});

describe('parseDeviceInfo', () => {
  it('reads a participant', () => {
    expect(parseDeviceInfo(nested(1, device(355, 'Eric Popivker')))).toEqual({
      deviceId: `@${ROOM}/devices/355`,
      deviceName: 'Eric Popivker',
    });
  });

  it('does not take the room entry for a participant', () => {
    expect(parseDeviceInfo(nested(1, roomEntry))).toBeNull();
  });

  it('skips the room entry to reach the participant after it', () => {
    expect(parseDeviceInfo(nested(1, roomEntry, device(355, 'Eric Popivker')))?.deviceName).toBe('Eric Popivker');
  });
});

describe('undoubledName', () => {
  it('halves a name the page held twice', () => {
    expect(undoubledName('Eric PopivkerEric Popivker')).toBe('Eric Popivker');
  });

  it.each(['Eric Popivker', 'Ana', 'Lili', 'Dana Whitfield Dana'])('leaves %s as it is', (name) => {
    expect(undoubledName(name)).toBe(name);
  });

  it('trims spaces', () => {
    expect(undoubledName('  Eric Popivker ')).toBe('Eric Popivker');
  });
});
