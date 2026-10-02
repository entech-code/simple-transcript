import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { exportAsJson, exportAsMarkdown, exportAsSrt, exportAsText, exportAsVtt } from '../src/utils/transcript-store';
import { CYRILLIC_TEXT, MEETING_TITLE, sampleTranscript } from './helpers/samples';

// The formatters use the machine's locale. Force en-US here so the expected
// output is the same everywhere; the time zone is fixed in vitest.config.mts.
const realTimeString = Date.prototype.toLocaleTimeString;
const realDateString = Date.prototype.toLocaleDateString;

beforeAll(() => {
  vi.spyOn(Date.prototype, 'toLocaleTimeString').mockImplementation(function (this: Date, _locales, options) {
    return realTimeString.call(this, 'en-US', options);
  });
  vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function (this: Date, _locales, options) {
    return realDateString.call(this, 'en-US', options);
  });
  vi.useFakeTimers({ now: Date.UTC(2026, 2, 9, 18, 0, 0), toFake: ['Date'] });
});

afterAll(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/** Newer ICU versions put a narrow no-break space before AM/PM. */
const plain = (s: string): string => s.replace(/ /g, ' ');

describe('exportAsText', () => {
  it('writes one line per entry with the time and speaker', () => {
    expect(plain(exportAsText(sampleTranscript))).toBe(
      [
        '[2:05:07 PM] Dana Whitfield: Thanks for joining, let us get started.',
        '[2:05:19 PM] Marcus Oyelaran: Can we move the review to Thursday?',
        `[2:06:02 PM] Dana Whitfield: ${CYRILLIC_TEXT}`,
      ].join('\n'),
    );
  });

  it('is empty for a transcript with no entries', () => {
    expect(exportAsText([])).toBe('');
  });
});

describe('exportAsMarkdown', () => {
  it('writes the title, the date and each entry under its speaker', () => {
    expect(plain(exportAsMarkdown(sampleTranscript, MEETING_TITLE))).toBe(
      [
        '# Entech Daily Meeting 1',
        '**Date:** 3/9/2026',
        '',
        '**Dana Whitfield** _(02:05 PM)_',
        '',
        'Thanks for joining, let us get started.',
        '',
        '**Marcus Oyelaran** _(02:05 PM)_',
        '',
        'Can we move the review to Thursday?',
        '',
        '**Dana Whitfield** _(02:06 PM)_',
        '',
        CYRILLIC_TEXT,
        '',
      ].join('\n'),
    );
  });

  it('uses a default heading when no title is given', () => {
    expect(exportAsMarkdown(sampleTranscript).split('\n')[0]).toBe('# Meeting Transcript');
  });

  it('writes the heading and the current date for a transcript with no entries', () => {
    expect(exportAsMarkdown([], MEETING_TITLE)).toBe('# Entech Daily Meeting 1\n**Date:** 3/9/2026\n');
  });
});

describe('exportAsJson', () => {
  it('writes the entries as indented JSON without device identifiers', () => {
    const json = exportAsJson(sampleTranscript);

    expect(JSON.parse(json)).toEqual([
      {
        id: 'entry-1',
        text: 'Thanks for joining, let us get started.',
        speaker: 'Dana Whitfield',
        timestamp: Date.UTC(2026, 2, 9, 14, 5, 7, 0),
        messageId: '482913/@spaces/AbCdEfGhIj/devices/42',
      },
      {
        id: 'entry-2',
        text: 'Can we move the review to Thursday?',
        speaker: 'Marcus Oyelaran',
        timestamp: Date.UTC(2026, 2, 9, 14, 5, 19, 500),
      },
      {
        id: 'entry-3',
        text: CYRILLIC_TEXT,
        speaker: 'Dana Whitfield',
        timestamp: Date.UTC(2026, 2, 9, 14, 6, 2, 250),
      },
    ]);
    expect(json).not.toContain('deviceId');
    expect(json.split('\n')[1]).toBe('  {');
  });

  it('is an empty list for a transcript with no entries', () => {
    expect(exportAsJson([])).toBe('[]');
  });
});

describe('exportAsSrt', () => {
  it('numbers each entry and times it from the start of the transcript', () => {
    expect(exportAsSrt(sampleTranscript)).toBe(
      [
        '1',
        '00:00:00,000 --> 00:00:12,500',
        'Dana Whitfield: Thanks for joining, let us get started.',
        '',
        '2',
        '00:00:12,500 --> 00:00:55,250',
        'Marcus Oyelaran: Can we move the review to Thursday?',
        '',
        '3',
        '00:00:55,250 --> 00:00:58,250',
        `Dana Whitfield: ${CYRILLIC_TEXT}`,
        '',
      ].join('\n'),
    );
  });

  it('is empty for a transcript with no entries', () => {
    expect(exportAsSrt([])).toBe('');
  });
});

describe('exportAsVtt', () => {
  it('writes the WEBVTT header and each entry timed from the start', () => {
    expect(exportAsVtt(sampleTranscript)).toBe(
      [
        'WEBVTT',
        '',
        '00:00:00.000 --> 00:00:12.500',
        'Dana Whitfield: Thanks for joining, let us get started.',
        '',
        '00:00:12.500 --> 00:00:55.250',
        'Marcus Oyelaran: Can we move the review to Thursday?',
        '',
        '00:00:55.250 --> 00:00:58.250',
        `Dana Whitfield: ${CYRILLIC_TEXT}`,
      ].join('\n'),
    );
  });

  it('is only the header for a transcript with no entries', () => {
    expect(exportAsVtt([])).toBe('WEBVTT\n\n');
  });
});
