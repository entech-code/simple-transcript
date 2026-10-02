import { beforeAll, describe, expect, it, vi } from 'vitest';
import { parseCaptionMessage } from '../src/utils/rtc-message-parser';
import {
  captionMessage,
  CYRILLIC_TEXT,
  DEVICE_PATH,
  JAPANESE_TEXT,
  keepaliveMessage,
  unrelatedMessage,
} from './helpers/samples';

beforeAll(() => {
  // The parsers log what they see at debug level.
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

describe('parseCaptionMessage ("captions" channel)', () => {
  it('reads the speaker device, message identity, revision, language and text', () => {
    const data = captionMessage({ messageId: 482_913, messageVersion: 3, langId: 1, text: 'Thanks for joining, let us get started.' });

    expect(parseCaptionMessage(data)).toEqual({
      deviceId: `@${DEVICE_PATH}`,
      messageId: `482913/@${DEVICE_PATH}`,
      messageVersion: 3,
      langId: 1,
      text: 'Thanks for joining, let us get started.',
    });
  });

  it('identifies messages per device, so two speakers with the same number do not collide', () => {
    const first = parseCaptionMessage(captionMessage({ deviceId: 'spaces/AbCdEfGhIj/devices/42', text: 'One' }));
    const second = parseCaptionMessage(captionMessage({ deviceId: 'spaces/AbCdEfGhIj/devices/57', text: 'Two' }));

    expect(first?.messageId).not.toBe(second?.messageId);
    expect(second?.deviceId).toBe('@spaces/AbCdEfGhIj/devices/57');
  });

  it('reports each revision number so the caller can keep the newest', () => {
    const earlier = parseCaptionMessage(captionMessage({ messageVersion: 4, text: 'Can we move the' }));
    const later = parseCaptionMessage(captionMessage({ messageVersion: 9, text: 'Can we move the review to Thursday?' }));

    expect(earlier?.messageId).toBe(later?.messageId);
    expect(earlier?.messageVersion).toBe(4);
    expect(later?.messageVersion).toBe(9);
    expect(later?.text).toBe('Can we move the review to Thursday?');
  });

  it.each([4, 7])('finds the text when Meet carries it in field %i', textField => {
    const parsed = parseCaptionMessage(captionMessage({ text: 'Sounds good to me.', textField }));
    expect(parsed?.text).toBe('Sounds good to me.');
  });

  it('reads a long caption', () => {
    const long = 'The quarterly numbers look better than we expected, so we can move the launch date forward by two weeks and still leave room for testing.';
    expect(parseCaptionMessage(captionMessage({ text: long }))?.text).toBe(long);
  });

  it('reads Cyrillic text without corrupting it', () => {
    expect(parseCaptionMessage(captionMessage({ text: CYRILLIC_TEXT }))?.text).toBe(CYRILLIC_TEXT);
  });

  it('reads Japanese text without corrupting it', () => {
    expect(parseCaptionMessage(captionMessage({ text: JAPANESE_TEXT }))?.text).toBe(JAPANESE_TEXT);
  });

  it('returns a caption with empty text when the text is empty', () => {
    const parsed = parseCaptionMessage(captionMessage({ text: '' }));
    expect(parsed).not.toBeNull();
    expect(parsed?.text).toBe('');
  });

  it('returns nothing for a keepalive message', () => {
    expect(parseCaptionMessage(keepaliveMessage)).toBeNull();
  });

  it('returns nothing for a message from another channel', () => {
    expect(parseCaptionMessage(unrelatedMessage)).toBeNull();
  });
});
