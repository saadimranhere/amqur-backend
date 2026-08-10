import { IntentDetector } from './intent.detector';
import { ChatIntent } from './intent.types';

describe('IntentDetector', () => {
  it('detects trade-in separately from payment', () => {
    expect(IntentDetector.detect('I want a trade-in appraisal')).toBe(
      ChatIntent.TRADE_IN,
    );
    expect(IntentDetector.detect("what's my car worth")).toBe(
      ChatIntent.TRADE_IN,
    );
  });

  it('detects handoff', () => {
    expect(IntentDetector.detect('I want to speak to a real person')).toBe(
      ChatIntent.HUMAN_HANDOFF,
    );
  });

  it('detects parts and service', () => {
    expect(IntentDetector.detect('Do you have brake pads for my VIN')).toBe(
      ChatIntent.PARTS_INQUIRY,
    );
    expect(IntentDetector.detect('I need an oil change appointment')).toBe(
      ChatIntent.SERVICE_APPOINTMENT,
    );
  });
});
