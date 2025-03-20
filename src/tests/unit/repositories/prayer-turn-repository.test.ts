import { PrismaClient, PrayerTurnType } from "@prisma/client";
import { PrismaPrayerTurnRepository } from "@p40/repositories/prayer-turn/prisma-repository";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

describe("PrismaPrayerTurnRepository", () => {
  let prisma: DeepMockProxy<PrismaClient>;
  let repository: PrismaPrayerTurnRepository;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    repository = new PrismaPrayerTurnRepository(prisma);
  });

  afterEach(() => {
    mockReset(prisma);
  });

  describe("create", () => {
    it("should create a prayer turn with user shift", async () => {
      const mockData = {
        userId: "123e4567-e89b-12d3-a456-426614174000",
        eventId: "123e4567-e89b-12d3-a456-426614174001",
        startTime: "10:00",
        weekday: 1,
      };

      const mockResult = {
        id: "123e4567-e89b-12d3-a456-426614174002",
        type: PrayerTurnType.SHIFT,
        startTime: "10:00",
        endTime: "10:00",
        duration: 60,
        weekday: 1,
        allowChangeAfterStart: true,
        eventId: mockData.eventId,
        createdAt: new Date(),
        updatedAt: new Date(),
        userShifts: [
          {
            id: "123e4567-e89b-12d3-a456-426614174003",
            userId: mockData.userId,
            prayerTurnId: "123e4567-e89b-12d3-a456-426614174002",
            user: {
              id: mockData.userId,
              name: "Test User",
              whatsapp: null,
              email: "test@example.com",
              imageUrl: null,
            },
          },
        ],
        event: {
          id: mockData.eventId,
          name: "Test Event",
          churchId: "123e4567-e89b-12d3-a456-426614174004",
        },
      };

      prisma.prayerTurn.create.mockResolvedValue(mockResult);

      const result = await repository.create(mockData);

      expect(prisma.prayerTurn.create).toHaveBeenCalledWith({
        data: {
          type: "SHIFT",
          startTime: mockData.startTime,
          endTime: mockData.startTime,
          duration: 60,
          weekday: mockData.weekday,
          event: { connect: { id: mockData.eventId } },
          userShifts: {
            create: {
              userId: mockData.userId,
            },
          },
        },
        include: {
          userShifts: {
            include: {
              user: true,
            },
          },
          event: true,
        },
      });

      expect(result).toEqual(mockResult);
    });
  });

  describe("findById", () => {
    it("should find a prayer turn by id", async () => {
      const mockId = "123e4567-e89b-12d3-a456-426614174000";
      const mockResult = {
        id: mockId,
        type: PrayerTurnType.SHIFT,
        startTime: "10:00",
        endTime: "11:00",
        duration: 60,
        weekday: 1,
        allowChangeAfterStart: true,
        eventId: "123e4567-e89b-12d3-a456-426614174001",
        createdAt: new Date(),
        updatedAt: new Date(),
        userShifts: [],
        event: {
          id: "123e4567-e89b-12d3-a456-426614174001",
          name: "Test Event",
          churchId: "123e4567-e89b-12d3-a456-426614174002",
        },
      };

      prisma.prayerTurn.findUnique.mockResolvedValue(mockResult);

      const result = await repository.findById(mockId);

      expect(prisma.prayerTurn.findUnique).toHaveBeenCalledWith({
        where: { id: mockId },
        include: {
          userShifts: {
            include: {
              user: true,
            },
          },
          event: true,
        },
      });

      expect(result).toEqual(mockResult);
    });

    it("should return null when prayer turn is not found", async () => {
      const mockId = "123e4567-e89b-12d3-a456-426614174000";

      prisma.prayerTurn.findUnique.mockResolvedValue(null);

      const result = await repository.findById(mockId);

      expect(result).toBeNull();
    });
  });

  describe("getEventStats", () => {
    it("should calculate event statistics correctly", async () => {
      const mockEventId = "123e4567-e89b-12d3-a456-426614174000";
      const mockTurns = [
        {
          id: "1",
          weekday: 0,
          type: PrayerTurnType.SHIFT,
          startTime: "10:00",
          endTime: "11:00",
          duration: 60,
          eventId: mockEventId,
          allowChangeAfterStart: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userShifts: [{ userId: "user1" }, { userId: "user2" }],
          event: {
            id: mockEventId,
            name: "Test Event",
            churchId: "church1",
          },
        },
        {
          id: "2",
          weekday: 1,
          type: PrayerTurnType.SHIFT,
          startTime: "11:00",
          endTime: "12:00",
          duration: 60,
          eventId: mockEventId,
          allowChangeAfterStart: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userShifts: [{ userId: "user1" }],
          event: {
            id: mockEventId,
            name: "Test Event",
            churchId: "church1",
          },
        },
        {
          id: "3",
          weekday: 1,
          type: PrayerTurnType.SHIFT,
          startTime: "12:00",
          endTime: "13:00",
          duration: 60,
          eventId: mockEventId,
          allowChangeAfterStart: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          userShifts: [],
          event: {
            id: mockEventId,
            name: "Test Event",
            churchId: "church1",
          },
        },
      ];

      prisma.prayerTurn.findMany.mockResolvedValue(mockTurns);

      const result = await repository.getEventStats(mockEventId);

      expect(result).toEqual({
        distinctLeaders: 2,
        singleLeaderSlots: 1,
        filledTimeSlots: 2,
        emptyTimeSlots: 1,
        expectedSlotsWeek: 3,
        filledSlotsByWeekday: [1, 1, 0, 0, 0, 0, 0],
        emptySlotsByWeekday: [0, 1, 0, 0, 0, 0, 0],
      });
    });
  });
});
