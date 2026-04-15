export const dynamic = "force-dynamic";

import { getScheduleWithShifts, getEmployees } from "@/app/actions/schedule";
import { logout } from "@/app/actions/auth";
import {
  getWeekStart,
  getWeekEnd,
  toISODate,
  addWeeks,
  getWeekDates,
  formatDate,
} from "@/lib/utils";
import { THEME } from "@/lib/theme";
import Link from "next/link";
import ScheduleGrid from "./ScheduleGrid";
import TopBar from "@/app/components/TopBar";
import { ChevronLeft, ChevronRight, ArrowRight, ExternalLink } from "lucide-react";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const today = new Date();
  const defaultWeek = toISODate(getWeekStart(today));
  const weekStart = params.week || defaultWeek;

  const [data, allEmployees] = await Promise.all([
    getScheduleWithShifts(weekStart),
    getEmployees(),
  ]);

  const weekDates = getWeekDates(weekStart);
  const prevWeek = addWeeks(weekStart, -1);
  const nextWeek = addWeeks(weekStart, 1);

  const assignments = (data?.shifts ?? []).map((s) => ({
    id: s.id,
    employeeId: s.employeeId,
    employeeName: s.employeeName,
    dayOfWeek: s.dayOfWeek,
    slotKey: s.slotKey,
    startTime: s.startTime,
    endTime: s.endTime,
  }));
  const holidayDays = data?.holidayDays ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar
        navItems={[
          { label: "Raspored", href: "/admin", active: true },
          { label: "Zaposleni", href: "/admin/employees" },
          { label: "Pregled", href: "/schedule", target: "_blank", icon: <ExternalLink size={13} /> },
        ]}
        right={
          <form action={logout}>
            <button type="submit" className={THEME.topbar.navLink}>Odjavi se</button>
          </form>
        }
      />

      {/* ── Week navigation sub-header ── */}
      <div className={`${THEME.subheader.bg} px-4 py-2`}>
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href={`/admin?week=${prevWeek}`} className={THEME.subheader.navBtn}>
            <ChevronLeft size={16} /> Prethodna
          </Link>
          <span className={THEME.subheader.label}>
            {formatDate(weekStart)} – {formatDate(getWeekEnd(weekStart))}
          </span>
          <Link href={`/admin?week=${nextWeek}`} className={THEME.subheader.navBtn}>
            Sljedeća <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {allEmployees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 mb-3">Nema zaposlenih.</p>
            <Link href="/admin/employees" className="text-blue-600 hover:underline text-sm">
              <span className="flex items-center gap-1 justify-center">Dodajte zaposlene <ArrowRight size={14} /></span>
            </Link>
          </div>
        ) : (
          <ScheduleGrid
            weekStart={weekStart}
            weekDates={weekDates}
            employees={allEmployees}
            assignments={assignments}
            holidayDays={holidayDays}
          />
        )}
      </main>
    </div>
  );
}
