// utils/availableDayMapper.ts
export const getAllowedDaysIndexes = (availableDays: string[]) => {
  const map: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  return availableDays.map(day => map[day]);
};
