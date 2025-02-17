export const today = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
  new Date().getDay()
];

export const createTurns = (shiftDuration: number) => {
  const endHour = 23;
  const turns = [];
  let currentHour = 0;

  while (currentHour <= endHour) {
    const startTime = `${String(currentHour).padStart(2, "0")}:00`;
    const endTime = `${String(
      currentHour + Math.floor(shiftDuration / 60)
    ).padStart(2, "0")}:${String(shiftDuration % 60).padStart(2, "0")}`;

    turns.push({
      startTime,
      endTime,
    });
    currentHour += Math.floor(shiftDuration / 60);

    if (currentHour > endHour) break;
  }

  return turns;
};
