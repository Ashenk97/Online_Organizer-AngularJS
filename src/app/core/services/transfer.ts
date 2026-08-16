import { Injectable, inject } from '@angular/core';
import { OrgEvent, normalizeEvent } from '../models/event';
import { EventService } from './event';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private readonly events = inject(EventService);

  exportJson(): string {
    return JSON.stringify({ version: 2, events: this.events.events() }, null, 2);
  }

  exportIcs(): string {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Online Organizer//EN',
      'CALSCALE:GREGORIAN',
    ];

    for (const event of this.events.events()) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${event.id}@online-organizer`,
        `DTSTAMP:${this.stamp(new Date(event.createdAt))}`,
        `DTSTART:${this.localStamp(event.startDate, event.startTime)}`,
        `DTEND:${this.localStamp(event.endDate, event.endTime)}`,
        `SUMMARY:${this.escape(event.name)}`,
        `DESCRIPTION:${this.escape(event.description)}`,
        `LOCATION:${this.escape(event.location)}`,
        'END:VEVENT',
      );
    }

    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  importJson(raw: string): number {
    const parsed = JSON.parse(raw) as { events?: OrgEvent[] } | OrgEvent[];
    const list = Array.isArray(parsed) ? parsed : parsed.events;
    if (!Array.isArray(list)) {
      throw new Error('invalid');
    }
    const events = list
      .filter((event) => event && event.name)
      .map((event) => normalizeEvent({ ...event, id: event.id || crypto.randomUUID() }));
    this.events.replaceAll(events);
    return events.length;
  }

  download(filename: string, content: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  private localStamp(date: string, time: string): string {
    return `${date.replaceAll('-', '')}T${time.replace(':', '')}00`;
  }

  private stamp(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  }

  private escape(value: string): string {
    return value.replaceAll('\\', '\\\\').replaceAll('\n', '\\n').replaceAll(',', '\\,');
  }
}
