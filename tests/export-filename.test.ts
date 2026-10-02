import { describe, expect, it } from 'vitest';
import { exportFileName } from '../src/utils/export-filename';
import { MEETING_START, MEETING_TITLE } from './helpers/samples';

// The test run is fixed to UTC (vitest.config.mts), so local time is UTC here.
describe('exportFileName', () => {
  it('joins the title and the start time as YYYYMMDDHHmm', () => {
    expect(exportFileName(MEETING_TITLE, MEETING_START)).toBe('Entech Daily Meeting 1 202603091405.md');
  });

  // A meeting that was never renamed is titled with its Meet code.
  it('keeps a Meet code used as the title', () => {
    expect(exportFileName('gim-mxzg-xdx', MEETING_START)).toBe('gim-mxzg-xdx 202603091405.md');
  });

  it('pads the month, day, hour and minute to two digits', () => {
    expect(exportFileName('Standup', Date.UTC(2026, 0, 5, 3, 7))).toBe('Standup 202601050307.md');
  });

  it('removes characters that are invalid in file names', () => {
    expect(exportFileName('Q3: Budget/Plan <draft>?*|"\\', MEETING_START)).toBe('Q3 BudgetPlan draft 202603091405.md');
  });

  it('keeps underscores and hyphens', () => {
    expect(exportFileName('team_sync-weekly', MEETING_START)).toBe('team_sync-weekly 202603091405.md');
  });

  it('trims spaces around the title', () => {
    expect(exportFileName('  Weekly  ', MEETING_START)).toBe('Weekly 202603091405.md');
  });

  it('leaves only the time when the title is empty', () => {
    expect(exportFileName('', MEETING_START)).toBe(' 202603091405.md');
  });

  // Today's rule keeps Latin letters and digits only, so a title in another
  // script is removed entirely.
  it('removes a title written in a non-Latin script', () => {
    expect(exportFileName('Планёрка', MEETING_START)).toBe(' 202603091405.md');
  });
});
