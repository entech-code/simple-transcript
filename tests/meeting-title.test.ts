import { describe, expect, it } from 'vitest';
import { meetingTitleFromTabTitle } from '../src/utils/meeting-title';

const CODE = 'eoq-yhou-uyp';

describe('meetingTitleFromTabTitle', () => {
  // Observed in live calls on 2026-10-05, in an English-language Chrome.
  it('reads the name of a call created from a calendar event', () => {
    expect(meetingTitleFromTabTitle('Meet - Entech Daily Meeting', CODE)).toBe('Entech Daily Meeting');
  });

  it('finds no name when an instant call shows its own code', () => {
    expect(meetingTitleFromTabTitle('Meet - eoq-yhou-uyp', CODE)).toBeNull();
  });

  it('compares the code without regard to letter case', () => {
    expect(meetingTitleFromTabTitle('Meet - EOQ-YHOU-UYP', CODE)).toBeNull();
  });

  // The code is not always known yet when the title is read.
  it('finds no name in text that has the shape of a Meet code', () => {
    expect(meetingTitleFromTabTitle('Meet - abc-defg-hij', 'unknown')).toBeNull();
  });

  it('keeps a name that merely contains the code', () => {
    expect(meetingTitleFromTabTitle('Meet - Sync (eoq-yhou-uyp)', CODE)).toBe('Sync (eoq-yhou-uyp)');
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
    ['a name without the Meet prefix', 'Entech Daily Meeting'],
    ['a word that only starts with Meet', 'Meeting notes - Budget'],
    ['an empty title', ''],
  ])('finds no name in %s', (_name, title) => {
    expect(meetingTitleFromTabTitle(title, CODE)).toBeNull();
  });

  it('finds no name when there is no title', () => {
    expect(meetingTitleFromTabTitle(undefined, CODE)).toBeNull();
  });
});
