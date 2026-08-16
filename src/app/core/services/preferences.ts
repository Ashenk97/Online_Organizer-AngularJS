import { Injectable, signal } from '@angular/core';
import { I18nService, Lang } from './i18n';

export type Theme = 'dark' | 'light';

export interface UserPreferences {
  name: string;
  lang: Lang;
  theme: Theme;
}

const STORAGE_KEY = 'organizer.preferences';

const DEFAULTS: UserPreferences = {
  name: '',
  lang: 'en',
  theme: 'dark',
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  readonly prefs = signal<UserPreferences>(DEFAULTS);

  constructor(private readonly i18n: I18nService) {
    this.hydrate();
  }

  update(partial: Partial<UserPreferences>): void {
    const next = { ...this.prefs(), ...partial };
    this.prefs.set(next);
    this.apply(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  private hydrate(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.apply(DEFAULTS);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<UserPreferences>;
      const next: UserPreferences = {
        name: typeof parsed.name === 'string' ? parsed.name : '',
        lang: parsed.lang === 'si' ? 'si' : 'en',
        theme: parsed.theme === 'light' ? 'light' : 'dark',
      };
      this.prefs.set(next);
      this.apply(next);
    } catch {
      this.apply(DEFAULTS);
    }
  }

  private apply(prefs: UserPreferences): void {
    this.i18n.setLang(prefs.lang);
    document.documentElement.dataset['theme'] = prefs.theme;
    document.documentElement.lang = prefs.lang === 'si' ? 'si' : 'en';
  }
}
