import { beforeAll, describe, expect, it, vi } from 'vitest';
import { parseCaptionMessage, parseCaptionMessageV2 } from '../src/utils/rtc-message-parser';
import { bytes, fixed64, message, nested, text, varint } from './helpers/proto-builder';
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

// Built to the structure documented on parseCaptionMessageV2. Seen 2026-10-13:
// every caption from a call's 128th message on was dropped, as its number takes
// bytes that are not valid text and the update was then mistaken for nested fields.
describe('parseCaptionMessageV2 ("captions_v2" channel)', () => {
  const v2Message = (messageId: number, messageVersion: number, captionText = 'Shall we start?', withTimestamp = true): Uint8Array => {
    const captionData = message(
      text(3, captionText), text(4, 'en-US'), text(5, 'en-US'), text(6, DEVICE_PATH), varint(9, 1),
    );
    const update = message(varint(1, messageId), varint(2, messageVersion), bytes(3, captionData));
    return withTimestamp ? nested(1, bytes(1, update), fixed64(2, 1791901743267000n)) : nested(1, bytes(1, update));
  };

  it.each([1, 127, 128, 300, 20_000])('reads caption message number %i', (messageId) => {
    expect(parseCaptionMessageV2(v2Message(messageId, 1))).toEqual({
      deviceId: `@${DEVICE_PATH}`,
      messageId: `${messageId}/@${DEVICE_PATH}`,
      messageVersion: 1,
      langId: 0,
      text: 'Shall we start?',
    });
  });

  it.each([127, 128, 1_000])('reads revision %i of a caption', (messageVersion) => {
    expect(parseCaptionMessageV2(v2Message(5, messageVersion))?.messageVersion).toBe(messageVersion);
  });

  it('reads a message whatever its text makes it look like', () => {
    expect(parseCaptionMessageV2(v2Message(5, 1, 'Yes.', false))?.text).toBe('Yes.');
    expect(parseCaptionMessageV2(v2Message(5, 1, CYRILLIC_TEXT))?.text).toBe(CYRILLIC_TEXT);
  });
});
