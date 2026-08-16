import { z } from 'zod';

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeKey = z.string().regex(/^\d{2}:\d{2}$/);

export const eventDraftSchema = z
  .object({
    name: z.string().trim().min(2),
    description: z.string(),
    startDate: dateKey,
    endDate: dateKey,
    startTime: timeKey,
    endTime: timeKey,
    category: z.enum(['work', 'personal', 'health', 'other']),
    priority: z.enum(['low', 'medium', 'high']),
    location: z.string(),
    remind: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.endDate < value.startDate) {
      ctx.addIssue({ code: 'custom', path: ['endDate'], message: 'dateRange' });
    }
    if (value.startDate === value.endDate && value.endTime <= value.startTime) {
      ctx.addIssue({ code: 'custom', path: ['endTime'], message: 'timeRange' });
    }
  });

export type ParsedEventDraft = z.infer<typeof eventDraftSchema>;
