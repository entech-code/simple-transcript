import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { exportAsJson, exportAsMarkdown, exportAsSrt, exportAsText, exportAsVtt } from '../src/utils/transcript-store';
import type { TranscriptEntry } from '../src/utils/types';
import { CYRILLIC_TEXT, MEETING_START, MEETING_TITLE, sampleTranscript } from './helpers/samples';

// The formatters use the machine's locale. Force en-US here so the expected
// output is the same everywhere; the time zone is fixed in vitest.config.mts.
const realTimeString = Date.prototype.toLocaleTimeString;
const realDateString = Date.prototype.toLocaleDateString;
const realString = Date.prototype.toLocaleString;

beforeAll(() => {
  vi.spyOn(Date.prototype, 'toLocaleTimeString').mockImplementation(function (this: Date, _locales, options) {
    return realTimeString.call(this, 'en-US', options);
  });
  vi.spyOn(Date.prototype, 'toLocaleDateString').mockImplementation(function (this: Date, _locales, options) {
    return realDateString.call(this, 'en-US', options);
  });
  vi.spyOn(Date.prototype, 'toLocaleString').mockImplementation(function (this: Date, _locales, options) {
    return realString.call(this, 'en-US', options);
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
  const heading = { title: MEETING_TITLE, startTime: MEETING_START, attendees: ['Dana Whitfield', 'Marcus Oyelaran'] };
  const entry = (speaker: string, minute: number, text: string): TranscriptEntry =>
    ({ id: `e${minute}${speaker}`, speaker, text, timestamp: Date.UTC(2026, 2, 9, 14, minute, 30) });

  it('writes the heading, then each entry under its speaker and time', () => {
    expect(plain(exportAsText(sampleTranscript, heading))).toBe(
      [
        'Entech Daily Meeting 1',
        'March 9, 2026 at 2:05 PM',
        'Attendees: Dana Whitfield, Marcus Oyelaran',
        '',
        'Dana Whitfield (2:05 PM)',
        'Thanks for joining, let us get started.',
        '',
        'Marcus Oyelaran (2:05 PM)',
        'Can we move the review to Thursday?',
        '',
        'Dana Whitfield (2:06 PM)',
        CYRILLIC_TEXT,
        '',
      ].join('\n'),
    );
  });

  it('keeps consecutive entries from one speaker apart, as the panel shows them', () => {
    const text = plain(exportAsText([entry('Dana Whitfield', 5, 'One.'), entry('Dana Whitfield', 6, 'Two.')], heading));
    expect(text).toContain('Dana Whitfield (2:05 PM)\nOne.\n\nDana Whitfield (2:06 PM)\nTwo.\n');
  });

  it('leaves out the attendees line when no attendee is known', () => {
    expect(plain(exportAsText([], { ...heading, attendees: [] }))).toBe('Entech Daily Meeting 1\nMarch 9, 2026 at 2:05 PM\n');
  });

  it('writes only the heading for a transcript with no entries', () => {
    expect(plain(exportAsText([], heading))).toBe(
      'Entech Daily Meeting 1\nMarch 9, 2026 at 2:05 PM\nAttendees: Dana Whitfield, Marcus Oyelaran\n',
    );
  });

  it('heads an untitled meeting "Untitled meeting"', () => {
    expect(exportAsText([], { ...heading, title: 'Untitled meeting' }).split('\n')[0]).toBe('Untitled meeting');
  });

  it('keeps characters that look like Markdown', () => {
    const text = exportAsText([entry('Dana Whitfield', 5, '# Not *bold* or _italic_')], heading);
    expect(text).toContain('\n# Not *bold* or _italic_\n');
    expect(text).not.toContain('**');
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
