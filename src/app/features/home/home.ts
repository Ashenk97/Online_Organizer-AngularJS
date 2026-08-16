import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Calendar } from '../../shared/calendar/calendar';
import { EventCard } from '../../shared/event-card/event-card';
import { Insights } from '../../shared/insights/insights';
import { WeekBoard } from '../../shared/week-board/week-board';
import { OrgEvent, PlannerView } from '../../core/models/event';
import { ClockService } from '../../core/services/clock';
import { ConfirmService } from '../../core/services/confirm';
import { EditorService } from '../../core/services/editor';
import { EventService } from '../../core/services/event';
import { I18nKey, I18nService } from '../../core/services/i18n';
import { PreferencesService } from '../../core/services/preferences';
import { ToastService } from '../../core/services/toast';
import { combineDateTime, countdownTo, greetingKey, toISODate, weekDays } from '../../core/utils/dates';

@Component({
  selector: 'app-home',
  imports: [Calendar, EventCard, Insights, WeekBoard, DatePipe, FormsModule, CdkDropListGroup],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly events = inject(EventService);
  readonly editor = inject(EditorService);
  readonly i18n = inject(I18nService);
  readonly prefs = inject(PreferencesService);
  private readonly clock = inject(ClockService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly now = this.clock.now;
  readonly selected = signal(toISODate(new Date()));
  readonly view = signal<PlannerView>('month');
  readonly query = this.events.query;
  readonly views: PlannerView[] = ['month', 'week', 'agenda'];

  readonly greeting = computed(() => this.i18n.t(greetingKey(this.now())));
  readonly name = computed(() => this.prefs.prefs().name.trim());
  readonly locale = this.i18n.locale;
  readonly marked = computed(() => this.events.datesWithEvents());
  readonly daily = computed(() => this.events.eventsOn(this.selected()));
  readonly upcoming = computed(() => this.events.upcomingFrom(toISODate(this.now())));
  readonly next = computed(() => this.events.nextEvent(this.now()));
  readonly focus = computed(() => this.events.happeningNow(this.now()));
  readonly stats = computed(() => this.events.stats(this.now()));
  readonly agenda = computed(() => {
    const days = weekDays(this.selected()).map(toISODate);
    return days
      .map((date) => ({ date, items: this.events.eventsOn(date) }))
      .filter((group) => group.items.length > 0);
  });
  readonly countdown = computed(() => {
    const event = this.next();
    if (!event) {
      return null;
    }
    const start = combineDateTime(event.startDate, event.startTime);
    const current = this.now();
    if (current >= start) {
      return { label: this.i18n.t('now') };
    }
    return { label: countdownTo(start, current).label };
  });
  readonly todayCount = computed(() => this.events.eventsOn(toISODate(this.now())).length);

  viewLabel(view: PlannerView): string {
    return this.i18n.t(`${view}View` as I18nKey);
  }

  reschedule(payload: { id: string; date: string }): void {
    this.events.moveToDate(payload.id, payload.date);
    this.toast.show(this.i18n.t('rescheduled'));
  }

  async remove(event: OrgEvent): Promise<void> {
    const ok = await this.confirm.ask(this.i18n.t('confirmDelete'));
    if (!ok) {
      return;
    }
    this.events.remove(event.id);
    this.toast.show(this.i18n.t('deleted'), 'info');
  }

  toggle(event: OrgEvent): void {
    this.events.toggleComplete(event.id, !event.completed);
    this.toast.show(this.i18n.t(event.completed ? 'restoredToast' : 'completedToast'));
  }

  seed(): void {
    this.events.seedSample(this.now());
    this.toast.show(this.i18n.t('sampleLoaded'));
  }
}
