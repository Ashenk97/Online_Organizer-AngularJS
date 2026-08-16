export type EventCategory = 'work' | 'personal' | 'health' | 'other';
export type EventPriority = 'low' | 'medium' | 'high';

export interface OrgEvent {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  category: EventCategory;
  priority: EventPriority;
  location: string;
  remind: boolean;
  createdAt: string;
}

export interface EventDraft {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  category: EventCategory;
  priority?: EventPriority;
  location?: string;
  remind?: boolean;
}

export type EventStatus = 'completed' | 'happening' | 'upcoming' | 'overdue';
export type PlannerView = 'month' | 'week' | 'agenda';

export const CATEGORIES: EventCategory[] = ['work', 'personal', 'health', 'other'];
export const PRIORITIES: EventPriority[] = ['low', 'medium', 'high'];

export function normalizeEvent(event: Partial<OrgEvent> & Pick<OrgEvent, 'id' | 'name'>): OrgEvent {
  return {
    description: '',
    startDate: event.startDate ?? '',
    endDate: event.endDate ?? event.startDate ?? '',
    startTime: event.startTime ?? '09:00',
    endTime: event.endTime ?? '10:00',
    completed: Boolean(event.completed),
    category: event.category ?? 'other',
    priority: event.priority ?? 'medium',
    location: event.location ?? '',
    remind: event.remind ?? true,
    createdAt: event.createdAt ?? new Date().toISOString(),
    ...event,
    name: event.name,
    id: event.id,
  };
}
