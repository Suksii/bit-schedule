export const dynamic = "force-dynamic";

import { getScheduleWithShifts, getEmployees } from "@/app/actions/schedule";
import {
  DAYS,
  DAY_ORDER,
  SHIFT_SLOTS,
  getWeekStart,
  getWeekEnd,
  toISODate,
  addWeeks,
  getWeekDates,
  formatDate,
  getDisplayName,
} from "@/lib/utils";
import { THEME } from "@/lib/theme";
import Link from "next/link";
import { redirect } from "next/navigation";
import PrintButton from "./PrintButton";
import AutoRefresh from "./AutoRefresh";
import { ChevronLeft, ChevronRight } from "lucide-react";

const normalSlots = SHIFT_SLOTS.filter((s) =>
  ["jutarnja", "popodnevna", "nocna"].includes(s.key),
);
const specialSlots = SHIFT_SLOTS.filter((s) =>
  ["obuka", "mob_rez"].includes(s.key),
);

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const currentWeek = toISODate(getWeekStart(today));
  const nextAllowed = addWeeks(currentWeek, 1);

  const requested = params.week;
  if (requested && requested !== currentWeek && requested !== nextAllowed) {
    redirect(`/schedule?week=${currentWeek}`);
  }

  const weekStart = requested || currentWeek;

  const [data, allEmployees] = await Promise.all([
    getScheduleWithShifts(weekStart),
    getEmployees(),
  ]);

  const weekDates = getWeekDates(weekStart);
  const nextWeek = addWeeks(weekStart, 1);
  const isCurrentWeek = weekStart === currentWeek;
  const isNextWeek = weekStart === nextAllowed;
  const holidayDays: number[] = data?.holidayDays ?? [];

  const allShiftNames = [
    ...new Set((data?.shifts ?? []).map((s) => s.employeeName)),
  ];

  type Assignment = {
    id: number;
    employeeName: string;
    startTime: string | null;
    endTime: string | null;
  };
  const cellMap: Record<string, Assignment[]> = {};
  for (const shift of data?.shifts ?? []) {
    const key = `${shift.slotKey}-${shift.dayOfWeek}`;
    if (!cellMap[key]) cellMap[key] = [];
    cellMap[key].push({
      id: shift.id,
      employeeName: shift.employeeName,
      startTime: shift.startTime,
      endTime: shift.endTime,
    });
  }

  const isWeekend = (col: number) => col === 0 || col === 6;
  const isHoliday = (col: number) => holidayDays.includes(DAY_ORDER[col]);

  // Print date range
  const MONTH_PRINT = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "avg", "sep", "okt", "nov", "dec"];
  const d = new Date(weekStart + "T00:00:00");
  const endDate = new Date(weekStart + "T00:00:00");
  endDate.setDate(endDate.getDate() + 6);
  const printRange = `${d.getDate()}. ${MONTH_PRINT[d.getMonth()]} – ${endDate.getDate()}. ${MONTH_PRINT[endDate.getMonth()]} ${endDate.getFullYear()}.`;

  function renderRows(slots: (typeof SHIFT_SLOTS)[number][]) {
    return slots.map((slot) => (
      <tr key={slot.key}>
        <td className="border border-gray-400 px-3 py-5 font-bold whitespace-nowrap text-center text-gray-800 bg-gray-50">
          {slot.label}
        </td>
        {Array.from({ length: 7 }, (_, col) => {
          const day = DAY_ORDER[col];
          const key = `${slot.key}-${day}`;
          const cell = cellMap[key] || [];
          const weekend = isWeekend(col);
          const holiday = isHoliday(col);

          return (
            <td
              key={col}
              className={`border border-gray-400 px-1 py-2 text-center align-middle ${
                weekend ? THEME.cell.weekend : THEME.cell.normal
              }`}
            >
              {cell.length > 0 && (
                <div className="flex flex-col items-center gap-0.5">
                  {cell.map((a) => {
                    const slotDef = SHIFT_SLOTS.find((s) => s.key === slot.key);
                    const hasCustomTime =
                      slotDef?.startTime &&
                      a.startTime &&
                      a.startTime.slice(0, 5) !== slotDef.startTime;
                    return (
                      <div key={a.id}>
                        {hasCustomTime && (
                          <div className={`font-semibold leading-tight ${THEME.name.accent}`} style={{ fontSize: "0.65rem" }}>
                            ({a.startTime?.slice(0, 5)} – {a.endTime?.slice(0, 5)})
                          </div>
                        )}
                        <div
                          className={`font-bold uppercase leading-tight ${
                            holiday || (weekend && hasCustomTime)
                              ? THEME.name.accent
                              : THEME.name.normal
                          }`}
                          style={{ fontSize: "0.7rem" }}
                        >
                          {getDisplayName(a.employeeName, allShiftNames)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </td>
          );
        })}
      </tr>
    ));
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      <AutoRefresh />

      {/* ── SCREEN top bar ────────────────────────────── */}
      <header className={`${THEME.topbar.bg} ${THEME.topbar.text} px-4 print:hidden`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className={THEME.topbar.logoWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rtcg-logo.png" alt="RTCG" className="h-7 object-contain" />
            </div>
            <span className="font-bold text-sm tracking-wide">BROADCAST IT SISTEMI</span>
          </div>
          <PrintButton />
        </div>
      </header>

      {/* ── SCREEN week navigation ─────────────────────── */}
      <div className={`${THEME.subheader.bg} px-4 py-2 print:hidden`}>
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          {!isCurrentWeek && (
            <Link href={`/schedule?week=${currentWeek}`} className={THEME.subheader.navBtn}>
              <ChevronLeft size={16} /> Prethodna
            </Link>
          )}
          <span className={THEME.subheader.label}>
            {formatDate(weekStart)} – {formatDate(getWeekEnd(weekStart))}
          </span>
          {!isNextWeek && (
            <Link href={`/schedule?week=${nextWeek}`} className={THEME.subheader.navBtn}>
              Sljedeća <ChevronRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* ── PRINT header ──────────────────────────────── */}
      <header className="hidden print:block px-8 pt-6 pb-4">
        <div className="flex items-center justify-between">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/rtcg-logo.png" alt="RTCG Logo" className="h-20 object-contain" />
          <div className="text-right">
            <h1 className="text-3xl font-black tracking-wide">BROADCAST IT SISTEMI</h1>
            <p className="text-sm font-semibold mt-1">{printRange}</p>
          </div>
        </div>
        <div className="mt-3 border-t-4 border-black" />
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 print:px-8 print:py-4 print:max-w-full">

        {/* Schedule table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white text-sm print:text-xs">
            <thead>
              {/* Row 1: day names */}
              <tr className={`${THEME.header.row1} print:bg-transparent print:text-black`}>
                <th className="border border-gray-400 px-3 py-1.5 w-28 print:w-24" />
                {Array.from({ length: 7 }, (_, i) => {
                  const holiday = isHoliday(i);
                  const weekend = isWeekend(i);
                  return (
                    <th key={i}
                      className={`border border-gray-400 px-2 py-1.5 text-center font-bold min-w-24 uppercase ${
                        holiday || weekend
                          ? `${THEME.day.holiday} ${THEME.day.printAccent}`
                          : `${THEME.day.normal} ${THEME.day.printNormal}`
                      }`}
                    >
                      {DAYS[i]}
                    </th>
                  );
                })}
              </tr>
              {/* Row 2: dates */}
              <tr className={`${THEME.header.row2} print:bg-transparent print:text-black`}>
                <th className="border border-gray-400 px-3 py-1" />
                {Array.from({ length: 7 }, (_, i) => {
                  const holiday = isHoliday(i);
                  const weekend = isWeekend(i);
                  return (
                    <th key={i}
                      className={`border border-gray-400 px-2 py-1 text-center font-normal text-xs ${
                        holiday || weekend
                          ? `${THEME.day.holiday} ${THEME.day.printAccent}`
                          : `${THEME.day.normalSubtext} ${THEME.day.printNormalSubtext}`
                      }`}
                    >
                      {weekDates[i]}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {renderRows(normalSlots)}

              {/* Spacer */}
              <tr aria-hidden="true">
                <td colSpan={8} className="h-3 border-0 p-0 print:h-2" />
              </tr>

              {renderRows(specialSlots)}
            </tbody>
          </table>
        </div>

        {/* ── Employee contact list (screen) ──────── */}
        {allEmployees.some((e) => e.phone || e.email) && (
          <>
            <div className="mt-8 print:hidden">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Kontakti</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {allEmployees.filter((e) => e.phone || e.email).map((emp) => (
                  <div key={emp.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex flex-col gap-1">
                    <span className="font-semibold text-gray-800 text-sm">{emp.name}</span>
                    {emp.phone && (
                      <a href={`tel:${emp.phone}`} className="text-xs text-gray-500 hover:text-gray-700 tabular-nums">
                        {emp.phone}
                      </a>
                    )}
                    {emp.email && (
                      <a href={`mailto:${emp.email}`} className="text-xs text-blue-600 hover:underline truncate">
                        {emp.email}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* ── PRINT footer ──────── */}
            <div className="hidden print:block mt-10">
              <table className="mx-auto text-xs">
                <tbody>
                  {allEmployees.filter((e) => e.phone || e.email).map((emp) => (
                    <tr key={emp.id}>
                      <td className="pr-4 py-0.5 text-right font-semibold">{emp.name}</td>
                      <td className="pr-6 py-0.5 tabular-nums">{emp.phone ?? ""}</td>
                      <td className="py-0.5 text-blue-700">{emp.email ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
