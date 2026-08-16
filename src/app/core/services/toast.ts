import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'success'): void {
    const toast = { id: this.nextId++, message, type };
    this.toasts.update((list) => [...list, toast]);
    window.setTimeout(() => this.dismiss(toast.id), 2800);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((toast) => toast.id !== id));
  }
}
