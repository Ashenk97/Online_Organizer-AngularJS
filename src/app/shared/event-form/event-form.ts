import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CATEGORIES, EventDraft, PRIORITIES } from '../../core/models/event';
import { eventDraftSchema } from '../../core/models/event.schema';
import { EditorService } from '../../core/services/editor';
import { EventService } from '../../core/services/event';
import { I18nService } from '../../core/services/i18n';
import { ToastService } from '../../core/services/toast';
import { toISODate } from '../../core/utils/dates';

@Component({
  selector: 'app-event-form',
  imports: [ReactiveFormsModule],
  templateUrl: './event-form.html',
  styleUrl: './event-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventForm {
  private readonly fb = inject(FormBuilder);
  readonly editor = inject(EditorService);
  readonly events = inject(EventService);
  readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  readonly categories = CATEGORIES;
  readonly priorities = PRIORITIES;
  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    category: this.fb.nonNullable.control<EventDraft['category']>('personal'),
    priority: this.fb.nonNullable.control<NonNullable<EventDraft['priority']>>('medium'),
    location: [''],
    remind: [true],
  });

  constructor() {
    effect(() => {
      if (!this.editor.open()) {
        return;
      }
      const current = this.editor.editing();
      if (current) {
        this.form.reset({
          name: current.name,
          description: current.description,
          startDate: current.startDate,
          endDate: current.endDate,
          startTime: current.startTime,
          endTime: current.endTime,
          category: current.category,
          priority: current.priority,
          location: current.location,
          remind: current.remind,
        });
        return;
      }

      const today = toISODate(new Date());
      const preset = this.editor.preset();
      const startTime = preset?.startTime ?? '09:00';
      this.form.reset({
        name: '',
        description: '',
        startDate: preset?.startDate ?? today,
        endDate: preset?.startDate ?? today,
        startTime,
        endTime: preset?.endTime ?? '10:00',
        category: 'personal',
        priority: 'medium',
        location: '',
        remind: true,
      });
    });
  }

  submit(): void {
    const parsed = eventDraftSchema.safeParse(this.form.getRawValue());
    if (!parsed.success) {
      this.form.markAllAsTouched();
      return;
    }

    const editing = this.editor.editing();
    if (editing) {
      this.events.update(editing.id, parsed.data);
      this.toast.show(this.i18n.t('updated'));
    } else {
      this.events.create(parsed.data);
      this.toast.show(this.i18n.t('saved'));
    }
    this.editor.close();
  }
}
