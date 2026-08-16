import { effect, inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';
import { ClockService } from './clock';
import { EventService } from './event';
import { I18nService } from './i18n';

@Injectable({ providedIn: 'root' })
export class TabTitleService {
  private readonly title = inject(Title);
  private readonly i18n = inject(I18nService);
  private readonly events = inject(EventService);
  private readonly now = inject(ClockService).now;
  private readonly url = toSignal(
    inject(Router).events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: inject(Router).url },
  );

  constructor() {
    effect(() => {
      this.title.setTitle(this.build());
    });
  }

  private build(): string {
    const brand = this.i18n.t('brand');
    const happening = this.events.happeningNow(this.now());
    if (happening) {
      return `\u25CF ${happening.name} \u00B7 ${brand}`;
    }

    const path = this.url().split('?')[0];
    const page =
      path === '/completed'
        ? this.i18n.t('completed')
        : path === '/profile'
          ? this.i18n.t('profile')
          : this.i18n.t('home');
    const open = this.events.openEvents().length;
    if (path === '/' && open > 0) {
      return `${page} \u00B7 ${open} ${this.i18n.t('openEvents')} \u00B7 ${brand}`;
    }
    return `${page} \u00B7 ${brand}`;
  }
}
