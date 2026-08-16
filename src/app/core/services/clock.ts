import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClockService {
  readonly now = signal(new Date());
  private started = false;

  start(): void {
    if (this.started) {
      return;
    }
    this.started = true;
    window.setInterval(() => this.now.set(new Date()), 1000);
  }
}
