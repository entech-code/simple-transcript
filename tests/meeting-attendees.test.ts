import { describe, expect, it } from 'vitest';
import { meetingAttendees } from '../src/utils/meeting-attendees';

const people = (...names: string[]): Record<string, string> =>
  Object.fromEntries(names.map((name, i) => [`@spaces/x/devices/${i}`, name]));

describe('meetingAttendees', () => {
  it('lists everyone in the order they joined, the user included', () => {
    expect(meetingAttendees({ participants: people('Eric Popivker', 'Alexey Kornakov', 'Niraj Shah') }))
      .toEqual(['Eric Popivker', 'Alexey Kornakov', 'Niraj Shah']);
  });

  it('lists a name once, regardless of spacing, letter case or "(You)"', () => {
    expect(meetingAttendees({ participants: people('Eric Popivker', 'eric  popivker', 'Eric Popivker (You)', 'Alexey Kornakov') }))
      .toEqual(['Eric Popivker', 'Alexey Kornakov']);
  });

  it('leaves out devices whose name was never learned', () => {
    expect(meetingAttendees({ participants: people('@spaces/x/devices/9', 'Alexey Kornakov') })).toEqual(['Alexey Kornakov']);
  });

  it('leaves out a Meet code picked up as a name', () => {
    expect(meetingAttendees({ participants: people('Eric Popivker', 'brd-nnro-hdj') })).toEqual(['Eric Popivker']);
  });

  it('trims spaces around names', () => {
    expect(meetingAttendees({ participants: people('  Alexey Kornakov ') })).toEqual(['Alexey Kornakov']);
  });

  it('is empty without participants', () => {
    expect(meetingAttendees({ participants: {} })).toEqual([]);
    expect(meetingAttendees({})).toEqual([]);
  });
});
