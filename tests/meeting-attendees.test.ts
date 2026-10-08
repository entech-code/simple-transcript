import { describe, expect, it } from 'vitest';
import { attendeesForList, meetingAttendees } from '../src/utils/meeting-attendees';

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

describe('attendeesForList', () => {
  const names = (n: number): string[] => Array.from({ length: n }, (_, i) => `Person ${i + 1}`);

  it.each([0, 1, 3, 4])('names all of %i attendees', (n) => {
    expect(attendeesForList(names(n))).toEqual({ shown: names(n), hidden: [] });
  });

  it('names the first three of five and leaves two to "+2 more"', () => {
    expect(attendeesForList(names(5))).toEqual({
      shown: ['Person 1', 'Person 2', 'Person 3'],
      hidden: ['Person 4', 'Person 5'],
    });
  });

  it('names the first three of twelve, in the order they joined', () => {
    const { shown, hidden } = attendeesForList(names(12));
    expect(shown).toEqual(['Person 1', 'Person 2', 'Person 3']);
    expect(hidden).toHaveLength(9);
    expect(hidden[0]).toBe('Person 4');
  });
});
