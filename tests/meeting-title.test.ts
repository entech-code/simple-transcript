import { describe, expect, it } from 'vitest';
import { meetingDisplayTitle, meetingFileTitle, meetingTitleFromTabTitle } from '../src/utils/meeting-title';

const CODE = 'kxp-mwrd-tzb';

describe('meetingTitleFromTabTitle', () => {
  // Observed in live calls on 2026-10-05, in an English-language Chrome.
  it('reads the name of a call created from a calendar event', () => {
    expect(meetingTitleFromTabTitle('Meet - Team Daily Meeting', CODE)).toBe('Team Daily Meeting');
  });

  it('finds no name when an instant call shows its own code', () => {
    expect(meetingTitleFromTabTitle('Meet - kxp-mwrd-tzb', CODE)).toBeNull();
  });

  it('compares the code without regard to letter case', () => {
    expect(meetingTitleFromTabTitle('Meet - KXP-MWRD-TZB', CODE)).toBeNull();
  });

  // The code is not always known yet when the title is read.
  it('finds no name in text that has the shape of a Meet code', () => {
    expect(meetingTitleFromTabTitle('Meet - abc-defg-hij', 'unknown')).toBeNull();
  });

  it('keeps a name that merely contains the code', () => {
    expect(meetingTitleFromTabTitle('Meet - Sync (kxp-mwrd-tzb)', CODE)).toBe('Sync (kxp-mwrd-tzb)');
  });

  it('trims spaces around the name', () => {
    expect(meetingTitleFromTabTitle('Meet -   Budget review  ', CODE)).toBe('Budget review');
  });

  it.each([
    ['an en dash', 'Meet – Budget review'],
    ['an em dash', 'Meet — Budget review'],
    ['no spaces around the separator', 'Meet-Budget review'],
  ])('accepts %s as the separator', (_name, title) => {
    expect(meetingTitleFromTabTitle(title, CODE)).toBe('Budget review');
  });

  it('keeps separators inside the name', () => {
    expect(meetingTitleFromTabTitle('Meet - Q3 - Planning', CODE)).toBe('Q3 - Planning');
  });

  it('keeps a name in a non-Latin script', () => {
    expect(meetingTitleFromTabTitle('Meet - Планёрка команды', CODE)).toBe('Планёрка команды');
  });

  it('keeps a name that starts with the word Meet', () => {
    expect(meetingTitleFromTabTitle('Meet - Meet the team', CODE)).toBe('Meet the team');
  });

  it.each([
    ['only the product name', 'Meet'],
    ['a separator with nothing after it', 'Meet - '],
    ['only spaces after the separator', 'Meet -    '],
    ['another page', 'Google Calendar'],
    ['a name without the Meet prefix', 'Team Daily Meeting'],
    ['a word that only starts with Meet', 'Meeting notes - Budget'],
    ['an empty title', ''],
  ])('finds no name in %s', (_name, title) => {
    expect(meetingTitleFromTabTitle(title, CODE)).toBeNull();
  });

  it('finds no name when there is no title', () => {
    expect(meetingTitleFromTabTitle(undefined, CODE)).toBeNull();
  });
});

describe('meetingDisplayTitle', () => {
  it('shows the title from Google Meet', () => {
    expect(meetingDisplayTitle({ title: 'Team Daily Meeting' })).toBe('Team Daily Meeting');
  });

  it.each([
    ['an empty title', ''],
    ['a title of spaces only', '   '],
  ])('calls a meeting with %s "Untitled meeting"', (_name, title) => {
    expect(meetingDisplayTitle({ title })).toBe('Untitled meeting');
  });
});

describe('meetingFileTitle', () => {
  const ME = 'Dana Whitfield';
  const people = (...names: string[]): Record<string, string> =>
    Object.fromEntries(names.map((name, i) => [`@spaces/x/devices/${i}`, name]));

  it('uses the title from Google Meet', () => {
    expect(meetingFileTitle({ title: 'Team Daily Meeting', participants: people(ME, 'Marcus Oyelaran'), selfName: ME })).toBe('Team Daily Meeting');
  });

  it.each([
    ['the user alone', [ME], 'Untitled meeting'],
    ['no one', [], 'Untitled meeting'],
    ['one other attendee', [ME, 'Marcus Oyelaran'], 'Meeting with Marcus Oyelaran'],
    ['two others', [ME, 'Marcus Oyelaran', 'Priya Raman'], 'Meeting with Marcus Oyelaran and Priya Raman'],
    ['three others', ['Marcus Oyelaran', ME, 'Priya Raman', 'Ana Lima'], 'Meeting with Marcus Oyelaran, Priya Raman and 1 other'],
    ['six others', [ME, 'A One', 'B Two', 'C Three', 'D Four', 'E Five', 'F Six'], 'Meeting with A One, B Two and 4 others'],
  ])('names an untitled meeting with %s', (_case, names, expected) => {
    expect(meetingFileTitle({ title: '', participants: people(...names), selfName: ME })).toBe(expected);
  });

  it('leaves out the user regardless of spacing, letter case or "(You)"', () => {
    for (const self of ['dana whitfield', '  Dana   Whitfield ', 'Dana Whitfield (You)']) {
      expect(meetingFileTitle({ title: '', participants: people(self, 'Marcus Oyelaran'), selfName: ME })).toBe('Meeting with Marcus Oyelaran');
    }
  });

  it('counts an attendee listed twice once', () => {
    expect(meetingFileTitle({ title: '', participants: people(ME, 'Marcus Oyelaran', 'Marcus Oyelaran'), selfName: ME })).toBe('Meeting with Marcus Oyelaran');
  });

  it('skips devices whose name was never learned', () => {
    expect(meetingFileTitle({ title: '', participants: people(ME, '@spaces/x/devices/9', 'Marcus Oyelaran'), selfName: ME })).toBe('Meeting with Marcus Oyelaran');
  });

  it('skips a Meet code picked up as a name', () => {
    expect(meetingFileTitle({ title: '', participants: people(ME, 'hsu-vbke-cmn'), selfName: ME })).toBe('Untitled meeting');
    expect(meetingFileTitle({ title: '', participants: people(ME, 'hsu-vbke-cmn', 'Marcus Oyelaran'), selfName: ME })).toBe('Meeting with Marcus Oyelaran');
  });

  it('does not name a meeting after a lone name when the user is not known', () => {
    expect(meetingFileTitle({ title: '', participants: people('Marcus Oyelaran') })).toBe('Untitled meeting');
  });

  it('names the attendees when the user is not known and there are two', () => {
    expect(meetingFileTitle({ title: '', participants: people('Marcus Oyelaran', 'Priya Raman') })).toBe('Meeting with Marcus Oyelaran and Priya Raman');
  });
});
