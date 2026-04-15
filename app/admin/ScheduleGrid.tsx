"use client";

import { useRouter } from "next/navigation";
import { useOptimistic, useTransition, useState } from "react";
import {
  assignSlot,
  removeShift,
  toggleHoliday,
  resetSchedule,
} from "@/app/actions/schedule";
import {
  SHIFT_SLOTS,
  DAYS,
  DAYS_SHORT,
  DAY_ORDER,
  getDisplayName,
} from "@/lib/utils";
import { THEME } from "@/lib/theme";
import { X, Check, RotateCcw } from "lucide-react";

type Employee = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
};

type ShiftAssignment = {
  id: number;
  employeeId: number;
  employeeName: string;
  dayOfWeek: number;
  slotKey: string;
  startTime: string | null;
  endTime: string | null;
};

type OptimisticAction =
  | { type: "add"; assignment: ShiftAssignment }
  | { type: "remove"; shiftId: number }
  | { type: "reset" };

type Props = {
  weekStart: string;
  weekDates: string[];
  employees: Employee[];
  assignments: ShiftAssignment[];
  holidayDays: number[];
};

const normalSlots = SHIFT_SLOTS.filter((s) => ["jutarnja", "popodnevna", "nocna"].includes(s.key));
const specialSlots = SHIFT_SLOTS.filter((s) => ["obuka", "mob_rez"].includes(s.key));
const leaveSlots = SHIFT_SLOTS.filter((s) => ["godisnji"].includes(s.key));

