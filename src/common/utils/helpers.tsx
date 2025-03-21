import { Weekday } from "../contracts/week/schedule";

export class Helpers {
  static getInitials(fullName: string): string {
    const nameParts = fullName.split(" ");
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
  }
  static getFirstAndLastName = (fullName: string): string => {
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0]
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

    if (nameParts.length === 1) {
      return firstName;
    }

    const lastName = nameParts[nameParts.length - 1]
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return `${firstName} ${lastName}`;
  };

  static isEventStarted = (eventStartDate: string) => {
    if (!eventStartDate) return false;

    const now = new Date();
    const eventDate = new Date(eventStartDate);

    return now >= eventDate;
  };

  static isCurrentTurn = (
    turnStartTime: string | undefined,
    duration: number | undefined,
    weekday: number
  ) => {
    if (!turnStartTime || !duration || !weekday) return false;

    const now = new Date();
    const todayWeekday = now.getDay();

    if (todayWeekday !== weekday) return false;

    const [turnStartHour, turnStartMinute] = turnStartTime
      .split(":")
      .map(Number);

    const turnStart = new Date();
    turnStart.setHours(turnStartHour, turnStartMinute, 0, 0);

    const turnEnd = new Date(turnStart);
    turnEnd.setMinutes(turnEnd.getMinutes() + duration);

    return now >= turnStart && now <= turnEnd;
  };

  static formatTime(timeString) {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  }

  static formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  static formatPercentage(value) {
    return `${Math.round(value)}%`;
  }

  static getWeekdayName(weekdayIndex: number) {
    const days: Weekday[] = [
      Weekday.Sun,
      Weekday.Mon,
      Weekday.Tue,
      Weekday.Wed,
      Weekday.Thu,
      Weekday.Fri,
      Weekday.Sat,
    ];

    return days[weekdayIndex];
  }
}
