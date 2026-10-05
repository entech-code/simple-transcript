/**
 * Google Meet puts a call's title in the tab title as "Meet - <title>", and the
 * call's code in its place when the call has no title (observed 2026-10-05,
 * English-language Chrome).
 */
const TAB_TITLE = /^Meet\s*[-–—]\s*(.*)$/;
const MEET_CODE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

/** The meeting's title from the Meet tab's title, or null when the tab title carries none. */
export function meetingTitleFromTabTitle(meetingTabTitle: string | undefined, meetingCode: string): string | null {
  const match = meetingTabTitle?.trim().match(TAB_TITLE);
  if (!match) return null;
  const meetingTitle = match[1].trim();
  if (!meetingTitle || MEET_CODE.test(meetingTitle) || meetingTitle.toLowerCase() === meetingCode.toLowerCase()) return null;
  return meetingTitle;
}
