/**
 * The Copy, Export and Delete buttons of a meeting, shared by the floating
 * panel and the toolbar popup. The icons are drawn on a 16px grid, shown at 14px
 * with a thin line, and take the colour of the text around them, so they follow
 * the theme and the hover state.
 */
const svg = (paths: string): string =>
  `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

// Two overlapping sheets
const ICON_COPY = svg(
  '<rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/>'
  + '<path d="M10.5 3.5V2.5C10.5 1.95 10.05 1.5 9.5 1.5H2.5C1.95 1.5 1.5 1.95 1.5 2.5V9.5C1.5 10.05 1.95 10.5 2.5 10.5H3.5"/>',
);

// An arrow down into a tray
const ICON_EXPORT = svg(
  '<path d="M8 2.5V10M8 10L5.5 7.5M8 10L10.5 7.5"/>'
  + '<path d="M2.5 11.5V12.5C2.5 13.05 2.95 13.5 3.5 13.5H12.5C13.05 13.5 13.5 13.05 13.5 12.5V11.5"/>',
);

// A trash can
const ICON_DELETE = svg(
  '<path d="M2.5 4.5H13.5"/><path d="M6 2.5H10"/>'
  + '<path d="M4.2 4.5L4.9 12.5C5 13.1 5.5 13.5 6.1 13.5H9.9C10.5 13.5 11 13.1 11.1 12.5L11.8 4.5"/>'
  + '<path d="M6.5 7V11"/><path d="M9.5 7V11"/>',
);

/** A tick, shown on the Copy button for a moment after copying. */
export const ICON_COPIED = svg('<path d="M3 8.5L6.5 12L13 4.5"/>');

/** A meeting in progress cannot be deleted, so Delete is not offered for it. */
export function meetingActionsHtml(isLive: boolean): string {
  const copy = `<button class="meeting-action" data-action="copy" title="Copy">${ICON_COPY}</button>`;
  const exp = `<button class="meeting-action" data-action="export" title="Export">${ICON_EXPORT}</button>`;
  const del = `<button class="meeting-action" data-action="delete" title="Delete">${ICON_DELETE}</button>`;
  return isLive ? copy + exp : copy + exp + del;
}
