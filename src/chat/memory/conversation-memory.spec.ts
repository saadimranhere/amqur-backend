import { applyInventoryUpdate } from './inventory.merge';
import type { ConversationInventoryState } from './conversation.store';

describe('conversation memory state transitions', () => {
  const base = (): ConversationInventoryState => ({
    lead: {},
    appointment: {},
    leadScore: 0,
    leadEvents: [],
    leadStage: 'cold',
    lastActivityAt: Date.now(),
  });

  it('selects and switches vehicle without losing lead contact', () => {
    let state = base();
    state = {
      ...state,
      selectedVin: '1C4RJFBG0FC123456',
      lead: { firstName: 'Sam', phone: '3125551212' },
    };
    state = { ...state, selectedVin: '1N4BL4BV0KN123456' };
    expect(state.selectedVin).toBe('1N4BL4BV0KN123456');
    expect(state.lead?.phone).toBe('3125551212');
  });

  it('retains trade interest and request id', () => {
    const state: ConversationInventoryState = {
      ...base(),
      trade: { interested: true, requestId: 'tr_1', mileage: 42000 },
    };
    expect(state.trade?.interested).toBe(true);
    expect(state.trade?.requestId).toBe('tr_1');
    expect(state.trade).not.toHaveProperty('appraisalValue');
  });

  it('keeps appointment preference without implying confirmation', () => {
    const state: ConversationInventoryState = {
      ...base(),
      appointment: {
        requested: true,
        date: '2026-08-10',
        time: '10:00',
        confirmed: false,
      },
    };
    expect(state.appointment?.requested).toBe(true);
    expect(state.appointment?.confirmed).toBe(false);
  });

  it('merges inventory filters without wiping compare list', () => {
    const prior: ConversationInventoryState = {
      ...base(),
      compareVins: ['VIN1', 'VIN2'],
      maxPrice: 45000,
    };
    const next = applyInventoryUpdate(prior, {
      resetAll: false,
      remove: [],
      patch: {
        query: 'Wrangler',
        maxPrice: 40000,
      },
    });
    expect(next.compareVins).toEqual(['VIN1', 'VIN2']);
    expect(next.query).toBe('Wrangler');
    expect(next.maxPrice).toBe(40000);
  });
});
