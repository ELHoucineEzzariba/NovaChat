const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

const relativeFormatter = new Intl.RelativeTimeFormat("de", { numeric: "auto" });

export function relativeTime(timestamp: number): string {
  let duration = (timestamp - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return relativeFormatter.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return relativeFormatter.format(Math.round(duration), "years");
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function formatDateHeading(timestamp: number): string {
  const date = new Date(timestamp);
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);

  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";

  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });
}
