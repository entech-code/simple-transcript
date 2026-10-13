import { describe, expect, it } from 'vitest';
import { CAPTIONS_BUTTON, ICON, captionsOnFromIcon } from '../src/utils/captions-button';

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

describe('the captions button', () => {
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
