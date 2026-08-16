import { Injectable, signal } from '@angular/core';

interface ConfirmState {
  message: string;
  resolve: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly state = signal<ConfirmState | null>(null);

  ask(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.set({ message, resolve });
    });
  }

  answer(value: boolean): void {
    const current = this.state();
    if (!current) {
      return;
    }
    current.resolve(value);
    this.state.set(null);
  }
}
