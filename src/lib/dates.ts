export type DateLike = Date | { toDate: () => Date };

const ptBrDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const ptBrDateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function toDate(value: DateLike): Date {
  return value instanceof Date ? value : value.toDate();
}

export function formatDate(value: DateLike): string {
  return ptBrDateFormatter.format(toDate(value));
}

export function formatDateTime(value: DateLike): string {
  return ptBrDateTimeFormatter.format(toDate(value));
}

export function parseDateInput(value: string): Date {
  const [yearPart, monthPart, dayPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  const day = Number(dayPart);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function toDateInputValue(value: DateLike): string {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function calculateAge(birthDate: DateLike, referenceDate = new Date()): number {
  const birth = toDate(birthDate);
  let age = referenceDate.getFullYear() - birth.getFullYear();
  const monthDiff = referenceDate.getMonth() - birth.getMonth();
  const dayDiff = referenceDate.getDate() - birth.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return Math.max(0, age);
}

export function daysBetween(start: DateLike, end: DateLike = new Date()): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startMs = toDate(start).getTime();
  const endMs = toDate(end).getTime();
  return Math.floor((endMs - startMs) / msPerDay);
}

export function daysAgo(days: number, from = new Date()): Date {
  const result = new Date(from);
  result.setDate(result.getDate() - days);
  return result;
}
