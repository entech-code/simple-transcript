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

/** What a meeting without a title from Google Meet is called. */
export const UNTITLED_MEETING = 'Untitled meeting';

/** The title to show for a meeting: its title from Google Meet, or "Untitled meeting" when it has none. */
export function meetingDisplayTitle(meeting: { title: string }): string {
  return meeting.title.trim() || UNTITLED_MEETING;
}

/** A name compared without spacing, letter case or a "(You)" that Meet may add. */
function nameKey(name: string): string {
  return name.replace(/\s*\(you\)\s*$/i, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * The name a downloaded file starts with: the meeting's title, or for a meeting
 * without one, its other attendees in the order they joined. When the user's
 * own name is not known, a lone name may be theirs, so it is not used.
 */
export function meetingFileTitle(meeting: { title: string; participants: Record<string, string>; selfName?: string }): string {
  const title = meeting.title.trim();
  if (title) return title;

  const self = meeting.selfName ? nameKey(meeting.selfName) : '';
  const seen = new Set<string>();
  const others: string[] = [];
  for (const raw of Object.values(meeting.participants)) {
    const name = raw.trim();
    const key = nameKey(name);
    // Names starting with "@" are devices whose name was never learned; a Meet
    // code was once picked up from the page as a name.
    if (!key || name.startsWith('@') || MEET_CODE.test(name) || key === self || seen.has(key)) continue;
    seen.add(key);
    others.push(name);
  }

  if (others.length === 0 || (others.length === 1 && !self)) return UNTITLED_MEETING;
  if (others.length === 1) return `Meeting with ${others[0]}`;
  if (others.length === 2) return `Meeting with ${others[0]} and ${others[1]}`;
  const rest = others.length - 2;
  return `Meeting with ${others[0]}, ${others[1]} and ${rest} ${rest === 1 ? 'other' : 'others'}`;
}
