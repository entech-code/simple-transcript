import { UNTITLED_MEETING } from './meeting-title';

const pad = (n: number): string => String(n).padStart(2, '0');

/** Characters Windows, macOS or Linux refuse in a file name, besides control characters. */
const INVALID_IN_FILE_NAMES = String.fromCharCode(92) + '/:*?"<>|';
const MAX_TITLE_LENGTH = 100;

/** The title made safe for a file name: invalid characters become spaces, runs of spaces collapse. */
function safeFileTitle(title: string): string {
  const cleaned = Array.from(title, (ch) => (ch.charCodeAt(0) < 32 || INVALID_IN_FILE_NAMES.includes(ch) ? ' ' : ch))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TITLE_LENGTH)
    .trim()
    // Windows drops a trailing dot or space from a name, so none is left there.
    .replace(/[. ]+$/, '');
  return cleaned || UNTITLED_MEETING;
}

/**
 * File name for a downloaded transcript: "<title> - <YYYY>-<MM>-<DD> <HH>-<mm> -
 * Transcript.txt", with the start time in local time. "Transcript" comes last so
 * the date reads as the meeting's, not as when the file was saved.
 */
export function exportFileName(title: string, startTime: number): string {
  const d = new Date(startTime);
  const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const time = `${pad(d.getHours())}-${pad(d.getMinutes())}`;
  return `${safeFileTitle(title)} - ${date} ${time} - Transcript.txt`;
}
