import {
  CreatePrayerTurnDTOSchema,
  PrayerTurnSchema,
  RemovePrayerTurnDTOSchema,
  PrayerTurnStatsSchema,
  ChartDataSchema,
} from "@p40/common/contracts/prayer-turn/validation";

describe("PrayerTurn Validation", () => {
  describe("CreatePrayerTurnDTO", () => {
    it("should validate a valid DTO", () => {
      const validDTO = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        eventId: "123e4567-e89b-12d3-a456-426614174001",
        startTime: "10:00",
        weekday: 1,
      };

      const result = CreatePrayerTurnDTOSchema.safeParse(validDTO);
      expect(result.success).toBe(true);
    });

    it("should reject invalid weekday", () => {
      const invalidDTO = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        eventId: "123e4567-e89b-12d3-a456-426614174001",
        startTime: "10:00",
        weekday: 7, // Inválido: deve ser entre 0 e 6
      };

      const result = CreatePrayerTurnDTOSchema.safeParse(invalidDTO);
      expect(result.success).toBe(false);
    });

    it("should accept weekday as string and convert to number", () => {
      const stringWeekdayDTO = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        eventId: "123e4567-e89b-12d3-a456-426614174001",
        startTime: "10:00",
        weekday: "1",
      };

      const result = CreatePrayerTurnDTOSchema.safeParse(stringWeekdayDTO);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.weekday).toBe("number");
        expect(result.data.weekday).toBe(1);
      }
    });

    it("should reject invalid time format", () => {
      const invalidTimeDTO = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        eventId: "123e4567-e89b-12d3-a456-426614174001",
        startTime: "25:00", // Inválido: hora não pode ser maior que 23
        weekday: 1,
      };

      const result = CreatePrayerTurnDTOSchema.safeParse(invalidTimeDTO);
      expect(result.success).toBe(false);
    });
  });

  describe("RemovePrayerTurnDTO", () => {
    it("should validate a valid removal DTO", () => {
      const validDTO = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        prayerTurnId: "123e4567-e89b-12d3-a456-426614174001",
      };

      const result = RemovePrayerTurnDTOSchema.safeParse(validDTO);
      expect(result.success).toBe(true);
    });

    it("should reject invalid IDs", () => {
      const invalidDTO = {
        userId: "invalid-uuid",
        prayerTurnId: "123e4567-e89b-12d3-a456-426614174001",
      };

      const result = RemovePrayerTurnDTOSchema.safeParse(invalidDTO);
      expect(result.success).toBe(false);
    });
  });

  describe("PrayerTurn", () => {
    it("should validate a valid prayer turn", () => {
      const validPrayerTurn = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        allowChangeAfterStart: true,
        weekday: 1,
        leaders: [
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            name: "John Doe",
            whatsapp: "+5511999999999",
            imageUrl: "https://example.com/image.jpg",
            email: "john@example.com",
            churchId: "123e4567-e89b-12d3-a456-426614174002",
          },
        ],
      };

      const result = PrayerTurnSchema.safeParse(validPrayerTurn);
      expect(result.success).toBe(true);
    });

    it("should reject invalid duration", () => {
      const invalidPrayerTurn = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        startTime: "10:00",
        endTime: "11:00",
        duration: 0, // Inválido: duração deve ser maior que 0
        allowChangeAfterStart: true,
        weekday: 1,
        leaders: [
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            name: "John Doe",
            whatsapp: "+5511999999999",
            imageUrl: "https://example.com/image.jpg",
            email: "john@example.com",
            churchId: "123e4567-e89b-12d3-a456-426614174002",
          },
        ],
      };

      const result = PrayerTurnSchema.safeParse(invalidPrayerTurn);
      expect(result.success).toBe(false);
    });

    it("should reject leader with invalid email", () => {
      const invalidPrayerTurn = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        allowChangeAfterStart: true,
        weekday: 1,
        leaders: [
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            name: "John Doe",
            whatsapp: "+5511999999999",
            imageUrl: "https://example.com/image.jpg",
            email: "invalid-email", // Email inválido
            churchId: "123e4567-e89b-12d3-a456-426614174002",
          },
        ],
      };

      const result = PrayerTurnSchema.safeParse(invalidPrayerTurn);
      expect(result.success).toBe(false);
    });

    it("should reject invalid time format in endTime", () => {
      const invalidPrayerTurn = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        startTime: "10:00",
        endTime: "24:00", // Hora inválida
        duration: 60,
        allowChangeAfterStart: true,
        weekday: 1,
        leaders: [
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            name: "John Doe",
            whatsapp: "+5511999999999",
            imageUrl: "https://example.com/image.jpg",
            email: "john@example.com",
            churchId: "123e4567-e89b-12d3-a456-426614174002",
          },
        ],
      };

      const result = PrayerTurnSchema.safeParse(invalidPrayerTurn);
      expect(result.success).toBe(false);
    });

    it("should reject invalid URL in leader imageUrl", () => {
      const invalidPrayerTurn = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        allowChangeAfterStart: true,
        weekday: 1,
        leaders: [
          {
            id: "123e4567-e89b-12d3-a456-426614174001",
            name: "John Doe",
            whatsapp: "+5511999999999",
            imageUrl: "invalid-url", // URL inválida
            email: "john@example.com",
            churchId: "123e4567-e89b-12d3-a456-426614174002",
          },
        ],
      };

      const result = PrayerTurnSchema.safeParse(invalidPrayerTurn);
      expect(result.success).toBe(false);
    });
  });

  describe("PrayerTurnStats", () => {
    it("should validate valid stats", () => {
      const validStats = {
        distinctLeaders: 5,
        singleLeaderSlots: 3,
        filledTimeSlots: 10,
        emptyTimeSlots: 2,
        expectedSlotsWeek: 12,
        filledSlotsByWeekday: [2, 1, 2, 1, 2, 1, 1],
        emptySlotsByWeekday: [0, 1, 0, 1, 0, 0, 0],
      };

      const result = PrayerTurnStatsSchema.safeParse(validStats);
      expect(result.success).toBe(true);
    });

    it("should reject negative numbers", () => {
      const invalidStats = {
        distinctLeaders: -1, // Número negativo inválido
        singleLeaderSlots: 3,
        filledTimeSlots: 10,
        emptyTimeSlots: 2,
        expectedSlotsWeek: 12,
        filledSlotsByWeekday: [2, 1, 2, 1, 2, 1, 1],
        emptySlotsByWeekday: [0, 1, 0, 1, 0, 0, 0],
      };

      const result = PrayerTurnStatsSchema.safeParse(invalidStats);
      expect(result.success).toBe(false);
    });

    it("should reject arrays with wrong length", () => {
      const invalidStats = {
        distinctLeaders: 5,
        singleLeaderSlots: 3,
        filledTimeSlots: 10,
        emptyTimeSlots: 2,
        expectedSlotsWeek: 12,
        filledSlotsByWeekday: [2, 1, 2, 1, 2, 1], // Faltando um dia
        emptySlotsByWeekday: [0, 1, 0, 1, 0, 0, 0],
      };

      const result = PrayerTurnStatsSchema.safeParse(invalidStats);
      expect(result.success).toBe(false);
    });
  });

  describe("ChartData", () => {
    it("should validate valid chart data", () => {
      const validData = {
        day: 0,
        people: 5,
        emptySlots: 2,
      };

      const result = ChartDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject invalid day", () => {
      const invalidData = {
        day: 7, // Dia inválido
        people: 5,
        emptySlots: 2,
      };

      const result = ChartDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject negative values", () => {
      const invalidData = {
        day: 0,
        people: -1, // Número negativo inválido
        emptySlots: 2,
      };

      const result = ChartDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
