import { describe, expect, it } from 'vitest';
import { exportFileName } from '../src/utils/export-filename';
import { MEETING_START, MEETING_TITLE } from './helpers/samples';

const BACKSLASH = String.fromCharCode(92);

// The test run is fixed to UTC (vitest.config.mts), so local time is UTC here.
describe('exportFileName', () => {
  it('puts the title first, then "Transcript", the date and the time', () => {
    expect(exportFileName(MEETING_TITLE, MEETING_START)).toBe('Entech Daily Meeting 1 - 2026-03-09 14-05 - Transcript.md');
  });

  it('pads the month, day, hour and minute to two digits', () => {
    expect(exportFileName('Standup', Date.UTC(2026, 0, 5, 3, 7))).toBe('Standup - 2026-01-05 03-07 - Transcript.md');
  });

  it('replaces characters that are invalid in file names with spaces', () => {
    const title = `Q3: Budget/Plan <draft>?*|"${BACKSLASH}x`;
    expect(exportFileName(title, MEETING_START)).toBe('Q3 Budget Plan draft x - 2026-03-09 14-05 - Transcript.md');
  });

  it('keeps punctuation that file names allow', () => {
    expect(exportFileName("Eric's team_sync-weekly (Q3) & review", MEETING_START))
      .toBe("Eric's team_sync-weekly (Q3) & review - 2026-03-09 14-05 - Transcript.md");
  });

  it('keeps a title written in a non-Latin script', () => {
    expect(exportFileName('Планёрка команды', MEETING_START)).toBe('Планёрка команды - 2026-03-09 14-05 - Transcript.md');
  });

  it('collapses runs of spaces and trims the title', () => {
    expect(exportFileName('  Weekly    sync  ', MEETING_START)).toBe('Weekly sync - 2026-03-09 14-05 - Transcript.md');
  });

  it('drops a trailing dot, which Windows does not allow', () => {
    expect(exportFileName('Kick-off...', MEETING_START)).toBe('Kick-off - 2026-03-09 14-05 - Transcript.md');
  });

  it('shortens a very long title to 100 characters', () => {
    const name = exportFileName('A'.repeat(150), MEETING_START);
    expect(name).toBe(`${'A'.repeat(100)} - 2026-03-09 14-05 - Transcript.md`);
  });

  it.each([
    ['an empty title', ''],
    ['only spaces', '   '],
    ['only invalid characters', '???'],
  ])('uses "Untitled meeting" for %s', (_name, title) => {
    expect(exportFileName(title, MEETING_START)).toBe('Untitled meeting - 2026-03-09 14-05 - Transcript.md');
  });
});
