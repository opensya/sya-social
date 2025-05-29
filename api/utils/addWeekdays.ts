import dayjs from "dayjs";

// Fonction pour ajouter des jours sans compter les weekends
export default function addWeekdays(
  startDate: dayjs.Dayjs,
  daysToAdd: number,
): dayjs.Dayjs {
  let currentDate = startDate;

  while (daysToAdd > 0) {
    currentDate = currentDate.add(1, "day");

    // Si le jour est un samedi (6) ou un dimanche (0), on ne compte pas
    if (currentDate.day() !== 0 && currentDate.day() !== 6) {
      daysToAdd--;
    }
  }

  return currentDate;
}
