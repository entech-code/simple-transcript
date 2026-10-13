/**
 * Google Meet's captions button, as seen on 2026-10-13 with Meet in English,
 * Spanish and Russian: its `jslog` starts with 211197 and its `jsname` is
 * "RrG0hf" in every language, while its label is in the page's language
 * ("Turn off captions", "Activar subtítulos", "Включить субтитры").
 */
export const CAPTIONS_BUTTON = 'button[jslog^="211197;"], button[jsname="RrG0hf"]';

/**
 * Meet draws an icon as its name, written as text in an icon font's element:
 * `google-symbols` now, `google-material-icons` before.
 */
export const ICON = 'i.google-symbols, span.google-symbols, i.google-material-icons, span.google-material-icons';

/**
 * Whether captions are on, from the captions button's icon: "closed_caption"
 * while they are on, "closed_caption_off" while they are off. Null for any
 * other icon, when the state cannot be told.
 */
export function captionsOnFromIcon(iconName: string | null | undefined): boolean | null {
  const name = iconName?.trim();
  if (name === 'closed_caption') return true;
  if (name === 'closed_caption_off') return false;
  return null;
}
