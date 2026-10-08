import { attendeesForList } from './meeting-attendees';

/**
 * Draws a meeting's attendee tags into `container`, for the floating panel and
 * the toolbar popup. In a list, a meeting with many attendees names the first
 * few and ends with a "+N more" button; clicking it names everyone, and
 * "show less" puts them away again. Elsewhere everyone is named.
 */
export function renderAttendeeTags(container: HTMLElement, attendees: string[], inList: boolean, expanded = false): void {
  const { shown, hidden } = inList ? attendeesForList(attendees) : { shown: attendees, hidden: [] };

  container.textContent = '';
  for (const name of expanded ? attendees : shown) {
    const tag = document.createElement('span');
    tag.className = 'participant-tag';
    tag.textContent = name;
    container.appendChild(tag);
  }
  if (hidden.length === 0) return;

  const toggle = document.createElement('button');
  toggle.className = 'participant-tag more';
  toggle.textContent = expanded ? 'show less' : `+${hidden.length} more`;
  if (!expanded) toggle.title = hidden.join('\n');
  toggle.addEventListener('click', (e) => {
    // The card around it opens the meeting on a click; this one only toggles the names.
    e.stopPropagation();
    renderAttendeeTags(container, attendees, inList, !expanded);
  });
  container.appendChild(toggle);
}
