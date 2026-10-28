import { undoubledName } from '../utils/meeting-attendees';
import { CAPTIONS_BAR_BUTTON, CAPTIONS_BUTTON, CAPTIONS_STATE_EVENT, ICON, captionsOnFromIcon, captionsOnFromPressed } from '../utils/captions-button';

(function () {
  const LOG_PREFIX = "[MeetTranscript:Captions]";
  const MSG_CAPTION_SPEAKER_NAME = "caption_speaker_name";
  const MSG_RETRY_CAPTIONS = "retry_captions";
  let captionAutoEnabled = false;
  let participantScannerStarted = false;
  let contextInvalidated = false;

  function isContextInvalidated(): boolean {
    if (contextInvalidated) return true;
    try {
      // Once the extension is reloaded or updated, its id is gone, or reading it throws
      if (chrome.runtime?.id) return false;
      contextInvalidated = true;
      return true;
    } catch {
      contextInvalidated = true;
      return true;
    }
  }

  // Status lines go to the console's "Verbose" level, which Chrome hides by default.
  function log(...args: unknown[]): void {
    console.debug(LOG_PREFIX, ...args);
  }

  // ========================================
  // Hide native caption overlay (off-screen, NOT display:none so DOM stays live)
  // ========================================

  function hideCaptionOverlay(): void {
    if (document.getElementById("__meet-transcription-hide-cc")) return;
    const style = document.createElement("style");
    style.id = "__meet-transcription-hide-cc";
    style.textContent = `
      .a4cQT,
      [jscontroller="D1tHje"],
      [jscontroller="TEjod"],
      div[jsname="r4nke"] {
        opacity: 0 !important;
        pointer-events: none !important;
        position: fixed !important;
        left: -99999px !important;
        top: -99999px !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ========================================
  // Scan participant names from Google Meet UI (video tiles / people panel)
  // ========================================

  const knownParticipants = new Set<string>();

  // Filter out duration strings, timestamps, and other non-name text from DOM
  const NON_NAME_RE = /^\d+\s*(min|sec|hr|hour|:\d)/i;
  // The meeting's code, which Meet shows in its meeting details, is not a name
  const MEET_CODE_RE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i;

  function isValidName(name: string | null | undefined): name is string {
    if (!name) return false;
    const trimmed = name.trim();
    return trimmed.length >= 2 && trimmed.length <= 60 && !NON_NAME_RE.test(trimmed) && !MEET_CODE_RE.test(trimmed);
  }

  function scanParticipantNames(): void {
    const names: string[] = [];

    // Strategy 1: data-self-name attribute (local user's name)
    const selfEl = document.querySelector("[data-self-name]");
    if (selfEl) {
      const name = selfEl.getAttribute("data-self-name")?.trim();
      if (name) names.push(name);
    }

    // Strategy 2: Participant name overlays on video tiles
    // Google Meet uses .zWGUib, .XEazBc, or .cS7aqe for name labels on tiles
    const nameOverlays = document.querySelectorAll(".zWGUib, .XEazBc, .cS7aqe, [data-participant-id] .ZjFb7c, [data-requested-participant-id] .ZjFb7c");
    for (const el of nameOverlays) {
      const name = el.textContent?.trim();
      if (isValidName(name)) {
        names.push(name);
      }
    }

    // Strategy 3: People panel (if open)
    const peopleItems = document.querySelectorAll("[data-participant-id] [data-hovercard-id], .rua5Nb, .cS7aqe");
    for (const el of peopleItems) {
      const name = el.textContent?.trim();
      if (isValidName(name)) {
        names.push(name);
      }
    }

    // Deduplicate and emit new names
    for (const name of names.map(undoubledName)) {
      if (!knownParticipants.has(name)) {
        knownParticipants.add(name);
        log("Found participant name:", name);
        if (isContextInvalidated()) return;
        chrome.runtime
          .sendMessage({
            type: MSG_CAPTION_SPEAKER_NAME,
            speakerName: name,
          })
          .catch(() => {});
      }
    }
  }

  function startParticipantScanner(): void {
    if (participantScannerStarted) return;
    participantScannerStarted = true;
    // Scan every 3 seconds — participants don't change often
    setInterval(scanParticipantNames, 3000);
    // Initial scan after a short delay
    setTimeout(scanParticipantNames, 1000);
    log("Participant name scanner started");
  }

  function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Every click here works Meet's own controls.
  async function clickAndWait(el: Element, waitMs = 300): Promise<void> {
    (el as HTMLElement).click();
    await delay(waitMs);
  }

  function findButtonByLabel(labelSubstring: string): HTMLElement | null {
    const buttons = document.querySelectorAll("button[aria-label]");
    for (const btn of buttons) {
      const label = btn.getAttribute("aria-label") ?? "";
      if (label.toLowerCase().includes(labelSubstring.toLowerCase())) {
        return btn as HTMLElement;
      }
    }
    return null;
  }

  function findIconButton(iconText: string, container: Element = document.body): HTMLElement | null {
    const icons = container.querySelectorAll(ICON);
    for (const icon of icons) {
      if (icon.textContent?.trim() === iconText) {
        const btn = icon.closest('button, [role="button"], [role="menuitem"], [jsaction]');
        return (btn as HTMLElement) ?? null;
      }
    }
    return null;
  }

  // ========================================
  // Captions controls: Meet has drawn them two ways (see captions-button.ts)
  // ========================================
  //
  // Whether captions are on, and how they are turned on, in this order:
  // 1. Since 2026-10-28: the "Captions and translation" toolbar button says
  //    with aria-pressed; it opens a bar, where "Live captions" is clicked.
  // 2. Before: "Live captions" in the toolbar says with its icon, and is clicked.
  // 3. Neither found: ⋮ → Settings → Captions (tryMenuCaptionEnable).

  /** The "Captions and translation" toolbar button, since 2026-10-28. */
  function findCaptionsBarButton(): HTMLElement | null {
    return document.querySelector<HTMLElement>(CAPTIONS_BAR_BUTTON);
  }

  /** "Live captions": in the bar since 2026-10-28, while it is open; in the toolbar before. */
  function findCaptionsButton(): HTMLElement | null {
    return document.querySelector<HTMLElement>(CAPTIONS_BUTTON);
  }

  /** Whether Meet's captions controls show captions on; null when they cannot tell. */
  function captionsButtonState(): boolean | null {
    const barButton = findCaptionsBarButton();
    if (barButton) return captionsOnFromPressed(barButton.getAttribute("aria-pressed"));
    return captionsOnFromIcon(findCaptionsButton()?.querySelector(ICON)?.textContent);
  }

  /** Check if captions are visibly active in the DOM. */
  function areCaptionsActive(): boolean {
    // The captions controls say so in any language
    const state = captionsButtonState();
    if (state !== null) return state;

    // Check for the native caption overlay container with content
    const overlay = document.querySelector(".a4cQT");
    return !!overlay?.textContent?.trim();
  }

  /** Waits up to `ms` for the captions controls to show captions on. */
  async function waitForCaptionsOn(ms: number): Promise<boolean> {
    for (let waited = 0; waited < ms; waited += 250) {
      if (captionsButtonState() === true) return true;
      await delay(250);
    }
    return captionsButtonState() === true;
  }

  /** Waits up to `ms` for "Live captions" to be on the page. */
  async function waitForCaptionsButton(ms: number): Promise<HTMLElement | null> {
    for (let waited = 0; waited < ms; waited += 250) {
      const button = findCaptionsButton();
      if (button) return button;
      await delay(250);
    }
    return findCaptionsButton();
  }

  /** 1. Since 2026-10-28: open the bar if needed, click "Live captions", close the bar again. */
  async function turnOnFromCaptionsBar(barButton: HTMLElement): Promise<boolean> {
    // Clicked only while the toolbar button shows captions off, so a click never turns them off
    if (captionsOnFromPressed(barButton.getAttribute("aria-pressed")) !== false) return false;

    const openedBar = !findCaptionsButton();
    if (openedBar) {
      log('Opening the "Captions and translation" bar');
      await clickAndWait(barButton, 0);
    }

    // The first time, Meet loads the bar before drawing it: 500 ms was too short in a call on 2026-10-28
    const liveCaptions = await waitForCaptionsButton(3000);
    let on = false;
    if (liveCaptions) {
      log('Found "Live captions" in the bar, clicking');
      await clickAndWait(liveCaptions, 0);
      on = await waitForCaptionsOn(3000);
      log(on ? "Captions verified active after click" : "Clicked Live captions but captions did not activate");
    } else {
      log('"Live captions" not found in the bar');
    }

    // Leave the bar as it was
    if (openedBar && barButton.getAttribute("aria-expanded") === "true") {
      await clickAndWait(barButton, 0);
    }
    return on;
  }

  /** 2. Before 2026-10-28: click "Live captions" in the toolbar. */
  async function turnOnFromCaptionsButton(button: HTMLElement): Promise<boolean> {
    // Clicked only while it shows captions off, so a click never turns them off
    if (captionsButtonState() !== false) return false;

    log("Found captions button, clicking");
    await clickAndWait(button, 0);
    const on = await waitForCaptionsOn(3000);
    log(on ? "Captions verified active after click" : "Clicked captions button but captions did not activate");
    return on;
  }

  /** Turns captions on the first way this page's Meet offers. */
  async function turnOnCaptions(): Promise<boolean> {
    const barButton = findCaptionsBarButton();
    if (barButton) return turnOnFromCaptionsBar(barButton);

    const button = findCaptionsButton();
    if (button) return turnOnFromCaptionsButton(button);

    log("No captions button found, trying Settings");
    return tryMenuCaptionEnable();
  }

  async function tryMenuCaptionEnable(): Promise<boolean> {
    const moreBtn = findButtonByLabel("more options") ?? findIconButton("more_vert");
    if (!moreBtn) {
      log('Could not find "More options" button');
      return false;
    }

    await clickAndWait(moreBtn, 400);

    const menu = document.querySelector('[role="menu"]');
    if (menu) {
      const menuItems = menu.querySelectorAll('[role="menuitem"], [role="menuitemradio"]');
      for (const item of menuItems) {
        const text = item.textContent?.toLowerCase() ?? "";
        if (text.includes("caption") && (text.includes("turn on") || text.includes("enable"))) {
          log('Found "Turn on captions" in menu');
          await clickAndWait(item, 500);
          return true;
        }
      }

      const settingsItem = findIconButton("settings", menu);
      if (settingsItem) {
        await clickAndWait(settingsItem, 500);

        const tabs = document.querySelectorAll('[role="tab"]');
        for (const tab of tabs) {
          const tabIcon = tab.querySelector(ICON);
          if (tabIcon?.textContent?.trim() === "closed_caption") {
            await clickAndWait(tab, 400);
            break;
          }
        }

        const panel = document.querySelector('[role="tabpanel"]');
        if (panel) {
          const toggle = panel.querySelector('[role="switch"], [role="checkbox"], input[type="checkbox"]') as HTMLElement | null;
          if (toggle) {
            const isOn = toggle.getAttribute("aria-checked") === "true" || (toggle as HTMLInputElement).checked;
            if (!isOn) {
              log("Enabling captions via settings toggle");
              await clickAndWait(toggle, 400);
            }
          }
        }

        const closeBtn = document.querySelector('[aria-label="Close"]') as HTMLElement | null;
        if (closeBtn) {
          closeBtn.click();
        } else {
          document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        }

        await delay(200);
        return true;
      }
    }

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    return false;
  }

  function onCaptionsConfirmed(): void {
    captionAutoEnabled = true;
    startParticipantScanner();
    startCaptionsStateReport();
  }

  // ========================================
  // Tell the panel whether captions are on, once turning them on has been tried
  // ========================================

  let captionsStateTimer: ReturnType<typeof setInterval> | null = null;

  function startCaptionsStateReport(): void {
    if (captionsStateTimer) return;
    const report = (): void => {
      if (isContextInvalidated()) {
        if (captionsStateTimer) clearInterval(captionsStateTimer);
        return;
      }
      // Sent every time, not only on a change, so a panel that missed one catches up
      document.dispatchEvent(new CustomEvent(CAPTIONS_STATE_EVENT, { detail: captionsButtonState() }));
    };
    captionsStateTimer = setInterval(report, 3000);
    report();
  }

  async function autoEnableCaptions(retries = 3): Promise<void> {
    if (captionAutoEnabled) return;

    for (let attempt = 0; attempt < retries; attempt++) {
      log(`Auto-enable captions attempt ${attempt + 1}/${retries}`);

      if (areCaptionsActive()) {
        log("Captions already active");
        onCaptionsConfirmed();
        return;
      }

      if (await turnOnCaptions()) {
        onCaptionsConfirmed();
        return;
      }

      await delay(3000);
    }

    log("Could not auto-enable captions after", retries, "attempts");
    // Only now does the panel hear that captions are off, once there is nothing left to try
    startCaptionsStateReport();
  }

  /**
   * In the call, not on the pre-join screen, which has the microphone and
   * camera buttons too: the captions buttons and the leave-call button are only
   * there once in the call.
   */
  function isMeetingJoined(): boolean {
    // Check for call-ended screen — if present, we're not in a meeting
    if (document.querySelector("[data-call-ended]")) return false;

    if (findCaptionsBarButton() || findCaptionsButton() || findIconButton("call_end")) return true;

    // Meeting-specific DOM markers
    if (document.querySelector("[data-participant-id]")) return true;

    // In English, when the buttons above cannot be found
    if (findButtonByLabel("leave call")) return true;

    return false;
  }

  // Auto-enable captions once meeting is joined.
  // Keep checking until captions are confirmed active so that
  // transient UI-timing failures don't permanently prevent auto-enable.
  // Every 2 seconds for the first 3 minutes on the page, which covers the
  // pre-join screen and waiting to be let in for most calls; every 10 seconds after.
  const FAST_CHECK_MS = 2000;
  const FAST_CHECKS_FOR_MS = 3 * 60_000;
  const SLOW_CHECK_MS = 10_000;
  const pageLoadedAt = Date.now();
  let autoEnableCheckTimer: ReturnType<typeof setTimeout> | null = null;
  let autoEnableInProgress = false;

  function scheduleAutoEnableCheck(delayMs?: number): void {
    if (autoEnableCheckTimer) clearTimeout(autoEnableCheckTimer);
    const fast = Date.now() - pageLoadedAt < FAST_CHECKS_FOR_MS;
    autoEnableCheckTimer = setTimeout(() => {
      autoEnableCheckTimer = null;
      checkAndAutoEnable();
      if (!captionAutoEnabled && !isContextInvalidated()) scheduleAutoEnableCheck();
    }, delayMs ?? (fast ? FAST_CHECK_MS : SLOW_CHECK_MS));
  }

  function checkAndAutoEnable(): void {
    if (isContextInvalidated() || captionAutoEnabled) return;
    if (isMeetingJoined() && !autoEnableInProgress) {
      autoEnableInProgress = true;
      log("Meeting joined detected, will auto-enable captions");
      // The captions buttons need no time to settle; anything else gets two seconds
      setTimeout(() => {
        autoEnableCaptions(3).finally(() => {
          autoEnableInProgress = false;
        });
      }, findCaptionsBarButton() || findCaptionsButton() ? 0 : 2000);
    }
  }

  scheduleAutoEnableCheck();

  // Listen for retry requests from the service worker (sent when no caption
  // data arrives for a while despite having an active meeting).
  chrome.runtime.onMessage.addListener((message): undefined => {
    if (message.type === MSG_RETRY_CAPTIONS) {
      log("Service worker requested caption retry");
      captionAutoEnabled = false;
      autoEnableInProgress = false;
      // Check again shortly, and keep checking until captions are on
      scheduleAutoEnableCheck(500);
    }
  });
})();
