import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EventCategory } from '../../core/models/event';
import { I18nService } from '../../core/services/i18n';

@Component({
  selector: 'app-insights',
  templateUrl: './insights.html',
  styleUrl: './insights.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Insights {
  readonly completion = input(0);
  readonly bars = input<{ date: string; count: number }[]>([]);
  readonly categories = input<{ key: EventCategory; count: number }[]>([]);

  constructor(readonly i18n: I18nService) {}

  maxBar(): number {
    return Math.max(1, ...this.bars().map((bar) => bar.count));
  }

  ring(): string {
    const value = Math.min(100, Math.max(0, this.completion()));
    const offset = 100 - value;
    return `${value} ${offset}`;
  }

  dayLabel(date: string): string {
    return date.slice(8);
  }
}
