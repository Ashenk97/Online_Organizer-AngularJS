import { eventDraftSchema } from './event.schema';

describe('eventDraftSchema', () => {
  const valid = {
    name: 'Studio time',
    description: 'Mix the demo',
    startDate: '2026-08-16',
    endDate: '2026-08-16',
    startTime: '14:00',
    endTime: '16:00',
    category: 'work' as const,
    priority: 'high' as const,
    location: 'Studio',
    remind: true,
  };

  it('accepts a complete draft', () => {
    expect(eventDraftSchema.parse(valid).name).toBe('Studio time');
  });

  it('rejects an inverted time range', () => {
    const result = eventDraftSchema.safeParse({ ...valid, endTime: '13:00' });
    expect(result.success).toBe(false);
  });
});
