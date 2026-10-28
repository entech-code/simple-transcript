import { describe, expect, it } from 'vitest';
import { CAPTIONS_BAR_BUTTON, CAPTIONS_BUTTON, ICON, RECENT_CAPTIONS_MS, captionsAreOff, captionsOnFromIcon, captionsOnFromPressed } from '../src/utils/captions-button';

// The captions button as Meet drew it on 2026-10-13, cut down to the parts the
// extension reads. Only the label and the icon differ between languages and states.
const button = (label: string, icon: string): string =>
  `<button jsname="RrG0hf" aria-label="${label}" role="button" jslog="211197;track:JIbuQc;">` +
  `<span aria-hidden="true"><i class="quRWN-Bz112c google-symbols notranslate" aria-hidden="true">${icon}</i></span></button>`;

const SEEN = [
  { language: 'English, captions on', html: button('Turn off captions', 'closed_caption'), on: true },
  { language: 'Spanish, captions off', html: button('Activar subtítulos', 'closed_caption_off'), on: false },
  { language: 'Russian, captions off', html: button('Включить субтитры', 'closed_caption_off'), on: false },
];

/** The icon's name as the extension reads it, the text of the icon font's element. */
const iconName = (html: string): string | undefined => html.match(/class="[^"]*google-symbols[^"]*"[^>]*>([^<]*)</)?.[1];

describe('the captions button before 2026-10-28', () => {
  it.each(SEEN)('tells whether captions are on: $language', ({ html, on }) => {
    expect(captionsOnFromIcon(iconName(html))).toBe(on);
  });

  it('is found by markers that are the same in every language', () => {
    for (const { html } of SEEN) {
      expect(html).toContain('jslog="211197;');
      expect(html).toContain('jsname="RrG0hf"');
    }
    expect(CAPTIONS_BUTTON).toContain('button[jslog^="211197;"]');
    expect(CAPTIONS_BUTTON).toContain('button[jsname="RrG0hf"]');
  });

  it('reads icons in the icon font Meet uses now, and the one before', () => {
    expect(ICON).toContain('i.google-symbols');
    expect(ICON).toContain('i.google-material-icons');
  });

  it.each([undefined, null, '', 'mic', 'closed_caption_disabled'])('cannot tell from the icon %s', (name) => {
    expect(captionsOnFromIcon(name)).toBeNull();
  });

  it('ignores space around the icon name', () => {
    expect(captionsOnFromIcon(' closed_caption\n')).toBe(true);
  });
});

// The two buttons as Meet drew them on 2026-10-28 with Meet in English, cut
// down to the parts the extension reads.
const barButton = (pressed: string): string =>
  `<button aria-label="Captions and translation" role="button" aria-haspopup="dialog" aria-expanded="false" ` +
  `jslog="317717;track:JIbuQc;" aria-pressed="${pressed}"><span aria-hidden="true">` +
  `<i class="quRWN-Bz112c google-symbols notranslate" aria-hidden="true">translate_cc</i></span></button>`;
const LIVE_CAPTIONS_ON =
  `<button jsname="RrG0hf" aria-label="Turn off live captions" jslog="211197;track:JIbuQc;">` +
  `<span jsname="Xr1QTb"><i class="quRWN-Bz112c google-symbols notranslate" aria-hidden="true">check</i></span>` +
  `<span jsname="V67aGc" aria-hidden="true">Live captions</span></button>`;

/** The `aria-pressed` value as the extension reads it. */
const pressedOf = (html: string): string | undefined => html.match(/aria-pressed="([^"]*)"/)?.[1];

describe('the captions buttons since 2026-10-28', () => {
  it('tells whether captions are on from the toolbar button, with captions on and off', () => {
    expect(captionsOnFromPressed(pressedOf(barButton('true')))).toBe(true);
    expect(captionsOnFromPressed(pressedOf(barButton('false')))).toBe(false);
  });

  it.each([undefined, null, '', 'mixed'])('cannot tell from aria-pressed %s', (pressed) => {
    expect(captionsOnFromPressed(pressed)).toBeNull();
  });

  it('finds the toolbar button by its jslog', () => {
    expect(barButton('true')).toContain('jslog="317717;');
    expect(CAPTIONS_BAR_BUTTON).toBe('button[jslog^="317717;"]');
  });

  it('finds "Live captions" in the bar by the same markers as the old captions button', () => {
    expect(LIVE_CAPTIONS_ON).toContain('jslog="211197;');
    expect(LIVE_CAPTIONS_ON).toContain('jsname="RrG0hf"');
  });

  it('does not take the toolbar button or Live captions icons for the old icons', () => {
    expect(captionsOnFromIcon(iconName(barButton('true')))).toBeNull();
    expect(captionsOnFromIcon(iconName(LIVE_CAPTIONS_ON))).toBeNull();
  });
});

describe('captions being off', () => {
  const NOW = 1_000_000;

  it('is so when the button shows them off and no caption came lately', () => {
    expect(captionsAreOff(false, 0, NOW)).toBe(true);
    expect(captionsAreOff(false, NOW - RECENT_CAPTIONS_MS - 1, NOW)).toBe(true);
  });

  it('is not so while captions are coming in, whatever the button shows', () => {
    expect(captionsAreOff(false, NOW - 1_000, NOW)).toBe(false);
    expect(captionsAreOff(false, NOW - RECENT_CAPTIONS_MS, NOW)).toBe(false);
  });

  it('is not so when the button shows them on, or cannot tell', () => {
    expect(captionsAreOff(true, 0, NOW)).toBe(false);
    expect(captionsAreOff(null, 0, NOW)).toBe(false);
  });
});
