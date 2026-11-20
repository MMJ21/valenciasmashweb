export const MADRID_TIME_ZONE = "Europe/Madrid";

export interface SeasonPeriod {
  readonly key: string;
  readonly startDate: string;
  readonly endDate: string;
}

/** Derives the semester from a timestamp using the calendar date in Madrid. */
export function getSeasonPeriod(date: Date): SeasonPeriod {
  if (Number.isNaN(date.getTime())) {
    throw new Error("La fecha del semestre no es válida.");
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: MADRID_TIME_ZONE,
    year: "numeric",
    month: "numeric",
  }).formatToParts(date);
  const yearPart = parts.find((part) => part.type === "year")?.value;
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const year = Number(yearPart);
  if (
    yearPart === undefined ||
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new Error("No se pudo determinar el semestre para la fecha.");
  }

  const semester = month <= 6 ? 1 : 2;
  return {
    key: `${year}-S${semester}`,
    startDate: `${year}-${semester === 1 ? "01-01" : "07-01"}`,
    endDate: `${year}-${semester === 1 ? "06-30" : "12-31"}`,
  };
}
