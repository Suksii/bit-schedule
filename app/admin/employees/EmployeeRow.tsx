"use client";

import { useState, useTransition } from "react";
import { Trash2, Pencil, Check, X } from "lucide-react";
import { updateEmployee, deleteEmployee } from "@/app/actions/schedule";
import Input from "@/app/components/Input";

type Employee = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
};

export default function EmployeeRow({ emp }: { emp: Employee }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSave(fd: FormData) {
    startTransition(async () => {
      await updateEmployee(emp.id, fd);
      setEditing(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteEmployee(emp.id);
    });
  }

  if (editing) {
    return (
      <li className="px-6 py-3 bg-slate-50">
        <form action={handleSave} className="flex items-center gap-2 flex-wrap">
          <Input
            name="name"
            defaultValue={emp.name}
            required
            placeholder="Ime i prezime"
          />
          <Input
            name="phone"
            defaultValue={emp.phone ?? ""}
            placeholder="Telefon"
          />
          <Input
            name="email"
            type="email"
            defaultValue={emp.email ?? ""}
            placeholder="Email"
          />
          <button
            type="submit"
            disabled={pending}
            className="text-green-600 hover:text-green-800 transition-colors"
            title="Sačuvaj"
          >
            <Check size={16} />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Otkaži"
          >
            <X size={16} />
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between px-6 py-3">
      <div>
        <span className="font-medium text-gray-800">{emp.name}</span>
        <div className="flex gap-4 mt-0.5">
          {emp.phone && (
            <span className="text-xs text-gray-400">{emp.phone}</span>
          )}
          {emp.email && (
            <span className="text-xs text-gray-400">{emp.email}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setEditing(true)}
          className="text-gray-400 hover:text-blue-600 transition-colors"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-red-400 hover:text-red-600 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </li>
  );
}
