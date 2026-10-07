import { MSG, type Meeting, type TranscriptEntry } from '../utils/types';
import { ICON_COPIED, meetingActionsHtml } from '../utils/action-icons';
import { exportFileName } from '../utils/export-filename';
import { meetingAttendees } from '../utils/meeting-attendees';
import { meetingDisplayTitle, meetingFileTitle } from '../utils/meeting-title';

type MeetingSummary = Omit<Meeting, 'entries'>;

(function () {
  const contentEl = document.getElementById('content')!;
  const backRow = document.getElementById('back-row')!;
  const detailHead = document.getElementById('detail-head')!;
  const detailBlock = document.getElementById('detail-block')!;
  const btnBack = document.getElementById('btn-back') as HTMLButtonElement;
  const footerEl = document.getElementById('footer')!;
  const footerLeft = document.getElementById('footer-left')!;

  function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // --- Navigation ---

  btnBack.addEventListener('click', () => {
    showList();
  });

  function showList(): void {
    backRow.hidden = true;
    detailHead.hidden = true;
    detailBlock.innerHTML = '';
    footerEl.style.display = 'none';
    loadMeetings();
  }

  /** An opened meeting starts with the block it has in the list, its buttons always showing. */
  function showDetail(m: MeetingSummary, isLive: boolean): void {
    detailBlock.innerHTML = '';
    detailBlock.appendChild(createItem(m, isLive, true));
    // A call still in progress has the tint it has in the list.
    detailHead.classList.toggle('live', isLive);
    backRow.hidden = false;
    detailHead.hidden = false;
    loadDetail(m.id);
  }

  async function copyText(content: string, btn: HTMLElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = content;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    // Already showing the tick from a click a moment ago
    if (btn.classList.contains('copied')) return;
    const orig = btn.innerHTML;
    btn.innerHTML = ICON_COPIED;
    btn.classList.add('copied');
    btn.title = 'Copied!';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.classList.remove('copied');
      btn.title = 'Copy';
    }, 1500);
  }

  function download(content: string, title: string, startTime: number): void {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = exportFileName(title, startTime);
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Meetings list ---

  async function loadMeetings(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ type: MSG.GET_MEETINGS });
      const meetings = (response?.meetings ?? []) as MeetingSummary[];
      const liveMeetingIds = (response?.liveMeetingIds ?? []) as string[];

      if (meetings.length === 0) {
        contentEl.innerHTML = '<div class="empty-state">No meetings yet</div>';
        return;
      }

      contentEl.innerHTML = '';
      for (const m of meetings) {
        contentEl.appendChild(createItem(m, liveMeetingIds.includes(m.id), false));
      }
    } catch {
      contentEl.innerHTML = '<div class="empty-state">Failed to load meetings</div>';
    }
  }

  /**
   * A meeting's block: its title, the date line with the actions at its end,
   * and the code and participants. In the list it opens the meeting and shows
   * its actions on hover; at the top of an opened meeting (`detail`) it is not
   * pressed and the actions always show.
   */
  function createItem(m: MeetingSummary, isLive: boolean, detail: boolean): HTMLElement {
    const item = document.createElement('div');
    item.className = 'meeting-item' + (isLive ? ' current' : '') + (detail ? ' detail' : '');
    const title = meetingDisplayTitle(m);

    const date = new Date(m.startTime).toLocaleDateString();
    const time = new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const participants = meetingAttendees(m);

    let durationStr: string;
    if (isLive) {
      const dur = Math.round((Date.now() - m.startTime) / 60000);
      durationStr = `${dur} min (live)`;
    } else if (m.endTime) {
      const dur = Math.round((m.endTime - m.startTime) / 60000);
      durationStr = `${dur} min`;
    } else {
      durationStr = '';
    }

    const participantTags = participants.map(p => `<span class="participant-tag">${escapeHtml(p)}</span>`).join('');
    // Only people here: the Meet code is stored with the meeting but not shown.
    const tagsHtml = participantTags
      ? `<div class="meeting-item-participants">${participantTags}</div>`
      : '';

    item.innerHTML = `
      <div class="meeting-item-title">${escapeHtml(title)}</div>
      <div class="meeting-item-row">
        <span class="meeting-item-meta">${date} ${time}${durationStr ? ` · ${durationStr}` : ''}</span>
        <div class="meeting-item-actions">${meetingActionsHtml(isLive)}</div>
      </div>
      ${tagsHtml}
    `;

    // A title longer than two lines is cut off; the whole of it is in the tooltip.
    (item.querySelector('.meeting-item-title') as HTMLElement).title = title;
    const actionsEl = item.querySelector('.meeting-item-actions') as HTMLElement;

    // --- Action button handlers ---

    actionsEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
      if (!btn) return;
      const action = btn.dataset.action;

      if (action === 'copy') {
        chrome.runtime.sendMessage({
          type: MSG.EXPORT_MEETING,
          payload: { id: m.id, format: 'txt' },
        }).then((response) => {
          if (response?.content) void copyText(response.content, btn);
        }).catch(() => {});
      }

      if (action === 'export') {
        chrome.runtime.sendMessage({
          type: MSG.EXPORT_MEETING,
          payload: { id: m.id, format: 'txt' },
        }).then((response) => {
          if (response?.content) {
            download(response.content, meetingFileTitle(m), response.startTime ?? m.startTime);
          }
        }).catch(() => {});
      }

      if (action === 'delete') {
        actionsEl.innerHTML = '<span class="delete-confirm">Delete? <button class="confirm-yes">Yes</button> <button class="confirm-no">No</button></span>';
        actionsEl.style.opacity = '1';

        // Refused, or answered No: the buttons come back.
        const restoreActions = (): void => {
          actionsEl.innerHTML = meetingActionsHtml(isLive);
          actionsEl.style.opacity = '';
        };

        actionsEl.querySelector('.confirm-yes')!.addEventListener('click', (ev) => {
          ev.stopPropagation();
          chrome.runtime.sendMessage({
            type: MSG.DELETE_MEETING,
            payload: { id: m.id },
          }).then((resp) => {
            // A call still going is refused, and saying so is the whole answer.
            if (resp && !resp.ok) {
              const line = actionsEl.querySelector('.delete-confirm');
              if (line) line.textContent = String(resp.error ?? 'Could not delete');
              setTimeout(restoreActions, 2400);
              return;
            }
            // The opened meeting is gone: back to the list, which no longer has it.
            if (detail) {
              showList();
              return;
            }
            item.remove();
            if (contentEl.children.length === 0) {
              contentEl.innerHTML = '<div class="empty-state">No meetings yet</div>';
            }
          }).catch(() => {});
        });

        actionsEl.querySelector('.confirm-no')!.addEventListener('click', (ev) => {
          ev.stopPropagation();
          restoreActions();
        });
      }
    });

    if (detail) return item;

    // Click to view transcription
    item.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.meeting-item-actions')) return;

      if (isLive) {
        // Focus the Meet tab
        chrome.tabs.query({ url: 'https://meet.google.com/*' }).then((tabs) => {
          const meetTab = tabs.find(t => t.url?.includes(m.meetingCode));
          if (meetTab?.id) {
            chrome.tabs.update(meetTab.id, { active: true });
            window.close();
          } else {
            showDetail(m, isLive);
          }
        });
        return;
      }

      showDetail(m, isLive);
    });

    return item;
  }

  // --- Detail view ---

  async function loadDetail(meetingId: string): Promise<void> {
    contentEl.innerHTML = '<div class="loading">Loading...</div>';

    try {
      const response = await chrome.runtime.sendMessage({
        type: MSG.GET_MEETING_ENTRIES,
        meetingId,
      });
      const entries = (response?.entries ?? []) as TranscriptEntry[];
      contentEl.innerHTML = '';

      if (entries.length === 0) {
        contentEl.innerHTML = '<div class="empty-state">No transcription entries</div>';
        footerEl.style.display = 'flex';
        footerLeft.textContent = '0 lines';
        return;
      }

      const container = document.createElement('div');
      container.className = 'detail-entries';
      for (const entry of entries) {
        container.appendChild(renderEntry(entry));
      }
      contentEl.appendChild(container);

      footerEl.style.display = 'flex';
      footerLeft.textContent = `${entries.length} line${entries.length === 1 ? '' : 's'}`;
    } catch {
      contentEl.innerHTML = '<div class="empty-state">Failed to load meeting</div>';
    }
  }

  function renderEntry(entry: TranscriptEntry): HTMLElement {
    const div = document.createElement('div');
    div.className = 'entry';
    const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
      <span class="speaker">${escapeHtml(entry.speaker)}</span>
      <span class="time">${time}</span>
      <div class="text">${escapeHtml(entry.text)}</div>
    `;
    return div;
  }

  // --- Init ---

  // Through showList rather than straight to loadMeetings: the list state is
  // set in one place, and the footer is part of it.
  showList();
})();
