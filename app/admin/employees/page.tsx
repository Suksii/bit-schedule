import { getEmployees, addEmployee } from "@/app/actions/schedule";
import { logout } from "@/app/actions/auth";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { THEME } from "@/lib/theme";
import EmployeeRow from "./EmployeeRow";
import Input from "@/app/components/Input";

export default async function EmployeesPage() {
  const allEmployees = await getEmployees();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top bar ── */}
      <header className={`${THEME.topbar.bg} ${THEME.topbar.text} px-4`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className={THEME.topbar.logoWrap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/rtcg-logo.png" alt="RTCG" className="h-7 object-contain" />
            </div>
            <span className="font-bold text-sm tracking-wide">BROADCAST IT SISTEMI</span>
          </div>
          <nav className="flex items-center gap-1">
            <Link href="/admin" className={THEME.topbar.navLink}>
              Raspored
            </Link>
            <Link href="/admin/employees" className={THEME.topbar.navLinkActive}>
              Zaposleni
            </Link>
            <Link href="/schedule" target="_blank" className={`${THEME.topbar.navLink} flex items-center gap-1`}>
              Pregled <ExternalLink size={13} />
            </Link>
            <div className={`${THEME.topbar.divider} mx-2`} />
            <form action={logout}>
              <button type="submit" className={THEME.topbar.navLink}>
                Odjavi se
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Add employee form */} 
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Dodaj zaposlenog</h2>
          <form action={async (fd) => { "use server"; await addEmployee(fd); }} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input name="name" type="text" placeholder="Unesi ime i prezime..." label="Ime i prezime *" required />
            </div>
            <Input name="phone" type="text" placeholder="Unesi telefon..." label="Telefon" />
            <Input name="email" type="email" placeholder="Unesi email..." label="Email" />
            <button type="submit"
              className="col-span-2 bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors">
              Dodaj zaposlenog
            </button>
          </form>
        </div>

        {/* Employee list */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Zaposleni ({allEmployees.length})</h2>
          </div>
          {allEmployees.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Nema zaposlenih. Dodajte prvog.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {allEmployees.map((emp) => (
                <EmployeeRow key={emp.id} emp={emp} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
