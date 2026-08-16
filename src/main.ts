import { registerLocaleData } from '@angular/common';
import localeSi from '@angular/common/locales/si';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

registerLocaleData(localeSi);

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
