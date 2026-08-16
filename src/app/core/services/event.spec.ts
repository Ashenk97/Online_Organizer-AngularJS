import { TestBed } from '@angular/core/testing';
import { EventService } from './event';

describe('EventService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('creates, updates, completes, and deletes events', () => {
    const service = TestBed.inject(EventService);
    const created = service.create({
      name: '  Library  ',
      description: 'Return books',
      startDate: '2026-08-16',
      endDate: '2026-08-16',
      startTime: '16:00',
      endTime: '17:00',
      category: 'other',
    });

    expect(created.name).toBe('Library');
    expect(service.events().length).toBe(1);

    service.update(created.id, {
      name: 'Library night',
      description: 'Return books',
      startDate: '2026-08-16',
      endDate: '2026-08-16',
      startTime: '16:00',
      endTime: '17:30',
      category: 'personal',
    });
    expect(service.events()[0].name).toBe('Library night');
    expect(service.events()[0].endTime).toBe('17:30');

    service.toggleComplete(created.id, true);
    expect(service.completedEvents().length).toBe(1);
    expect(service.openEvents().length).toBe(0);

    service.remove(created.id);
    expect(service.events().length).toBe(0);
  });

  it('includes spanning events on the selected day', () => {
    const service = TestBed.inject(EventService);
    service.create({
      name: 'Trip',
      description: '',
      startDate: '2026-08-15',
      endDate: '2026-08-17',
      startTime: '09:00',
      endTime: '18:00',
      category: 'personal',
    });

    expect(service.eventsOn('2026-08-16').map((event) => event.name)).toEqual(['Trip']);
    expect(service.eventsOn('2026-08-18')).toEqual([]);
  });

  it('reschedules an event while keeping its length', () => {
    const service = TestBed.inject(EventService);
    const created = service.create({
      name: 'Trip',
      description: '',
      startDate: '2026-08-15',
      endDate: '2026-08-17',
      startTime: '09:00',
      endTime: '18:00',
      category: 'personal',
    });

    service.moveToDate(created.id, '2026-08-20');
    expect(service.events()[0].startDate).toBe('2026-08-20');
    expect(service.events()[0].endDate).toBe('2026-08-22');
  });

  it('migrates the original AngularJS localStorage shape', () => {
    localStorage.setItem(
      'sav',
      JSON.stringify([
        {
          id: 7,
          eventName: 'Old meetup',
          eventDes: 'From the first version',
          eventsDate: '2026-08-16',
          eventeDate: '2026-08-16',
          eventStime: '2026-08-16T13:00:00.000Z',
          eventEtime: '14:30',
          complete: false,
        },
      ]),
    );

    const service = TestBed.inject(EventService);
    expect(service.events()[0].name).toBe('Old meetup');
    expect(service.events()[0].startTime).toBe('13:00');
    expect(service.events()[0].endTime).toBe('14:30');
    expect(localStorage.getItem('organizer.events')).toContain('Old meetup');
  });
});
