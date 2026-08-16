import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommandService } from '../../core/services/command';
import { EditorService } from '../../core/services/editor';
import { EventService } from '../../core/services/event';
import { I18nKey, I18nService } from '../../core/services/i18n';
import { PreferencesService } from '../../core/services/preferences';
import { ToastService } from '../../core/services/toast';
import { TransferService } from '../../core/services/transfer';

interface CommandItem {
  id: string;
  label: I18nKey;
  hint?: string;
  run: () => void;
}

@Component({
  selector: 'app-command-palette',
  imports: [FormsModule],
  templateUrl: './command-palette.html',
  styleUrl: './command-palette.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPalette {
  readonly commands = inject(CommandService);
  readonly i18n = inject(I18nService);
  readonly query = signal('');
  readonly active = signal(0);

  private readonly editor = inject(EditorService);
  private readonly events = inject(EventService);
  private readonly router = inject(Router);
  private readonly prefs = inject(PreferencesService);
  private readonly transfer = inject(TransferService);
  private readonly toast = inject(ToastService);

  readonly items = computed(() => {
    const q = this.query().trim().toLowerCase();
    const actions: CommandItem[] = [
      { id: 'add', label: 'commandAdd', hint: 'N', run: () => this.editor.add() },
      { id: 'home', label: 'commandHome', hint: '1', run: () => void this.router.navigateByUrl('/') },
      { id: 'done', label: 'commandCompleted', hint: '2', run: () => void this.router.navigateByUrl('/completed') },
      { id: 'profile', label: 'commandProfile', hint: '3', run: () => void this.router.navigateByUrl('/profile') },
      {
        id: 'theme',
        label: 'commandTheme',
        run: () => this.prefs.update({ theme: this.prefs.prefs().theme === 'dark' ? 'light' : 'dark' }),
      },
      {
        id: 'json',
        label: 'commandExport',
        run: () => this.transfer.download('organizer.json', this.transfer.exportJson(), 'application/json'),
      },
      {
        id: 'ics',
        label: 'commandIcs',
        run: () => this.transfer.download('organizer.ics', this.transfer.exportIcs(), 'text/calendar'),
      },
    ];

    const eventItems: CommandItem[] = this.events.events().map((event) => ({
      id: event.id,
      label: 'editEvent',
      hint: event.name,
      run: () => this.editor.edit(event),
    }));

    return [...actions, ...eventItems].filter((item) => {
      if (!q) {
        return item.id.length < 10;
      }
      return (
        this.i18n.t(item.label).toLowerCase().includes(q) || (item.hint ?? '').toLowerCase().includes(q)
      );
    });
  });

  move(delta: number): void {
    const count = this.items().length;
    if (!count) {
      return;
    }
    this.active.set((this.active() + delta + count) % count);
  }

  run(index = this.active()): void {
    const item = this.items()[index];
    if (!item) {
      return;
    }
    item.run();
    this.toast.show(this.i18n.t(item.label), 'info');
    this.query.set('');
    this.active.set(0);
    this.commands.hide();
  }
}
