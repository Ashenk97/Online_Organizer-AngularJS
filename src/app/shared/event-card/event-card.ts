import { CdkDrag } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { EventStatus, OrgEvent } from '../../core/models/event';
import { I18nKey, I18nService } from '../../core/services/i18n';
import { eventStatus, formatDisplayDate, formatTime } from '../../core/utils/dates';

@Component({
  selector: 'app-event-card',
  imports: [CdkDrag],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventCard {
  readonly event = input.required<OrgEvent>();
  readonly now = input.required<Date>();
  readonly locale = input('en-US');
  readonly draggable = input(true);

  readonly edit = output<OrgEvent>();
  readonly remove = output<OrgEvent>();
  readonly toggle = output<OrgEvent>();

  readonly status = computed(() => eventStatus(this.event(), this.now()));

  constructor(readonly i18n: I18nService) {}

  statusLabel(status: EventStatus): string {
    const keys: Record<EventStatus, I18nKey> = {
      upcoming: 'upcomingStatus',
      happening: 'happeningStatus',
      overdue: 'overdueStatus',
      completed: 'completedStatus',
    };
    return this.i18n.t(keys[status]);
  }

  categoryLabel(event: OrgEvent): string {
    return this.i18n.t(event.category);
  }

  range(event: OrgEvent): string {
    const start = `${formatDisplayDate(event.startDate, this.locale())} · ${formatTime(event.startTime)}`;
    if (event.startDate === event.endDate) {
      return `${start} – ${formatTime(event.endTime)}`;
    }
    return `${start} → ${formatDisplayDate(event.endDate, this.locale())} · ${formatTime(event.endTime)}`;
  }
}
