export const DAYS = [
  "Nedjelja",
  "Ponedjeljak",
  "Utorak",
  "Srijeda",
  "Četvrtak",
  "Petak",
  "Subota",
];
export const DAYS_SHORT = ["Ned", "Pon", "Uto", "Sri", "Čet", "Pet", "Sub"];

export const DAY_ORDER = [6, 0, 1, 2, 3, 4, 5];

export const SHIFT_SLOTS = [
  {
    key: "jutarnja",
    label: "05:30 – 13:30",
    startTime: "05:30",
    endTime: "13:30",
  },
  {
    key: "popodnevna",
    label: "13:00 – 21:00",
    startTime: "13:00",
    endTime: "21:00",
  },
  {
    key: "nocna",
    label: "17:00 – 00:00",
    startTime: "17:00",
    endTime: "00:00",
  },
  { key: "obuka", label: "OBUKA", startTime: null, endTime: null },
  { key: "mob_rez", label: "MOB. REŽ", startTime: null, endTime: null },
  { key: "godisnji", label: "GOD. ODMOR", startTime: null, endTime: null },
] as const;

export type SlotKey = (typeof SHIFT_SLOTS)[number]["key"];

export function getDisplayName(fullName: string, allNames: string[]): string {
  const firstName = fullName.split(" ")[0];
  const hasDuplicate = allNames.some(
    (n) => n !== fullName && n.split(" ")[0] === firstName,
  );
  if (hasDuplicate) {
    const parts = fullName.split(" ");
    return parts.length > 1 ? `${firstName} ${parts[1][0]}.` : firstName;
  }
  return firstName;
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEnd(sundayStr: string): string {
  const d = new Date(sundayStr + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return toISODate(d);
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("sr-Latn-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Maj",
  "Jun",
  "Jul",
  "Avg",
  "Sep",
  "Okt",
  "Nov",
  "Dec",
];

export function getWeekDates(sundayStr: string): string[] {
  const sunday = new Date(sundayStr + "T00:00:00");
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return `${d.getDate()}. ${MONTH_SHORT[d.getMonth()]}`;
  });
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addWeeks(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n * 7);
  return toISODate(d);
}
