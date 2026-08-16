import { DatePipe } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommandPalette } from './shared/command-palette/command-palette';
import { EventForm } from './shared/event-form/event-form';
import { ClockService } from './core/services/clock';
import { CommandService } from './core/services/command';
import { ConfirmService } from './core/services/confirm';
import { EditorService } from './core/services/editor';
import { I18nService } from './core/services/i18n';
import { NotifyService } from './core/services/notify';
import { PreferencesService } from './core/services/preferences';
import { TabTitleService } from './core/services/tab-title';
import { ToastService } from './core/services/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, EventForm, CommandPalette, DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly i18n = inject(I18nService);
  readonly toasts = inject(ToastService);
  readonly confirm = inject(ConfirmService);
  readonly commands = inject(CommandService);
  readonly now = inject(ClockService).now;
  private readonly clock = inject(ClockService);
  private readonly notify = inject(NotifyService);
  private readonly editor = inject(EditorService);
  private readonly router = inject(Router);

  constructor() {
    inject(PreferencesService);
    inject(TabTitleService);
    afterNextRender(() => {
      this.clock.start();
      this.notify.start();
      window.addEventListener('keydown', (event) => this.onKey(event));
    });
  }

  private onKey(event: KeyboardEvent): void {
    const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.commands.toggle();
      return;
    }
    if (typing) {
      return;
    }
    if (event.key.toLowerCase() === 'n') {
      this.editor.add();
    }
    if (event.key === '1') {
      void this.router.navigateByUrl('/');
    }
    if (event.key === '2') {
      void this.router.navigateByUrl('/completed');
    }
    if (event.key === '3') {
      void this.router.navigateByUrl('/profile');
    }
  }
}
