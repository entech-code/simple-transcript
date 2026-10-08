/** A Google Meet code, such as "eoq-yhou-uyp". */
export const MEET_CODE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

/** A name compared without spacing, letter case or a "(You)" that Meet may add. */
export function nameKey(name: string): string {
  return name.replace(/\s*\(you\)\s*$/i, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Meet's page sometimes holds a name twice in one element, which reads as
 * "Dana WhitfieldDana Whitfield". A text made of the same half twice is that
 * half.
 */
export function undoubledName(name: string): string {
  const text = name.trim();
  const half = text.length / 2;
  if (text.length >= 4 && Number.isInteger(half) && text.slice(0, half) === text.slice(half)) {
    return text.slice(0, half).trim();
  }
  return text;
}

/**
 * Who attended a meeting, the user included: its participants' names, once
 * each, in the order they joined. Devices whose name was never learned (shown
 * as "@…") are left out, and so is a Meet code, which was once picked up from
 * the page as a name.
 */
export function meetingAttendees(meeting: { participants?: Record<string, string> }): string[] {
  const seen = new Set<string>();
  const attendees: string[] = [];
  for (const raw of Object.values(meeting.participants ?? {})) {
    const name = raw.trim();
    const key = nameKey(name);
    if (!key || name.startsWith('@') || MEET_CODE.test(name) || seen.has(key)) continue;
    seen.add(key);
    attendees.push(name);
  }
  return attendees;
}

/** How many attendees a meeting names in a list before the rest are counted. */
const LIST_ATTENDEE_LIMIT = 3;

/**
 * The attendees to name on a meeting's card in a list, and those left to a
 * "+N more" tag. One more than the limit is still named in full: "+1 more"
 * would take the room of the name it hides.
 */
export function attendeesForList(attendees: string[]): { shown: string[]; hidden: string[] } {
  if (attendees.length <= LIST_ATTENDEE_LIMIT + 1) return { shown: attendees, hidden: [] };
  return { shown: attendees.slice(0, LIST_ATTENDEE_LIMIT), hidden: attendees.slice(LIST_ATTENDEE_LIMIT) };
}
