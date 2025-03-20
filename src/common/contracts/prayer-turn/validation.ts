import { z } from "zod";

export const LeaderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  whatsapp: z.string(),
  imageUrl: z.string().url(),
  email: z.string().email(),
  churchId: z.string().uuid(),
});

export const PrayerTurnSchema = z.object({
  id: z.string().uuid(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  duration: z.number().min(1),
  allowChangeAfterStart: z.boolean(),
  weekday: z.number().min(0).max(6),
  leaders: z.array(LeaderSchema),
});

export const CreatePrayerTurnDTOSchema = z.object({
  userId: z.string().uuid(),
  eventId: z.string().uuid(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  weekday: z
    .union([z.string().transform((val) => parseInt(val)), z.number()])
    .refine((val) => val >= 0 && val <= 6, {
      message: "Weekday must be between 0 and 6",
    }),
});

export const RemovePrayerTurnDTOSchema = z.object({
  userId: z.string().uuid(),
  prayerTurnId: z.string().uuid(),
});

export const PrayerTurnStatsSchema = z.object({
  distinctLeaders: z.number().min(0),
  singleLeaderSlots: z.number().min(0),
  filledTimeSlots: z.number().min(0),
  emptyTimeSlots: z.number().min(0),
  expectedSlotsWeek: z.number().min(0),
  filledSlotsByWeekday: z.array(z.number().min(0)).length(7),
  emptySlotsByWeekday: z.array(z.number().min(0)).length(7),
});

export const ChartDataSchema = z.object({
  day: z.number().min(0).max(6),
  people: z.number().min(0),
  emptySlots: z.number().min(0),
});
