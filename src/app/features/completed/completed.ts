import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { EventCard } from '../../shared/event-card/event-card';
import { OrgEvent } from '../../core/models/event';
import { ClockService } from '../../core/services/clock';
import { ConfirmService } from '../../core/services/confirm';
import { EditorService } from '../../core/services/editor';
import { EventService } from '../../core/services/event';
import { I18nService } from '../../core/services/i18n';
import { ToastService } from '../../core/services/toast';

@Component({
  selector: 'app-completed',
  imports: [EventCard],
  templateUrl: './completed.html',
  styleUrl: './completed.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Completed {
  readonly events = inject(EventService);
  readonly editor = inject(EditorService);
  readonly i18n = inject(I18nService);
  readonly now = inject(ClockService).now;
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  async remove(event: OrgEvent): Promise<void> {
    const ok = await this.confirm.ask(this.i18n.t('confirmDelete'));
    if (!ok) {
      return;
    }
    this.events.remove(event.id);
    this.toast.show(this.i18n.t('deleted'), 'info');
  }

  restore(event: OrgEvent): void {
    this.events.toggleComplete(event.id, false);
    this.toast.show(this.i18n.t('restoredToast'));
  }
}
