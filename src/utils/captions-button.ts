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

/**
 * The event the captions check sends the panel in the same tab, every few
 * seconds during a call: its detail is whether captions are on, or null when
 * the captions button cannot tell.
 */
export const CAPTIONS_STATE_EVENT = 'simple-transcript-captions-state';

/** How long caption text counts as proof that captions are on, whatever the button shows. */
export const RECENT_CAPTIONS_MS = 10_000;

/**
 * Captions are off when the button shows them off and no caption text came in
 * the last 10 seconds: text coming in means they are on, even if the button
 * is misread.
 */
export function captionsAreOff(buttonSaysOn: boolean | null, lastCaptionAt: number, now: number): boolean {
  return buttonSaysOn === false && now - lastCaptionAt > RECENT_CAPTIONS_MS;
}
