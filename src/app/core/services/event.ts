import { Injectable, computed, signal } from '@angular/core';
import { EventCategory, EventDraft, OrgEvent, normalizeEvent } from '../models/event';
import { dayDelta, extractDate, extractTime, lastNDates, occursOn, shiftDate, toISODate } from '../utils/dates';

const STORAGE_KEY = 'organizer.events';
const LEGACY_EVENTS_KEY = 'sav';
const LEGACY_ID_KEY = 'uid';

interface LegacyEvent {
  id?: number | string;
  eventName?: string;
  eventDes?: string;
  eventsDate?: unknown;
  eventeDate?: unknown;
  eventStime?: unknown;
  eventEtime?: unknown;
  complete?: boolean;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  readonly events = signal<OrgEvent[]>([]);
  readonly query = signal('');

  readonly openEvents = computed(() => this.events().filter((event) => !event.completed));
  readonly completedEvents = computed(() =>
    this.sortEvents(this.events().filter((event) => event.completed)),
  );

  constructor() {
    this.events.set(this.hydrate());
  }

  eventsOn(date: string): OrgEvent[] {
    return this.sortEvents(
      this.applyQuery(this.events().filter((event) => !event.completed && occursOn(event, date))),
    );
  }

  upcomingFrom(nowDate: string): OrgEvent[] {
    return this.sortEvents(
      this.applyQuery(this.openEvents().filter((event) => event.endDate >= nowDate)),
    );
  }

  nextEvent(now: Date): OrgEvent | null {
    const nowDate = toISODate(now);
    const upcoming = this.openEvents()
      .filter((event) => event.endDate > nowDate || (event.endDate === nowDate && event.endTime >= this.timeOf(now)))
      .sort((a, b) => this.compareEvents(a, b));
    return upcoming[0] ?? null;
  }

  happeningNow(now: Date): OrgEvent | null {
    return (
      this.openEvents().find((event) => {
        const start = `${event.startDate}T${event.startTime}`;
        const end = `${event.endDate}T${event.endTime}`;
        const stamp = `${toISODate(now)}T${this.timeOf(now)}`;
        return stamp >= start && stamp <= end;
      }) ?? null
    );
  }

  stats(now: Date): {
    total: number;
    open: number;
    done: number;
    week: number;
    completion: number;
    bars: { date: string; count: number }[];
    categories: { key: EventCategory; count: number }[];
  } {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const start = toISODate(weekStart);
    const end = toISODate(weekEnd);
    const all = this.events();
    const done = all.filter((event) => event.completed).length;
    const categories: EventCategory[] = ['work', 'personal', 'health', 'other'];

    return {
      total: all.length,
      open: all.filter((event) => !event.completed).length,
      done,
      week: all.filter((event) => event.startDate <= end && event.endDate >= start).length,
      completion: all.length ? Math.round((done / all.length) * 100) : 0,
      bars: lastNDates(now, 7).map((date) => ({
        date,
        count: all.filter((event) => occursOn(event, date)).length,
      })),
      categories: categories.map((key) => ({
        key,
        count: all.filter((event) => event.category === key).length,
      })),
    };
  }

  create(draft: EventDraft): OrgEvent {
    const event = normalizeEvent({
      id: crypto.randomUUID(),
      ...draft,
      name: draft.name.trim(),
      description: draft.description.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    });
    this.events.update((list) => [...list, event]);
    this.persist();
    return event;
  }

  update(id: string, draft: EventDraft): void {
    this.events.update((list) =>
      list.map((event) =>
        event.id === id
          ? normalizeEvent({
              ...event,
              ...draft,
              name: draft.name.trim(),
              description: draft.description.trim(),
            })
          : event,
      ),
    );
    this.persist();
  }

  moveToDate(id: string, date: string): void {
    this.events.update((list) =>
      list.map((event) => {
        if (event.id !== id || event.startDate === date) {
          return event;
        }
        const delta = dayDelta(event.startDate, date);
        return {
          ...event,
          startDate: shiftDate(event.startDate, delta),
          endDate: shiftDate(event.endDate, delta),
        };
      }),
    );
    this.persist();
  }

  toggleComplete(id: string, completed: boolean): void {
    this.events.update((list) =>
      list.map((event) => (event.id === id ? { ...event, completed } : event)),
    );
    this.persist();
  }

  remove(id: string): void {
    this.events.update((list) => list.filter((event) => event.id !== id));
    this.persist();
  }

