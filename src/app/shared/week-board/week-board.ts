import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { OrgEvent } from '../../core/models/event';
import { minutesFromMidnight, toISODate, weekDays } from '../../core/utils/dates';

const START_HOUR = 7;
const END_HOUR = 21;
const SLOT = 52;

@Component({
  selector: 'app-week-board',
  imports: [DatePipe],
  templateUrl: './week-board.html',
  styleUrl: './week-board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeekBoard {
  readonly selected = input.required<string>();
  readonly events = input.required<OrgEvent[]>();
  readonly now = input.required<Date>();
  readonly locale = input('en-US');

  readonly pick = output<string>();
  readonly openEvent = output<OrgEvent>();
  readonly createAt = output<{ date: string; time: string }>();

  readonly days = computed(() => weekDays(this.selected()));
  readonly hours = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);
  readonly today = computed(() => toISODate(this.now()));

  readonly nowTop = computed(() => {
    const minutes = this.now().getHours() * 60 + this.now().getMinutes();
    return ((minutes - START_HOUR * 60) / 60) * SLOT;
  });

  iso(date: Date): string {
    return toISODate(date);
  }

  eventsFor(date: Date): OrgEvent[] {
    const key = toISODate(date);
    return this.events().filter((event) => event.startDate <= key && event.endDate >= key);
  }

  styleFor(event: OrgEvent): Record<string, string> {
    const start = Math.max(minutesFromMidnight(event.startTime), START_HOUR * 60);
    const end = Math.min(minutesFromMidnight(event.endTime), END_HOUR * 60);
    const top = ((start - START_HOUR * 60) / 60) * SLOT;
    const height = Math.max(((end - start) / 60) * SLOT, 28);
    return { top: `${top}px`, height: `${height}px` };
  }

  slotTime(hour: number): string {
    return `${String(hour).padStart(2, '0')}:00`;
  }

  showNow(date: Date): boolean {
    return toISODate(date) === this.today() && this.nowTop() >= 0 && this.nowTop() <= (END_HOUR - START_HOUR) * SLOT;
  }
}
