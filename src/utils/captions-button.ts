/**
 * Meet has drawn its captions controls two ways. The extension handles both,
 * as users get Meet's updates days or weeks apart:
 *
 * - Since 2026-10-28: a "Captions and translation" button in the toolbar
 *   (`CAPTIONS_BAR_BUTTON`) opens a bar holding "Live captions"
 *   (`CAPTIONS_BUTTON`) and "Translate speech". The toolbar button's
 *   `aria-pressed` says whether captions are on, with the bar open or closed.
 * - Before: "Live captions" (`CAPTIONS_BUTTON`) sat in the toolbar itself, and
 *   its icon said whether captions were on.
 */

/**
 * The toolbar's "Captions and translation" button, as seen on 2026-10-28 with
 * Meet in English: its `jslog` starts with 317717, its icon is "translate_cc".
 */
export const CAPTIONS_BAR_BUTTON = 'button[jslog^="317717;"]';

/**
 * Google Meet's captions button, "Live captions" since 2026-10-28, as seen on
 * 2026-10-13 with Meet in English, Spanish and Russian and on 2026-10-28 in
 * English: its `jslog` starts with 211197 and its `jsname` is "RrG0hf" in every
 * language, while its label is in the page's language ("Turn off captions",
 * "Activar subtítulos", "Turn off live captions").
 */
export const CAPTIONS_BUTTON = 'button[jslog^="211197;"], button[jsname="RrG0hf"]';

/**
 * Meet draws an icon as its name, written as text in an icon font's element:
 * `google-symbols` now, `google-material-icons` before.
 */
export const ICON = 'i.google-symbols, span.google-symbols, i.google-material-icons, span.google-material-icons';

/**
 * Whether captions are on, from the "Captions and translation" button's
 * `aria-pressed`: "true" while they are on, "false" while they are off. Null
 * for anything else, when the state cannot be told.
 */
export function captionsOnFromPressed(pressed: string | null | undefined): boolean | null {
  if (pressed === 'true') return true;
  if (pressed === 'false') return false;
  return null;
}

/**
 * Whether captions are on, from the captions button's icon in the toolbar
 * before 2026-10-28: "closed_caption" while they are on, "closed_caption_off"
 * while they are off. Null for any other icon, when the state cannot be told.
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
