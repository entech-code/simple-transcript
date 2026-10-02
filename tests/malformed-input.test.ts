import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  parseCaptionMessage,
  parseCaptionMessageV2,
  parseChatMessage,
  parseDeviceCollection,
  parseDeviceInfo,
} from '../src/utils/rtc-message-parser';
import { malformedMessages } from './helpers/samples';

beforeAll(() => {
  vi.spyOn(console, 'debug').mockImplementation(() => {});
});

// Constitution principle III: a parser handed anything unexpected returns
// nothing and never throws into the Meet page.
describe.each(malformedMessages)('malformed input: $name', ({ data }) => {
  it('parseCaptionMessage returns nothing', () => {
    expect(parseCaptionMessage(data)).toBeNull();
  });

  it('parseCaptionMessageV2 returns nothing', () => {
    expect(parseCaptionMessageV2(data)).toBeNull();
  });

  it('parseDeviceInfo returns nothing', () => {
    expect(parseDeviceInfo(data)).toBeNull();
  });

  it('parseDeviceCollection returns no devices', () => {
    expect(parseDeviceCollection(data)).toEqual([]);
  });

  it('parseChatMessage returns nothing', () => {
    expect(parseChatMessage(data)).toBeNull();
  });
});
