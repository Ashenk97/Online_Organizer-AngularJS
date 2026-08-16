import { addDays, addMonths, differenceInCalendarDays, startOfWeek } from 'date-fns';
import { EventStatus, OrgEvent } from '../models/event';

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISODate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function combineDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const result = parseISODate(date);
  result.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return result;
}

export function occursOn(event: Pick<OrgEvent, 'startDate' | 'endDate'>, date: string): boolean {
  return event.startDate <= date && event.endDate >= date;
}

export function formatTime(value: string): string {
  const [hoursRaw, minutes = '00'] = value.split(':');
  const hours = Number(hoursRaw);
  if (Number.isNaN(hours)) {
    return value;
  }
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const hour12Value = hours % 12 || 12;
  return `${hour12Value}:${minutes} ${suffix}`;
}

export function formatDisplayDate(value: string, locale: string): string {
  return parseISODate(value).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export { addMonths };

export function monthGrid(view: Date): Date[] {
  const first = startOfMonth(view);
  const startOffset = first.getDay();
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startOffset);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return day;
  });
}

export function weekDays(anchor: Date | string): Date[] {
  const date = typeof anchor === 'string' ? parseISODate(anchor) : anchor;
  const start = startOfWeek(date, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function shiftDate(value: string, days: number): string {
  return toISODate(addDays(parseISODate(value), days));
}

export function dayDelta(from: string, to: string): number {
  return differenceInCalendarDays(parseISODate(to), parseISODate(from));
}

export function minutesFromMidnight(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

export function eventStatus(event: OrgEvent, now: Date): EventStatus {
  if (event.completed) {
    return 'completed';
  }

  const start = combineDateTime(event.startDate, event.startTime);
  const end = combineDateTime(event.endDate, event.endTime);

  if (now >= start && now <= end) {
    return 'happening';
  }
  if (now > end) {
    return 'overdue';
  }
  return 'upcoming';
}

export function countdownTo(target: Date, now: Date): { label: string; totalMs: number } {
  const totalMs = target.getTime() - now.getTime();
  if (totalMs <= 0) {
    return { label: 'now', totalMs };
  }

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return { label: `${days}d ${hours}h ${minutes}m`, totalMs };
  }
  if (hours > 0) {
    return { label: `${hours}h ${minutes}m ${seconds}s`, totalMs };
  }
  return { label: `${minutes}m ${seconds}s`, totalMs };
}

export function greetingKey(now: Date): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' {
  const hour = now.getHours();
  if (hour < 12) {
    return 'greetingMorning';
  }
  if (hour < 17) {
    return 'greetingAfternoon';
  }
  return 'greetingEvening';
}

export function extractTime(value: unknown): string {
  if (typeof value === 'string') {
    const iso = value.match(/T(\d{2}:\d{2})/);
    if (iso) {
      return iso[1];
    }
    const clock = value.match(/^(\d{1,2}):(\d{2})/);
    if (clock) {
      return `${clock[1].padStart(2, '0')}:${clock[2]}`;
    }
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
    }
  }
  return '09:00';
}

export function extractDate(value: unknown, fallback = toISODate(new Date())): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  if (value) {
    const parsed = new Date(value as string);
    if (!Number.isNaN(parsed.getTime())) {
      return toISODate(parsed);
    }
  }
  return fallback;
}

export function lastNDates(now: Date, count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (count - 1 - index));
    return toISODate(date);
  });
}
