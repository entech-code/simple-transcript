export const KEEPALIVE_INTERVAL_MS = 20_000;
export const STORAGE_DEBOUNCE_MS = 2_000;
export const MEETING_RESUME_WINDOW_MS = 10 * 60_000; // 10 minutes
export const MEETING_CODE_DEDUP_MS = 15_000; // ignore duplicate meeting-code within 15s of creation

export const MESSAGE_SOURCE = 'simple-transcript';

export const RTC_CHANNEL_NAMES = ['captions', 'captions_v2', 'meet_messages', 'collections'] as const;
export const RTC_CAPTION_BATCH_MS = 500;
