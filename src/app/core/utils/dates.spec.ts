import {
  combineDateTime,
  countdownTo,
  dayDelta,
  eventStatus,
  extractDate,
  extractTime,
  greetingKey,
  occursOn,
  shiftDate,
  toISODate,
  weekDays,
} from './dates';

describe('date utils', () => {
  it('formats local ISO dates without UTC shift', () => {
    expect(toISODate(new Date(2026, 7, 16, 23, 30))).toBe('2026-08-16');
  });

  it('treats multi-day events as occurring on every day in range', () => {
    const event = { startDate: '2026-08-15', endDate: '2026-08-17' };
    expect(occursOn(event, '2026-08-14')).toBe(false);
    expect(occursOn(event, '2026-08-16')).toBe(true);
    expect(occursOn(event, '2026-08-17')).toBe(true);
  });

  it('reads times from ISO strings and clock values', () => {
    expect(extractTime('2026-08-16T14:30:00.000Z')).toBe('14:30');
    expect(extractTime('9:05')).toBe('09:05');
  });

  it('reads dates from ISO prefixes and Date strings', () => {
    expect(extractDate('2026-08-16T00:00:00.000Z')).toBe('2026-08-16');
  });

  it('classifies event status from the current time', () => {
    const event = {
      id: '1',
      name: 'Standup',
      description: '',
      startDate: '2026-08-16',
      endDate: '2026-08-16',
      startTime: '10:00',
      endTime: '10:30',
      completed: false,
      category: 'work' as const,
      priority: 'medium' as const,
      location: '',
      remind: true,
      createdAt: '2026-08-16T00:00:00.000Z',
    };

    expect(eventStatus(event, combineDateTime('2026-08-16', '09:00'))).toBe('upcoming');
    expect(eventStatus(event, combineDateTime('2026-08-16', '10:10'))).toBe('happening');
    expect(eventStatus(event, combineDateTime('2026-08-16', '11:00'))).toBe('overdue');
    expect(eventStatus({ ...event, completed: true }, combineDateTime('2026-08-16', '11:00'))).toBe(
      'completed',
    );
  });

  it('builds a live countdown label', () => {
    const now = combineDateTime('2026-08-16', '09:00');
    const target = combineDateTime('2026-08-16', '10:05');
    expect(countdownTo(target, now).label).toBe('1h 5m 0s');
  });

  it('builds a Sunday-start week and shifts dates', () => {
    const days = weekDays('2026-08-16');
    expect(toISODate(days[0])).toBe('2026-08-16');
    expect(toISODate(days[6])).toBe('2026-08-22');
    expect(dayDelta('2026-08-16', '2026-08-18')).toBe(2);
    expect(shiftDate('2026-08-16', 2)).toBe('2026-08-18');
  });

  it('picks a time-of-day greeting', () => {
    expect(greetingKey(combineDateTime('2026-08-16', '08:00'))).toBe('greetingMorning');
    expect(greetingKey(combineDateTime('2026-08-16', '13:00'))).toBe('greetingAfternoon');
    expect(greetingKey(combineDateTime('2026-08-16', '20:00'))).toBe('greetingEvening');
  });
});
