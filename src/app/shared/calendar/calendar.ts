import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, model, output, signal } from '@angular/core';
import { OrgEvent } from '../../core/models/event';
import { addMonths, monthGrid, startOfMonth, toISODate } from '../../core/utils/dates';

@Component({
  selector: 'app-calendar',
  imports: [DatePipe, CdkDropList],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Calendar {
  readonly selected = model.required<string>();
  readonly marked = input<ReadonlySet<string>>(new Set());
  readonly locale = input('en-US');

  readonly dropped = output<{ id: string; date: string }>();

  readonly view = signal(startOfMonth(new Date()));
  readonly today = toISODate(new Date());
  readonly days = computed(() => monthGrid(this.view()));
  readonly weekdays = computed(() => {
    const start = new Date(2026, 7, 16);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date.toLocaleDateString(this.locale(), { weekday: 'short' });
    });
  });

  prev(): void {
    this.view.update((date) => addMonths(date, -1));
  }

  next(): void {
    this.view.update((date) => addMonths(date, 1));
  }

  goToday(): void {
    const now = new Date();
    this.view.set(startOfMonth(now));
    this.selected.set(toISODate(now));
  }

  pick(date: Date): void {
    this.selected.set(toISODate(date));
  }

  isOutside(date: Date): boolean {
    const view = this.view();
    return date.getMonth() !== view.getMonth() || date.getFullYear() !== view.getFullYear();
  }

  iso(date: Date): string {
    return toISODate(date);
  }

  isSelected(date: Date): boolean {
    return toISODate(date) === this.selected();
  }

  monthLabel(): Date {
    return this.view();
  }

  onDrop(event: CdkDragDrop<string>): void {
    const item = event.item.data as OrgEvent;
    this.dropped.emit({ id: item.id, date: event.container.data });
    this.selected.set(event.container.data);
  }
}
