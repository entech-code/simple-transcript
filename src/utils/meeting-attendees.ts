/** A Google Meet code, such as "eoq-yhou-uyp". */
export const MEET_CODE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

/** A name compared without spacing, letter case or a "(You)" that Meet may add. */
export function nameKey(name: string): string {
  return name.replace(/\s*\(you\)\s*$/i, '').replace(/\s+/g, ' ').trim().toLowerCase();
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
