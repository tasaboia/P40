export class Helpers {
  static getInitials(fullName: string): string {
    const nameParts = fullName.split(" ");
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
  }
  static getFirstAndLastName = (fullName: string): string => {
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0]
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

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
}
