const pad = (n: number): string => String(n).padStart(2, '0');

/** File name for a downloaded transcript: the title stripped to safe characters, then the start time in local time. */
export function exportFileName(title: string, startTime: number): string {
  const safeName = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim();
  const d = new Date(startTime);
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`;
  return `${safeName} ${dateStr}.md`;
}
