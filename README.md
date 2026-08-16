# Online Organizer

A daily planner for adding, editing, completing, and reviewing events. Angular is the core, with Angular CDK, date-fns, Zod, and a production service worker.

Events stay on this device. Data from the first AngularJS version is imported automatically.

## Getting started

```bash
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200).

```bash
npm test
npm run build
```

## Layout

```
src/app/
  app.ts                 shell, shortcuts, routing outlet
  core/                  models, services, date helpers
  shared/                calendar, cards, form, week board
  features/              home, completed, profile
```

## Stack

- **Angular 22** — standalone components, signals, lazy routes, view transitions
- **Angular CDK** — drag a card onto a calendar day to reschedule
- **date-fns** — week board and date shifting
- **Zod** — event draft validation
- **Angular service worker** — installable PWA in production builds