  replaceAll(events: OrgEvent[]): void {
    this.events.set(events.map((event) => normalizeEvent(event)));
    this.persist();
  }

  clear(): void {
    this.events.set([]);
    this.persist();
    localStorage.removeItem(LEGACY_EVENTS_KEY);
    localStorage.removeItem(LEGACY_ID_KEY);
  }

  seedSample(now = new Date()): void {
    const day = (offset: number): string => {
      const date = new Date(now);
      date.setDate(now.getDate() + offset);
      return toISODate(date);
    };

    const samples: EventDraft[] = [
      {
        name: 'Morning stretch',
        description: 'Ten quiet minutes before the day starts talking.',
        startDate: day(0),
        endDate: day(0),
        startTime: '07:15',
        endTime: '07:30',
        category: 'health',
        priority: 'low',
        location: 'Home',
        remind: true,
      },
      {
        name: 'Deep-work block',
        description: 'One focused hour. Phone in another room.',
        startDate: day(0),
        endDate: day(0),
        startTime: '10:00',
        endTime: '11:00',
        category: 'work',
        priority: 'high',
        location: 'Studio',
        remind: true,
      },
      {
        name: 'Walk with a friend',
        description: 'Around the lake if the weather holds.',
        startDate: day(1),
        endDate: day(1),
        startTime: '17:30',
        endTime: '18:30',
        category: 'personal',
        priority: 'medium',
        location: 'Lakeside path',
        remind: true,
      },
      {
        name: 'Library evening',
        description: 'Return books and pick a new one.',
        startDate: day(3),
        endDate: day(3),
        startTime: '16:00',
        endTime: '17:15',
        category: 'other',
        priority: 'low',
        location: 'City library',
        remind: false,
      },
    ];

    for (const draft of samples) {
      this.create(draft);
    }
  }

  datesWithEvents(): Set<string> {
    const dates = new Set<string>();
    for (const event of this.openEvents()) {
      const cursor = new Date(`${event.startDate}T00:00:00`);
      const last = new Date(`${event.endDate}T00:00:00`);
      while (cursor <= last) {
        dates.add(toISODate(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return dates;
  }

  private applyQuery(events: OrgEvent[]): OrgEvent[] {
    const query = this.query().trim().toLowerCase();
    if (!query) {
      return events;
    }
    return events.filter(
      (event) =>
        event.name.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query),
    );
  }

  private sortEvents(events: OrgEvent[]): OrgEvent[] {
    const rank = { high: 0, medium: 1, low: 2 };
    return [...events].sort((a, b) => {
      const time = this.compareEvents(a, b);
      return time !== 0 ? time : rank[a.priority] - rank[b.priority];
    });
  }

  private compareEvents(a: OrgEvent, b: OrgEvent): number {
    return `${a.startDate}${a.startTime}`.localeCompare(`${b.startDate}${b.startTime}`);
  }

  private timeOf(date: Date): string {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events()));
  }

  private hydrate(): OrgEvent[] {
    const modern = localStorage.getItem(STORAGE_KEY);
    if (modern) {
      try {
        const parsed = JSON.parse(modern) as OrgEvent[];
        if (Array.isArray(parsed)) {
          return parsed
            .filter((event) => event && typeof event.id === 'string' && event.name)
            .map((event) => normalizeEvent(event));
        }
      } catch {
        // fall through to legacy
      }
    }

    const legacy = localStorage.getItem(LEGACY_EVENTS_KEY);
    if (!legacy) {
      return [];
    }

    try {
      const parsed = JSON.parse(legacy) as LegacyEvent[];
      if (!Array.isArray(parsed)) {
        return [];
      }
      const migrated = parsed.map((item) => this.fromLegacy(item));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    } catch {
      return [];
    }
  }

  private fromLegacy(item: LegacyEvent): OrgEvent {
    return normalizeEvent({
      id: item.id != null ? String(item.id) : crypto.randomUUID(),
      name: item.eventName?.trim() || 'Untitled event',
      description: item.eventDes?.trim() || '',
      startDate: extractDate(item.eventsDate),
      endDate: extractDate(item.eventeDate, extractDate(item.eventsDate)),
      startTime: extractTime(item.eventStime),
      endTime: extractTime(item.eventEtime),
      completed: Boolean(item.complete),
      category: 'other',
    });
  }
}
