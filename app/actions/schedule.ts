"use server";

import { db } from "@/lib/db";
import { employees, schedules, shifts } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getEmployees() {
  return db.select().from(employees).orderBy(employees.name);
}

export async function addEmployee(formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const phone = (formData.get("phone") as string).trim();
  const email = (formData.get("email") as string).trim();
  if (!name) return { error: "Ime je obavezno." };
  await db
    .insert(employees)
    .values({ name, phone: phone || null, email: email || null });
  revalidatePath("/admin/employees");
  revalidatePath("/admin");
}

export async function updateEmployee(id: number, formData: FormData) {
  const name = (formData.get("name") as string).trim();
  const phone = (formData.get("phone") as string).trim();
  const email = (formData.get("email") as string).trim();
  if (!name) return { error: "Ime je obavezno." };
  await db
    .update(employees)
    .set({ name, phone: phone || null, email: email || null })
    .where(eq(employees.id, id));
  revalidatePath("/admin/employees");
  revalidatePath("/admin");
  revalidatePath("/schedule");
}

export async function deleteEmployee(id: number) {
  await db.delete(employees).where(eq(employees.id, id));
  revalidatePath("/admin/employees");
  revalidatePath("/admin");
  revalidatePath("/schedule");
}

export async function getOrCreateSchedule(weekStart: string) {
  const existing = await db
    .select()
    .from(schedules)
    .where(eq(schedules.weekStart, weekStart));
  if (existing.length > 0) return existing[0];
  const created = await db.insert(schedules).values({ weekStart }).returning();
  return created[0];
}

export async function getScheduleWithShifts(weekStart: string) {
  const schedule = await db
    .select()
    .from(schedules)
    .where(eq(schedules.weekStart, weekStart));
  if (!schedule[0]) return null;
  const scheduleShifts = await db
    .select({
      id: shifts.id,
      employeeId: shifts.employeeId,
      dayOfWeek: shifts.dayOfWeek,
      startTime: shifts.startTime,
      endTime: shifts.endTime,
      note: shifts.note,
      slotKey: shifts.slotKey,
      employeeName: employees.name,
    })
    .from(shifts)
    .innerJoin(employees, eq(shifts.employeeId, employees.id))
    .where(eq(shifts.scheduleId, schedule[0].id));
  const holidayDays: number[] = JSON.parse(schedule[0].holidayDays || "[]");
  return { schedule: schedule[0], shifts: scheduleShifts, holidayDays };
}

export async function toggleHoliday(weekStart: string, dayOfWeek: number) {
  const schedule = await getOrCreateSchedule(weekStart);
  const current: number[] = JSON.parse(schedule.holidayDays || "[]");
  const updated = current.includes(dayOfWeek)
    ? current.filter((d) => d !== dayOfWeek)
    : [...current, dayOfWeek];
  await db
    .update(schedules)
    .set({ holidayDays: JSON.stringify(updated) })
    .where(eq(schedules.id, schedule.id));
  revalidatePath("/admin");
  revalidatePath("/schedule");
}

export async function assignSlot(
  weekStart: string,
  slotKey: string,
  dayOfWeek: number,
  employeeId: number,
) {
  const schedule = await getOrCreateSchedule(weekStart);

  const existing = await db
    .select()
    .from(shifts)
    .where(
      and(
        eq(shifts.scheduleId, schedule.id),
        eq(shifts.employeeId, employeeId),
        eq(shifts.dayOfWeek, dayOfWeek),
        eq(shifts.slotKey, slotKey),
      ),
    );

  if (existing.length === 0) {
    await db.insert(shifts).values({
      scheduleId: schedule.id,
      employeeId,
      dayOfWeek,
      slotKey,
      startTime: null,
      endTime: null,
      note: null,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/schedule");
}

export async function removeShift(shiftId: number) {
  await db.delete(shifts).where(eq(shifts.id, shiftId));
  revalidatePath("/admin");
  revalidatePath("/schedule");
}

export async function updateShiftTime(
  shiftId: number,
  startTime: string | null,
  endTime: string | null,
) {
  await db
    .update(shifts)
    .set({ startTime, endTime })
    .where(eq(shifts.id, shiftId));
  revalidatePath("/admin");
  revalidatePath("/schedule");
}
