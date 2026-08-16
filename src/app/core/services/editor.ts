import { Injectable, signal } from '@angular/core';
import { OrgEvent } from '../models/event';

export interface EditorPreset {
  startDate: string;
  startTime: string;
  endTime?: string;
}

@Injectable({ providedIn: 'root' })
export class EditorService {
  readonly open = signal(false);
  readonly editing = signal<OrgEvent | null>(null);
  readonly preset = signal<EditorPreset | null>(null);

  add(): void {
    this.preset.set(null);
    this.editing.set(null);
    this.open.set(true);
  }

  addAt(preset: EditorPreset): void {
    this.preset.set(preset);
    this.editing.set(null);
    this.open.set(true);
  }

  edit(event: OrgEvent): void {
    this.preset.set(null);
    this.editing.set(event);
    this.open.set(true);
  }

  close(): void {
    this.open.set(false);
    this.editing.set(null);
    this.preset.set(null);
  }
}
