import { Injectable, inject } from '@angular/core';
import { combineDateTime } from '../utils/dates';
import { EventService } from './event';
import { I18nService } from './i18n';

const LEAD_MS = 15 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly events = inject(EventService);
  private readonly i18n = inject(I18nService);
  private readonly sent = new Set<string>();
  private started = false;

  get supported(): boolean {
    return typeof Notification !== 'undefined';
  }

  get permission(): NotificationPermission | 'unsupported' {
    return this.supported ? Notification.permission : 'unsupported';
  }

  async enable(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.supported) {
      return 'unsupported';
    }
    return Notification.requestPermission();
  }

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    this.tick();
    window.setInterval(() => this.tick(), 30_000);
  }

  private tick(): void {
    if (!this.supported || Notification.permission !== 'granted') {
      return;
    }

    const now = Date.now();
    for (const event of this.events.openEvents()) {
      if (!event.remind || this.sent.has(event.id)) {
        continue;
      }
      const start = combineDateTime(event.startDate, event.startTime).getTime();
      const delta = start - now;
      if (delta <= LEAD_MS && delta > -60_000) {
        this.sent.add(event.id);
        new Notification(event.name, {
          body: event.location
            ? `${this.i18n.t('startingSoon')} · ${event.location}`
            : this.i18n.t('startingSoon'),
          tag: event.id,
        });
      }
    }
  }
}
