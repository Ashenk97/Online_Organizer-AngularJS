import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClockService } from '../../core/services/clock';
import { ConfirmService } from '../../core/services/confirm';
import { EventService } from '../../core/services/event';
import { I18nService, Lang } from '../../core/services/i18n';
import { PreferencesService, Theme } from '../../core/services/preferences';
import { NotifyService } from '../../core/services/notify';
import { ToastService } from '../../core/services/toast';
import { TransferService } from '../../core/services/transfer';

@Component({
  selector: 'app-profile',
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  readonly events = inject(EventService);
  readonly i18n = inject(I18nService);
  readonly prefs = inject(PreferencesService);
  private readonly clock = inject(ClockService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  readonly notify = inject(NotifyService);
  readonly transfer = inject(TransferService);
  readonly permission = signal(this.notify.permission);

  readonly name = signal(this.prefs.prefs().name);
  readonly stats = computed(() => this.events.stats(this.clock.now()));

  saveName(): void {
    this.prefs.update({ name: this.name().trim() });
    this.toast.show(this.i18n.t('profileSaved'));
  }

  setLang(lang: Lang): void {
    this.prefs.update({ lang });
  }

  setTheme(theme: Theme): void {
    this.prefs.update({ theme });
  }

  exportJson(): void {
    this.transfer.download('organizer.json', this.transfer.exportJson(), 'application/json');
  }

  exportIcs(): void {
    this.transfer.download('organizer.ics', this.transfer.exportIcs(), 'text/calendar');
  }

  importFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    void file.text().then((text) => {
      try {
        const count = this.transfer.importJson(text);
        this.toast.show(`${this.i18n.t('imported')} · ${count}`);
      } catch {
        this.toast.show(this.i18n.t('invalidImport'), 'info');
      }
      input.value = '';
    });
  }

  async enableNotify(): Promise<void> {
    this.permission.set(await this.notify.enable());
  }

  async clear(): Promise<void> {
    const ok = await this.confirm.ask(this.i18n.t('confirmClear'));
    if (!ok) {
      return;
    }
    this.events.clear();
    this.toast.show(this.i18n.t('cleared'), 'info');
  }
}