export default function ScheduleGrid({
  weekStart,
  weekDates,
  employees,
  assignments,
  holidayDays,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [selectedEmp, setSelectedEmp] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const [optimisticAssignments, dispatchOptimistic] = useOptimistic(
    assignments,
    (state: ShiftAssignment[], action: OptimisticAction) => {
      if (action.type === "add") {
        const exists = state.some(
          (a) =>
            a.employeeId === action.assignment.employeeId &&
            a.dayOfWeek === action.assignment.dayOfWeek &&
            a.slotKey === action.assignment.slotKey,
        );
        return exists ? state : [...state, action.assignment];
      }
      if (action.type === "remove") {
        return state.filter((a) => a.id !== action.shiftId);
      }
      if (action.type === "reset") {
        return [];
      }
      return state;
    },
  );

  const allEmployeeNames = employees.map((e) => e.name);

  const cellMap: Record<string, ShiftAssignment[]> = {};
  for (const a of optimisticAssignments) {
    const key = `${a.slotKey}-${a.dayOfWeek}`;
    if (!cellMap[key]) cellMap[key] = [];
    cellMap[key].push(a);
  }

  function doAssign(slotKey: string, dayOfWeek: number, employeeId: number) {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;
    startTransition(async () => {
      dispatchOptimistic({
        type: "add",
        assignment: {
          id: -Date.now(),
          employeeId,
          employeeName: emp.name,
          dayOfWeek,
          slotKey,
          startTime: null,
          endTime: null,
        },
      });
      await assignSlot(weekStart, slotKey, dayOfWeek, employeeId);
      router.refresh();
    });
  }

  function handleEmpClick(emp: Employee) {
    setSelectedEmp((prev) =>
      prev?.id === emp.id ? null : { id: emp.id, name: emp.name },
    );
  }

  function handleCellClick(
    e: React.MouseEvent,
    slotKey: string,
    dayOfWeek: number,
  ) {
    if (!selectedEmp) return;
    e.stopPropagation();
    doAssign(slotKey, dayOfWeek, selectedEmp.id);
  }

  function handleDragStart(e: React.DragEvent, employeeId: number) {
    e.dataTransfer.setData("employeeId", String(employeeId));
    e.dataTransfer.effectAllowed = "copy";
    setSelectedEmp(null);
  }

  function handleDragOver(e: React.DragEvent, cellKey: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverCell(cellKey);
  }

  function handleDragLeave() {
    setDragOverCell(null);
  }

  function handleDrop(e: React.DragEvent, slotKey: string, dayOfWeek: number) {
    e.preventDefault();
    setDragOverCell(null);
    const employeeId = parseInt(e.dataTransfer.getData("employeeId"));
    if (!employeeId) return;
    doAssign(slotKey, dayOfWeek, employeeId);
  }

  function handleRemove(e: React.MouseEvent, shiftId: number) {
    e.stopPropagation();
    startTransition(async () => {
      dispatchOptimistic({ type: "remove", shiftId });
      await removeShift(shiftId);
      router.refresh();
    });
  }

  function handleReset() {
    startTransition(async () => {
      dispatchOptimistic({ type: "reset" });
      await resetSchedule(weekStart);
      router.refresh();
    });
  }

  function handleToggleHoliday(day: number) {
    startTransition(async () => {
      await toggleHoliday(weekStart, day);
      router.refresh();
    });
  }

  const isWeekend = (col: number) => col === 0 || col === 6;
  const isHoliday = (col: number) => holidayDays.includes(DAY_ORDER[col]);

  function renderRows(slots: (typeof SHIFT_SLOTS)[number][]) {
    return slots.map((slot) => {
      return (
        <tr key={slot.key} className={THEME.cell.normal}>
          <td className="px-4 py-3 border border-gray-300 font-semibold whitespace-nowrap text-gray-700">
            {slot.label}
          </td>
          {Array.from({ length: 7 }, (_, col) => {
            const day = DAY_ORDER[col];
            const cellKey = `${slot.key}-${day}`;
            const cell = cellMap[cellKey] || [];
            const isDragOver = dragOverCell === cellKey;
            const isClickTarget = !!selectedEmp;
            const weekend = isWeekend(col);
            const holiday = isHoliday(col);

            return (
              <td
                key={col}
                onClick={(e) => handleCellClick(e, slot.key, day)}
                onDragOver={(e) => handleDragOver(e, cellKey)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, slot.key, day)}
                className={[
                  "px-2 py-4 border border-gray-300 align-top transition-colors",
                  weekend ? THEME.cell.weekend : THEME.cell.normal,
                  isDragOver ? THEME.cell.dragOver : "",
                  isClickTarget && !isDragOver ? THEME.cell.clickTarget : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="flex flex-col gap-1 min-h-8">
                  {cell.map((a) => (
                    <div
                      key={a.id}
                      className={`flex items-center gap-1 border rounded px-1.5 py-0.5 group transition-opacity ${
                        a.id < 0
                          ? THEME.chip.pending
                          : holiday
                            ? THEME.chip.holiday
                            : THEME.chip.normal
                      }`}
                    >
                      <span
                        className={`text-xs font-medium flex-1 ${
                          holiday
                            ? THEME.chip.holidayText
                            : THEME.chip.normalText
                        }`}
                      >
                        {getDisplayName(a.employeeName, allEmployeeNames)}
                      </span>
                      {a.id > 0 && (
                        <button
                          onClick={(e) => handleRemove(e, a.id)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity ${THEME.chip.removeBtn}`}
                          title="Ukloni"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </td>
            );
          })}
        </tr>
      );
    });
  }

  return (
    <div onClick={() => setSelectedEmp(null)}>
      {/* Employee palette */}
      <div
        className="mb-4 flex items-start justify-between gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap gap-2">
          {employees.map((emp) => {
            const isSelected = selectedEmp?.id === emp.id;
            return (
              <div
                key={emp.id}
                draggable
                onDragStart={(e) => handleDragStart(e, emp.id)}
                onClick={() => handleEmpClick(emp)}
                className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1 rounded select-none transition-all shadow-sm cursor-pointer ${
                  isSelected ? THEME.palette.chipSelected : THEME.palette.chip
                }`}
              >
                {emp.name}
                <span
                  className={`text-xs ml-1 ${isSelected ? "text-slate-300" : "text-slate-300"}`}
                >
                  {
                    optimisticAssignments.filter((a) => a.employeeId === emp.id)
                      .length
                  }
                </span>
                {isSelected && (
                  <Check
                    size={13}
                    className={`ml-1 ${THEME.palette.checkIcon}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <div className="w-full flex justify-end">
        <button
          onClick={handleReset}
          disabled={optimisticAssignments.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 mb-4 text-sm rounded-md border transition-colors shrink-0 disabled:opacity-40 disabled:cursor-not-allowed border-red-200 text-red-500 hover:bg-red-50 hover:border-red-400 disabled:hover:bg-transparent disabled:hover:border-red-200"
          title="Resetuj raspored"
        >
          <RotateCcw size={14} /> Reset
        </button>
      </div>

      {/* Schedule grid */}
      <div className="overflow-x-auto" onClick={(e) => e.stopPropagation()}>
        <table className="w-full border-collapse bg-white rounded-lg shadow text-sm border border-gray-300">
          <thead>
            <tr className={THEME.header.row1}>
              <th className="text-left px-4 py-3 font-semibold w-36 border border-gray-600">
                Smjena
              </th>
              {DAYS_SHORT.map((_d, i) => {
                const holiday = isHoliday(i);
                const weekend = isWeekend(i);
                return (
                  <th
                    key={i}
                    className="px-2 py-3 font-semibold text-center min-w-27.5 select-none border border-gray-600"
                  >
                    <button
                      onClick={() => handleToggleHoliday(DAY_ORDER[i])}
                      title={
                        holiday
                          ? "Ukloni oznaku praznika"
                          : "Označi kao praznik"
                      }
                      className={`w-full rounded py-0.5 transition-colors ${
                        holiday
                          ? `${THEME.day.holiday} hover:text-red-300`
                          : weekend
                            ? `${THEME.day.weekend} hover:text-red-400`
                            : `${THEME.day.normal} hover:text-red-400`
                      }`}
                    >
                      <div className="font-bold uppercase text-xs">
                        {DAYS[i]}
                      </div>
                      <div className="text-xs font-normal opacity-70">
                        {weekDates[i]}
                      </div>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {renderRows(normalSlots)}

            <tr aria-hidden="true">
              <td colSpan={8} className="h-3 border-0 p-0" />
            </tr>

            {renderRows(specialSlots)}

            <tr aria-hidden="true">
              <td colSpan={8} className="h-3 border-0 p-0" />
            </tr>

            {renderRows(leaveSlots)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
