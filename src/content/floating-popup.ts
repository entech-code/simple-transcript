import { MSG, POPUP_PORT_NAME, type TranscriptEntry, type Meeting } from '../utils/types';
import { exportAsText } from '../utils/transcript-store';
import { exportFileName } from '../utils/export-filename';
import { meetingAttendees } from '../utils/meeting-attendees';
import { meetingDisplayTitle, meetingFileTitle, UNTITLED_MEETING } from '../utils/meeting-title';

(function () {
  const STORAGE_POS_KEY = 'popup_position';
  const STORAGE_SIZE_KEY = 'popup_size';
  const DEFAULT_WIDTH = 350;
  const DEFAULT_HEIGHT = 400;
  const MIN_WIDTH = 280;
  const MIN_HEIGHT = 200;

  let port: chrome.runtime.Port | null = null;
  let entries: TranscriptEntry[] = [];
  let currentMeeting: Meeting | null = null;
  let participantCount = 0;
  let isHidden = true; // Start hidden, auto-show when in a real meeting
  let contextInvalidated = false;

  /** Detect if the extension context has been invalidated (extension updated/reloaded). */
  function isContextInvalidated(): boolean {
    if (contextInvalidated) return true;
    try {
      // Accessing chrome.runtime.id throws if context is invalidated
      void chrome.runtime.id;
      return false;
    } catch {
      contextInvalidated = true;
      return true;
    }
  }

  /** Show a banner in the popup telling the user to refresh. */
  function showRefreshBanner(): void {
    const existing = container?.querySelector('.refresh-banner');
    if (existing) return;
    const banner = document.createElement('div');
    banner.className = 'refresh-banner';
    banner.textContent = 'Extension updated — refresh the page to resume transcription';
    banner.style.cssText = 'background:#b71c1c;color:#fff;padding:8px 12px;font-size:12px;text-align:center;cursor:pointer;';
    banner.addEventListener('click', () => location.reload());
    container?.prepend(banner);
  }


  let isDragging = false;
  let isResizing = false;
  let resizeEdge = '';
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let resizeStartX = 0;
  let resizeStartY = 0;
  let resizeStartW = 0;
  let resizeStartH = 0;
  let resizeStartLeft = 0;
  let resizeStartTop = 0;
  let autoScroll = true;
  let currentView: 'live' | 'meetings' | 'meeting-detail' = 'live';
  let viewingMeetingId: string | null = null;
  let detailEntries: TranscriptEntry[] = [];
  let detailMeeting: Omit<Meeting, 'entries'> | null = null;
  // Meetings in progress in any tab, as of the last time the list was loaded
  let liveMeetingIds = new Set<string>();
  let popupWidth = DEFAULT_WIDTH;
  let popupHeight = DEFAULT_HEIGHT;

  let captionsMissing = false;

  // --- Shadow DOM setup ---

  const host = document.createElement('div');
  host.id = '__meet-transcription-popup';
  host.style.cssText = 'all: initial; position: fixed; z-index: 999999; display: none;';
  const shadow = host.attachShadow({ mode: 'closed' });

  const styleEl = document.createElement('style');
  shadow.appendChild(styleEl);

  const container = document.createElement('div');
  container.className = 'popup';
  shadow.appendChild(container);

  // --- Build UI ---

  container.innerHTML = `
    <div class="header" id="header">
      <div class="drag-handle" id="drag-handle">
        <span class="title">Simple Transcript</span>
      </div>
      <div class="header-actions">
        <button class="btn-icon" id="btn-close" title="Close">&#215;</button>
      </div>
    </div>
    <div class="body" id="body">
      <div class="back-nav" id="back-nav">
        <button class="btn-back-live" id="btn-back-live">&larr; Meetings</button>
      </div>
      <div class="meeting-head" id="meeting-head" hidden></div>
      <div class="content-area" id="content-area">
        <div class="live-sections" id="live-sections">
          <div class="section" id="section-transcript">
            <div class="section-body" id="section-transcript-body">
              <div class="placeholder" id="transcript-placeholder" hidden>Listening…</div>
              <div class="transcript" id="transcript"></div>
            </div>
          </div>
        </div>
        <div class="meetings-view" id="meetings-view" style="display:none"></div>
        <div class="detail-view" id="detail-view" style="display:none"></div>
      </div>
      <div class="footer" id="footer">
        <span id="footer-left">0 lines</span>
        <span id="footer-right"></span>
      </div>
    </div>
    <div class="edge edge-n" data-edge="n"></div>
    <div class="edge edge-s" data-edge="s"></div>
    <div class="edge edge-w" data-edge="w"></div>
    <div class="edge edge-e" data-edge="e"></div>
    <div class="edge edge-nw" data-edge="nw"></div>
    <div class="edge edge-ne" data-edge="ne"></div>
    <div class="edge edge-sw" data-edge="sw"></div>
    <div class="edge edge-se" data-edge="se"></div>
  `;

  // --- Element references ---

  const dragHandle = shadow.getElementById('drag-handle')!;
  const bodyEl = shadow.getElementById('body')!;
  const transcriptEl = shadow.getElementById('transcript')!;
  const meetingsEl = shadow.getElementById('meetings-view')!;
  const detailEl = shadow.getElementById('detail-view')!;
  const footerLeft = shadow.getElementById('footer-left')!;
  const footerRight = shadow.getElementById('footer-right')!;
  const btnClose = shadow.getElementById('btn-close')!;
  const edgeHandles = shadow.querySelectorAll<HTMLElement>('.edge');
  const meetingHead = shadow.getElementById('meeting-head')!;
  const footerEl = shadow.getElementById('footer')!;
  const backNav = shadow.getElementById('back-nav')!;
  const btnBackLive = shadow.getElementById('btn-back-live')!;
  const liveSections = shadow.getElementById('live-sections')!;
  const placeholderEl = shadow.getElementById('transcript-placeholder')!;

  btnBackLive.addEventListener('click', () => {
    switchView('meetings');
  });

  // --- Event handlers ---

  btnClose.addEventListener('click', () => {
    isHidden = true;
    host.style.display = 'none';
  });

  async function copyToClipboard(text: string, feedbackEl: HTMLElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for contexts where clipboard API is blocked
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    const orig = feedbackEl.innerHTML;
    feedbackEl.textContent = '\u2713';
    feedbackEl.title = 'Copied!';
    setTimeout(() => {
      feedbackEl.innerHTML = orig;
      feedbackEl.title = 'Copy';
    }, 1500);
  }

  async function getExportResponse(): Promise<{ content?: string; title?: string; startTime?: number } | undefined> {
    if (currentView === 'meeting-detail' && viewingMeetingId) {
      // Use locally cached entries — the service worker may have restarted
      // and lost in-memory data, so we format directly from the entries
      // that were already fetched and displayed.
      if (detailEntries.length > 0 && detailMeeting) {
        const title = meetingDisplayTitle(detailMeeting);
        const content = exportAsText(detailEntries, {
          title,
          startTime: detailMeeting.startTime,
          attendees: meetingAttendees(detailMeeting),
        });
        return { content, title, startTime: detailEntries[0]?.timestamp ?? detailMeeting.startTime };
      }
      return chrome.runtime.sendMessage({
        type: MSG.EXPORT_MEETING,
        payload: { id: viewingMeetingId, format: 'txt' },
      });
    }
    return chrome.runtime.sendMessage({
      type: MSG.EXPORT_TRANSCRIPT,
      payload: { format: 'txt' },
    });
  }

  /** Copy for the view on screen: the live call or the opened meeting. */
  async function copyCurrent(btn: HTMLElement): Promise<void> {
    try {
      const response = await getExportResponse();
      if (response?.content) {
        await copyToClipboard(response.content, btn);
      }
    } catch { /* silent */ }
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

  /** Download for the view on screen: the live call or the opened meeting. */
  async function exportCurrent(): Promise<void> {
    try {
      const response = await getExportResponse();
      if (response?.content) {
        const meeting = currentView === 'meeting-detail' ? detailMeeting : currentMeeting;
        download(
          response.content,
          meeting ? meetingFileTitle(meeting) : UNTITLED_MEETING,
          response.startTime ?? currentMeeting?.startTime ?? Date.now(),
        );
      }
    } catch { /* silent */ }
  }

  // --- View switching ---

  function applyViewDisplays(): void {
    const view = currentView;
    liveSections.style.display = view === 'live' ? '' : 'none';
    meetingsEl.style.display = view === 'meetings' ? '' : 'none';
    detailEl.style.display = view === 'meeting-detail' ? '' : 'none';
    backNav.style.display = (view === 'live' || view === 'meeting-detail') ? '' : 'none';
    // The list has nothing to say in a footer; the live and detail views count lines there.
    footerEl.style.display = view === 'meetings' ? 'none' : '';
    renderMeetingHead();
  }

  function switchView(view: typeof currentView): void {
    currentView = view;
    applyViewDisplays();


    switch (view) {
      case 'live':
        renderAllEntries();
        break;
      case 'meetings':
        footerLeft.textContent = '';
        footerRight.textContent = '';
        loadMeetingsList();
        break;
      case 'meeting-detail':
        break;
    }
  }

  // --- Toggle popup visibility (from toolbar icon) ---

  chrome.runtime.onMessage.addListener((message): undefined => {
    if (message.type === MSG.TOGGLE_POPUP) {
      isHidden = !isHidden;
      host.style.display = isHidden ? 'none' : '';
      if (!isHidden && !port) {
        connectPort();
      }
    }
  });

  // --- Dragging ---

  dragHandle.addEventListener('mousedown', (e: MouseEvent) => {
    isDragging = true;
    const rect = host.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (isDragging) {
      const x = Math.max(0, Math.min(window.innerWidth - 50, e.clientX - dragOffsetX));
      const y = Math.max(0, Math.min(window.innerHeight - 50, e.clientY - dragOffsetY));
      host.style.left = `${x}px`;
      host.style.top = `${y}px`;
      host.style.right = 'auto';
      host.style.bottom = 'auto';
    }
    if (isResizing) {
      const dx = e.clientX - resizeStartX;
      const dy = e.clientY - resizeStartY;
      if (resizeEdge.includes('e')) {
        popupWidth = Math.max(MIN_WIDTH, resizeStartW + dx);
      }
      if (resizeEdge.includes('s')) {
        popupHeight = Math.max(MIN_HEIGHT, resizeStartH + dy);
      }
      if (resizeEdge.includes('w')) {
        const newW = Math.max(MIN_WIDTH, resizeStartW - dx);
        host.style.left = `${resizeStartLeft + (resizeStartW - newW)}px`;
        host.style.right = 'auto';
        popupWidth = newW;
      }
      if (resizeEdge.includes('n')) {
        const newH = Math.max(MIN_HEIGHT, resizeStartH - dy);
        host.style.top = `${resizeStartTop + (resizeStartH - newH)}px`;
        host.style.bottom = 'auto';
        popupHeight = newH;
      }
      applySize();
    }
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      savePosition();
    }
    if (isResizing) {
      isResizing = false;
      saveSize();
      savePosition();
    }
  });

  // --- Resizing ---

  edgeHandles.forEach(el => {
    el.addEventListener('mousedown', (e: MouseEvent) => {
      isResizing = true;
      resizeEdge = el.dataset.edge ?? '';
      resizeStartX = e.clientX;
      resizeStartY = e.clientY;
      resizeStartW = popupWidth;
      resizeStartH = popupHeight;
      const rect = host.getBoundingClientRect();
      resizeStartLeft = rect.left;
      resizeStartTop = rect.top;
      e.preventDefault();
      e.stopPropagation();
    });
  });

  function applySize(): void {
    container.style.width = `${popupWidth}px`;
    container.style.height = `${popupHeight}px`;
  }

  // --- Auto-scroll ---

  transcriptEl.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = transcriptEl;
    autoScroll = scrollHeight - scrollTop - clientHeight < 50;
  });

  // --- Rendering ---

  function countParticipants(m: Meeting | Omit<Meeting, 'entries'>): number {
    return meetingAttendees(m).length;
  }

  function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderEntry(entry: TranscriptEntry): HTMLElement {
    const div = document.createElement('div');
    div.className = 'entry';
    div.dataset.id = entry.id;
    const time = new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    div.innerHTML = `
      <span class="speaker">${escapeHtml(entry.speaker)}</span>
      <span class="time">${time}</span>
      <div class="text">${escapeHtml(entry.text)}</div>
    `;
    return div;
  }

  function renderPlaceholder(): void {
    const empty = entries.length === 0 && currentMeeting !== null;
    placeholderEl.hidden = !empty;
    placeholderEl.textContent = captionsMissing
      ? 'Turn on captions in Meet - that is what the transcript reads.'
      : 'Listening…';
  }

  function appendEntry(entry: TranscriptEntry): void {
    // Only append if viewing live
    if (currentView !== 'live') return;
    captionsMissing = false;
    renderPlaceholder();
    transcriptEl.appendChild(renderEntry(entry));
    updateFooter();
    if (autoScroll) {
      transcriptEl.scrollTop = transcriptEl.scrollHeight;
    }
  }

  function updateEntryInPlace(entry: TranscriptEntry): void {
    if (currentView !== 'live') return;
    const existing = transcriptEl.querySelector(`[data-id="${entry.id}"]`);
    if (existing) {
      const textEl = existing.querySelector('.text');
      if (textEl) textEl.textContent = entry.text;
      const speakerEl = existing.querySelector('.speaker');
      if (speakerEl) speakerEl.textContent = entry.speaker;
      if (autoScroll) {
        transcriptEl.scrollTop = transcriptEl.scrollHeight;
      }
    }
  }

  function renderAllEntries(): void {
    transcriptEl.innerHTML = '';
    for (const entry of entries) {
      transcriptEl.appendChild(renderEntry(entry));
    }
    renderPlaceholder();
    updateFooter();
    if (autoScroll) {
      transcriptEl.scrollTop = transcriptEl.scrollHeight;
    }
  }

  function updateFooter(): void {
    if (currentView !== 'live' && currentView !== 'meeting-detail') return;
    const lines = currentView === 'live' ? entries.length : detailEntries.length;
    footerLeft.textContent = `${lines} line${lines === 1 ? '' : 's'}`;

    const meeting = currentView === 'live' ? currentMeeting : null;
    const parts: string[] = [];
    if (participantCount > 0) {
      parts.push(`${participantCount} participant${participantCount !== 1 ? 's' : ''}`);
    }
    if (meeting?.startTime) {
      const elapsed = Date.now() - meeting.startTime;
      const mins = Math.floor(elapsed / 60000);
      const secs = Math.floor((elapsed % 60000) / 1000);
      parts.push(`${mins}:${String(secs).padStart(2, '0')}`);
    }
    footerRight.textContent = parts.join(' \u00b7 ');
  }

  // Update duration every second
  setInterval(updateFooter, 1000);

  /** How long the call in progress has run, as the list and the live header both show it. */
  function liveDuration(startTime: number): string {
    return `${Math.round((Date.now() - startTime) / 60000)} min (live)`;
  }

  // The live header's duration moves on with the call.
  setInterval(() => {
    if (currentView !== 'live' || !currentMeeting || meetingHead.hidden) return;
    const meta = meetingHead.querySelector('.meeting-item-meta');
    if (!meta) return;
    const date = new Date(currentMeeting.startTime).toLocaleDateString();
    const time = new Date(currentMeeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    meta.textContent = `${date} ${time} · ${liveDuration(currentMeeting.startTime)}`;
  }, 30_000);

  // --- Meetings list view ---

  async function loadMeetingsList(): Promise<void> {
    try {
      const response = await chrome.runtime.sendMessage({ type: MSG.GET_MEETINGS });
      const meetingsList = (response?.meetings ?? []) as Omit<Meeting, 'entries'>[];
      liveMeetingIds = new Set((response?.liveMeetingIds ?? []) as string[]);
      meetingsEl.innerHTML = '';

      // Current meeting at top if active
      if (currentMeeting) {
        const currentItem = createMeetingBlock(currentMeeting, true, 'list');
        meetingsEl.appendChild(currentItem);
      }

      // Past meetings
      const pastMeetings = meetingsList.filter(m => m.id !== currentMeeting?.id);
      if (pastMeetings.length === 0 && !currentMeeting) {
        meetingsEl.innerHTML = '<div class="empty-state">No meetings yet</div>';
        return;
      }

      for (const m of pastMeetings) {
        meetingsEl.appendChild(createMeetingBlock(m, false, 'list'));
      }
    } catch { /* silent */ }
  }

  type BlockMode = 'list' | 'detail' | 'live';

  /** A meeting in progress cannot be deleted, so it is not offered. */
  function actionsHtml(isLive: boolean): string {
    const copy = '<button class="meeting-action" data-action="copy" title="Copy">⎘</button>';
    const exp = '<button class="meeting-action" data-action="export" title="Export">↓</button>';
    const del = '<button class="meeting-action" data-action="delete" title="Delete">✕</button>';
    return isLive ? copy + exp : copy + exp + del;
  }

  /**
   * A meeting's block: its title, the date line with the actions at its end,
   * and the code and participants. In the list it opens the meeting and shows
   * its actions on hover. At the top of an opened meeting (`detail`) and of
   * the live view (`live`) it is not pressed and its actions always show; the
   * live one has no delete.
   */
  function createMeetingBlock(m: Omit<Meeting, 'entries'> | Meeting, isCurrent: boolean, mode: BlockMode): HTMLElement {
    const isLive = isCurrent || mode === 'live' || liveMeetingIds.has(m.id);
    const item = document.createElement('div');
    item.className = 'meeting-item'
      + (mode === 'list' && isCurrent ? ' current' : '')
      + (mode === 'list' ? '' : ' detail');
    const title = meetingDisplayTitle(m);

    const date = new Date(m.startTime).toLocaleDateString();
    const time = new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const participants = meetingAttendees(m);

    let durationStr = '';
    if (isCurrent || mode === 'live') {
      durationStr = liveDuration(m.startTime);
    } else if (m.endTime) {
      const dur = Math.round((m.endTime - m.startTime) / 60000);
      durationStr = `${dur} min`;
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
        <div class="meeting-item-actions">${actionsHtml(isLive)}</div>
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
        if (mode !== 'list') {
          void copyCurrent(btn);
          return;
        }
        chrome.runtime.sendMessage({
          type: MSG.EXPORT_MEETING,
          payload: { id: m.id, format: 'txt' },
        }).then(async (response) => {
          if (response?.content) {
            await copyToClipboard(response.content, btn);
          }
        }).catch(() => {});
      }

      if (action === 'export') {
        if (mode !== 'list') {
          void exportCurrent();
          return;
        }
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
        // Replace actions row with inline confirmation
        actionsEl.innerHTML = '<span class="delete-confirm">Delete? <button class="confirm-yes">Yes</button> <button class="confirm-no">No</button></span>';
        actionsEl.style.opacity = '1';

        // Refused, or answered No: the buttons come back.
        const restoreActions = (): void => {
          actionsEl.innerHTML = actionsHtml(isLive);
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
            if (mode === 'detail') {
              switchView('meetings');
              return;
            }
            item.remove();
            // If deleted the current meeting, switch back to live view
            if (isCurrent) {
              currentMeeting = null;
              switchView('live');
            }
            // If list is now empty, show empty state
            if (meetingsEl.children.length === 0) {
              meetingsEl.innerHTML = '<div class="empty-state">No meetings yet</div>';
            }
          }).catch(() => {});
        });

        actionsEl.querySelector('.confirm-no')!.addEventListener('click', (ev) => {
          ev.stopPropagation();
          restoreActions();
        });
      }
    });

    if (mode !== 'list') return item;

    // Click to view transcription
    item.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('.meeting-item-actions')) return;

      if (isCurrent) {
        switchView('live');
      } else {
        loadMeetingDetail(m);
      }
    });

    return item;
  }

  /** The block at the top of the live view and of an opened meeting; nothing before a call. */
  function renderMeetingHead(): void {
    meetingHead.innerHTML = '';
    let block: HTMLElement | null = null;
    if (currentView === 'live' && currentMeeting) {
      block = createMeetingBlock(currentMeeting, true, 'live');
    } else if (currentView === 'meeting-detail' && detailMeeting) {
      block = createMeetingBlock(detailMeeting, false, 'detail');
    }
    if (block) meetingHead.appendChild(block);
    meetingHead.hidden = block === null;
    // The call in progress has the tint it has in the list.
    bodyEl.classList.toggle('live-head', currentView === 'live' && block !== null);
  }

  // --- Meeting detail view (viewing past meeting transcription) ---

  async function loadMeetingDetail(m: Omit<Meeting, 'entries'>): Promise<void> {
    const meetingId = m.id;
    viewingMeetingId = meetingId;
    detailMeeting = m;
    detailEntries = [];
    switchView('meeting-detail');
    detailEl.innerHTML = '<div class="loading">Loading...</div>';

    try {
      const response = await chrome.runtime.sendMessage({
        type: MSG.GET_MEETING_ENTRIES,
        meetingId,
      });
      const meetingEntries = (response?.entries ?? []) as TranscriptEntry[];
      detailEntries = meetingEntries;
      detailEl.innerHTML = '';

      if (meetingEntries.length === 0) {
        detailEl.innerHTML = '<div class="empty-state">No transcription entries</div>';
        footerLeft.textContent = '0 lines';
        footerRight.textContent = '';
        return;
      }

      // Entries
      const entriesContainer = document.createElement('div');
      entriesContainer.className = 'detail-entries';
      for (const entry of meetingEntries) {
        entriesContainer.appendChild(renderEntry(entry));
      }
      detailEl.appendChild(entriesContainer);

      updateFooter();
      footerRight.textContent = '';
    } catch {
      detailEl.innerHTML = '<div class="empty-state">Failed to load meeting</div>';
    }
  }

  // --- Communication with service worker ---

  function connectPort(): void {
    if (port) return;
    if (isContextInvalidated()) {
      showRefreshBanner();
      return;
    }
    try {
      // Include sessionId in port name so the service worker can route messages
      // even if the keepalive port hasn't reconnected yet (race after SW restart)
      const sessionId = document.documentElement.dataset.simpleTranscriptSession;
      const portName = sessionId ? `${POPUP_PORT_NAME}:${sessionId}` : POPUP_PORT_NAME;
      port = chrome.runtime.connect(undefined, { name: portName });

      port.onMessage.addListener((message) => {
        switch (message.type) {
          case 'captions_missing':
            captionsMissing = true;
            renderPlaceholder();
            break;

          case 'meeting_snapshot':
            currentMeeting = message.meeting;
            entries = message.entries ?? [];
            if (currentMeeting) {
              participantCount = countParticipants(currentMeeting);
            }
            renderAllEntries();
            if (currentView === 'live') renderMeetingHead();
            break;

          case 'new_entry':
            entries.push(message.entry);
            appendEntry(message.entry);
            break;

          case 'entry_updated':
            updateEntryInPlace(message.entry);
            {
              const idx = entries.findIndex(e => e.id === message.entry.id);
              if (idx >= 0) entries[idx] = message.entry;
            }
            break;

          case 'transcript_cleared':
            entries = [];
            transcriptEl.innerHTML = '';
            updateFooter();
            break;

          case 'meeting_started':
            currentMeeting = message.meeting;
            participantCount = 0;
            captionsMissing = false;
            renderPlaceholder();
            if (currentView === 'live') renderMeetingHead();
            break;

          case 'meeting_ended':
            currentMeeting = null;
            participantCount = 0;
            renderPlaceholder();
            if (currentView === 'live') {
              renderMeetingHead();
              updateFooter();
            }
            if (currentView === 'meetings') {
              loadMeetingsList();
            }
            break;

          case 'participant_update':
            if (currentMeeting) {
              if (!currentMeeting.participants) currentMeeting.participants = {};
              currentMeeting.participants[message.deviceId] = message.deviceName;
              participantCount = countParticipants(currentMeeting);
              updateFooter();
              if (currentView === 'live') renderMeetingHead();
            }
            break;

          case 'meeting_renamed':
            if (currentMeeting && message.meeting?.id === currentMeeting.id) {
              currentMeeting.title = message.meeting.title;
              currentMeeting.selfName = message.meeting.selfName;
              if (currentView === 'live') renderMeetingHead();
            }
            break;
        }
      });

      port.onDisconnect.addListener(() => {
        port = null;
        if (isContextInvalidated()) {
          showRefreshBanner();
        } else {
          setTimeout(connectPort, 2000);
        }
      });
    } catch {
      if (isContextInvalidated()) {
        showRefreshBanner();
      } else {
        setTimeout(connectPort, 5000);
      }
    }
  }

  // --- Position & size persistence ---

  async function restorePosition(): Promise<void> {
    try {
      const result = await chrome.storage.local.get([STORAGE_POS_KEY, STORAGE_SIZE_KEY]);
      const pos = result[STORAGE_POS_KEY];
      if (pos && typeof pos === 'object') {
        host.style.left = pos.left ?? 'auto';
        host.style.top = pos.top ?? 'auto';
        host.style.right = pos.right ?? 'auto';
        host.style.bottom = pos.bottom ?? 'auto';
      } else {
        host.style.right = '20px';
        host.style.top = '20px';
      }

      const size = result[STORAGE_SIZE_KEY];
      if (size && typeof size === 'object') {
        popupWidth = size.width ?? DEFAULT_WIDTH;
        popupHeight = size.height ?? DEFAULT_HEIGHT;
      }
      applySize();
    } catch {
      host.style.right = '20px';
      host.style.top = '20px';
      applySize();
    }
  }

  function savePosition(): void {
    if (isContextInvalidated()) return;
    chrome.storage.local.set({
      [STORAGE_POS_KEY]: {
        left: host.style.left,
        top: host.style.top,
        right: host.style.right,
        bottom: host.style.bottom,
      },
    }).catch(() => {});
  }

  function saveSize(): void {
    if (isContextInvalidated()) return;
    chrome.storage.local.set({
      [STORAGE_SIZE_KEY]: { width: popupWidth, height: popupHeight },
    }).catch(() => {});
  }

  // --- Inject into page ---

  function inject(): void {
    document.body.appendChild(host);
    restorePosition();
    connectPort();
    updateStyles();
  }

  if (document.body) {
    inject();
  } else {
    document.addEventListener('DOMContentLoaded', inject);
  }

  // --- Styles ---

  function updateStyles(): void {
    styleEl.textContent = getStyles();
  }

  function getStyles(): string {
    return `
      :host {
        all: initial;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }

      [hidden] {
        display: none !important;
      }

      /* The palette, inlined: the panel lives inside somebody else's page
         and cannot import the app's stylesheet, so the same tokens are written
         here once, light and dark, and every rule below reads them. */
      .popup {
        --bg: #fdfdfb;
        --bg-sunken: #f6f5f1;
        --bg-raised: #fffffd;
        --bg-hover: rgba(28, 28, 26, 0.05);
        --bg-active: rgba(67, 56, 202, 0.12);
        --border: #e2e0d8;
        --border-strong: #cfccc0;
        --text: #1c1c1a;
        --text-dim: #6f6d65;
        --text-faint: #8b8981;
        --accent: #4338ca;
        --accent-text: #fff;
        --warning-bg: #f6ecd8;
        --warning-border: #e0cb96;
        --warning-text: #6b5312;
        --danger: #a83a2a;
        --comment: rgba(67, 56, 202, 0.18);
        --comment-strong: rgba(67, 56, 202, 0.38);
        --shadow: 0 1px 2px rgba(28, 28, 26, 0.05), 0 8px 24px -14px rgba(28, 28, 26, 0.28);
        --font-ui: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
        --font-code: ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
        --radius: 6px;
        --radius-lg: 10px;
        --quick: 120ms;
        --ease: cubic-bezier(0.2, 0.7, 0.2, 1);

        position: relative;
        display: flex;
        flex-direction: column;
        width: ${DEFAULT_WIDTH}px;
        height: ${DEFAULT_HEIGHT}px;
        overflow: hidden;
        font-family: var(--font-ui);
        font-size: 12px;
        line-height: 1.4;
        color: var(--text);
        background: var(--bg-raised);
        border: 1px solid var(--border);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow);
      }

      @media (prefers-color-scheme: dark) {
        .popup {
          --bg: #1c1c1a;
          --bg-sunken: #171715;
          --bg-raised: #22221f;
          --bg-hover: rgba(242, 241, 236, 0.06);
          --bg-active: rgba(129, 140, 248, 0.18);
          --border: #383833;
          --border-strong: #4c4c45;
          --text: #f2f1ec;
          --text-dim: #a3a199;
          --text-faint: #7d7b73;
          --accent: #818cf8;
          --accent-text: #1c1c1a;
          --warning-bg: #3a3222;
          --warning-border: #5c4f2e;
          --warning-text: #e3cb96;
          --danger: #e08476;
          --comment: rgba(129, 140, 248, 0.2);
          --comment-strong: rgba(129, 140, 248, 0.42);
          --shadow: 0 8px 30px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.4);
        }
      }

      button {
        font: inherit;
        color: inherit;
        background: none;
        border: 0;
        cursor: pointer;
      }

      button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 1px;
      }

      /* A field being typed into keeps its own edge and colours it: a ring
         around a box is two edges, and the outer one is what a scroller clips. */
      input:focus-visible,
      select:focus-visible,
      textarea:focus-visible {
        border-color: var(--accent);
        outline: none;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 36px;
        padding: 6px 10px;
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }

      .drag-handle {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        cursor: grab;
        user-select: none;
      }

      .drag-handle:active {
        cursor: grabbing;
      }

      .title {
        display: block;
        overflow: hidden;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: -0.01em;
        white-space: nowrap;
        text-overflow: ellipsis;
        outline: none;
        border-radius: 4px;
        padding: 1px 3px;
        margin: -1px -3px;
      }

      .header-actions {
        display: flex;
        gap: 2px;
        flex-shrink: 0;
      }

      .btn-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        font-size: 15px;
        color: var(--text-dim);
        border-radius: 5px;
        transition: background-color var(--quick) var(--ease), color var(--quick) var(--ease);
      }

      .btn-icon:hover {
        color: var(--text);
        background: var(--bg-hover);
      }

      .btn-icon svg {
        width: 14px;
        height: 14px;
      }

      .body {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .section {
        border-bottom: 1px solid var(--border);
      }

      .section:last-child {
        border-bottom: none;
      }

      .section-body {
        padding: 6px 10px 8px;
      }

      .content-area {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .live-sections {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      #section-transcript {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      #section-transcript .section-body {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      .transcript {
        flex: 1;
        padding: 0;
        overflow-y: auto;
        scroll-behavior: smooth;
      }

      .placeholder {
        padding: 24px 10px;
        font-size: 11px;
        text-align: center;
        color: var(--text-faint);
      }

      .meetings-view,
      .detail-view {
        flex: 1;
        padding: 6px 6px 8px;
        overflow-y: auto;
        scroll-behavior: smooth;
      }

      .transcript::-webkit-scrollbar,
      .meetings-view::-webkit-scrollbar,
      .detail-view::-webkit-scrollbar {
        width: 4px;
      }

      .transcript::-webkit-scrollbar-track,
      .meetings-view::-webkit-scrollbar-track,
      .detail-view::-webkit-scrollbar-track {
        background: transparent;
      }

      .transcript::-webkit-scrollbar-thumb,
      .meetings-view::-webkit-scrollbar-thumb,
      .detail-view::-webkit-scrollbar-thumb {
        background: var(--border-strong);
        border-radius: 2px;
      }

      .entry {
        margin-bottom: 4px;
        padding: 6px 0;
        border-bottom: 1px solid var(--border);
        animation: fadeIn var(--quick) var(--ease);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (prefers-reduced-motion: reduce) {
        .entry {
          animation: none;
        }
      }

      .entry:last-child {
        border-bottom: none;
      }

      .speaker {
        margin-right: 6px;
        font-size: 10px;
        font-weight: 600;
        color: var(--text-dim);
      }

      .time {
        font-size: 10px;
        font-variant-numeric: tabular-nums;
        color: var(--text-faint);
      }

      .device-id {
        display: block;
        max-width: 100%;
        overflow: hidden;
        font-family: var(--font-code);
        font-size: 9px;
        color: var(--text-faint);
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .text {
        margin-top: 2px;
        font-size: 12px;
        line-height: 1.5;
        color: var(--text);
        word-break: break-word;
      }

      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 28px;
        padding: 3px 10px;
        font-size: 11px;
        color: var(--text-dim);
        background: var(--bg-sunken);
        border-top: 1px solid var(--border);
        flex-shrink: 0;
      }

      #footer-left {
        flex: none;
        white-space: nowrap;
      }

      #footer-right {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
        min-width: 0;
      }

      /* Resize edges & corners */
      .edge { position: absolute; z-index: 10; }
      .edge-n { top: -3px; left: 6px; right: 6px; height: 6px; cursor: ns-resize; }
      .edge-s { bottom: -3px; left: 6px; right: 6px; height: 6px; cursor: ns-resize; }
      .edge-w { left: -3px; top: 6px; bottom: 6px; width: 6px; cursor: ew-resize; }
      .edge-e { right: -3px; top: 6px; bottom: 6px; width: 6px; cursor: ew-resize; }
      .edge-nw { top: -3px; left: -3px; width: 10px; height: 10px; cursor: nwse-resize; }
      .edge-ne { top: -3px; right: -3px; width: 10px; height: 10px; cursor: nesw-resize; }
      .edge-sw { bottom: -3px; left: -3px; width: 10px; height: 10px; cursor: nesw-resize; }
      .edge-se { bottom: -3px; right: -3px; width: 10px; height: 10px; cursor: nwse-resize; }

      /* Meetings list */
      .meeting-item {
        margin-bottom: 2px;
        padding: 8px 10px;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color var(--quick) var(--ease);
      }

      .meeting-item:hover {
        background: var(--bg-hover);
      }

      .meeting-item.current {
        background: var(--bg-active);
      }

      .meeting-item.detail {
        margin-bottom: 0;
        cursor: default;
      }

      .meeting-item.detail:hover {
        background: none;
      }

      /* The block at the top of the live view and of an opened meeting. It sits
         outside the scrolling content, so it stays while the transcript moves. */
      .meeting-head {
        padding: 0 4px 4px;
        background: var(--bg-hover);
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }


      /* Two lines at most; the rest is in the tooltip. */
      .meeting-item-title {
        display: -webkit-box;
        overflow: hidden;
        font-size: 12px;
        font-weight: 600;
        color: var(--text);
        overflow-wrap: anywhere;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }

      /* The date line, with the actions at its end: they never take width from the title. */
      .meeting-item-row {
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 22px;
        margin-top: 2px;
      }


      /* Live is a dot, not a badge: the card already says so in its shade. */
      .live-badge {
        flex-shrink: 0;
        width: 6px;
        height: 6px;
        overflow: hidden;
        font-size: 0;
        color: transparent;
        background: var(--accent);
        border-radius: 50%;
      }

      .meeting-item-meta {
        flex: 1;
        min-width: 0;
        font-size: 11px;
        color: var(--text-faint);
      }

      .back-nav {
        padding: 4px 10px;
        border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }

      .live-head .meeting-head {
        background: var(--bg-active);
      }

      .btn-back-live {
        padding: 2px 0;
        font-size: 11px;
        color: var(--text-dim);
        transition: color var(--quick) var(--ease);
      }

      .btn-back-live:hover {
        color: var(--accent);
      }

      .meeting-item-participants {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-top: 4px;
      }

      .participant-tag {
        /* A name Meet got wrong can be a whole sentence, and one that cannot
           shrink widens the card and puts a scrollbar under the whole list. */
        max-width: 100%;
        overflow: hidden;
        padding: 1px 6px;
        font-size: 10px;
        color: var(--text-dim);
        text-overflow: ellipsis;
        white-space: nowrap;
        background: var(--bg-sunken);
        border: 1px solid var(--border);
        border-radius: 8px;
      }

      .meeting-item-actions {
        display: flex;
        flex-shrink: 0;
        gap: 2px;
        margin-left: auto;
        opacity: 0;
        transition: opacity var(--quick) var(--ease);
      }

      .meeting-item:hover .meeting-item-actions,
      .meeting-item:focus-within .meeting-item-actions,
      .meeting-item.detail .meeting-item-actions {
        opacity: 1;
      }

      .meeting-action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        padding: 0;
        font-size: 12px;
        color: var(--text-dim);
        border-radius: 5px;
        transition: background-color var(--quick) var(--ease), color var(--quick) var(--ease);
      }

      .meeting-action:hover {
        color: var(--text);
        background: var(--bg-hover);
      }

      .meeting-action[data-action="delete"]:hover {
        color: var(--danger);
      }

      .delete-confirm {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        color: var(--danger);
      }

      .confirm-yes,
      .confirm-no {
        padding: 2px 8px;
        font-size: 11px;
        color: var(--text-dim);
        border: 1px solid var(--border);
        border-radius: 5px;
        transition: background-color var(--quick) var(--ease), color var(--quick) var(--ease);
      }

      .confirm-yes:hover {
        color: var(--danger);
        background: var(--bg-hover);
      }

      .confirm-no:hover {
        color: var(--text);
        background: var(--bg-hover);
      }

      /* Detail view */
      .btn-back {
        display: block;
        margin-bottom: 8px;
        padding: 6px 0;
        font-size: 12px;
        color: var(--accent);
      }

      .btn-back:hover {
        text-decoration: underline;
      }

      .empty-state,
      .loading {
        padding: 40px 0;
        font-size: 12px;
        text-align: center;
        color: var(--text-faint);
      }
    `;
  }
})();
