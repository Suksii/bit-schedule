import {
  pgTable,
  serial,
  varchar,
  date,
  timestamp,
  smallint,
  time,
  text,
  integer,
} from "drizzle-orm/pg-core";

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 200 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  weekStart: date("week_start").notNull().unique(),
  holidayDays: text("holiday_days").notNull().default("[]"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),
  scheduleId: integer("schedule_id")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id, { onDelete: "cascade" }),
  dayOfWeek: smallint("day_of_week").notNull(),
  startTime: time("start_time"),
  endTime: time("end_time"),
  note: text("note"),
  slotKey: varchar("slot_key", { length: 20 }).notNull().default("jutarnja"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;
export type Schedule = typeof schedules.$inferSelect;
export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
