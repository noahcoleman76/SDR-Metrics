import { BarChart3, BriefcaseBusiness, CheckSquare, CircleDollarSign, Flag, LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/accounts", label: "Accounts", icon: BriefcaseBusiness },
  { to: "/opportunities", label: "Opportunities", icon: CircleDollarSign },
  { to: "/stage-0", label: "Stage 0", icon: Flag },
  { to: "/arr-actuals", label: "ARR Actuals", icon: BarChart3 }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-20 border-r border-slate-200 bg-white/95 px-3 py-4 md:flex md:flex-col">
        <div className="mb-6 flex h-10 items-center justify-center rounded-xl bg-slate-950 text-sm font-semibold text-white">SDR</div>
        <nav className="flex flex-1 flex-col gap-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                clsx("focus-ring flex h-11 items-center justify-center rounded-xl transition", isActive ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950")
              }
            >
              <item.icon size={20} />
            </NavLink>
          ))}
        </nav>
        <button title={`Logout ${user?.email}`} className="focus-ring flex h-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100" onClick={() => void logout()}>
          <LogOut size={20} />
        </button>
      </aside>
      <div className="border-b border-slate-200 bg-white px-3 py-2 md:hidden">
        <div className="flex gap-1 overflow-x-auto">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx("flex min-w-11 items-center justify-center rounded-lg px-3 py-2", isActive ? "bg-sky-50 text-sky-700" : "text-slate-500")}>
              <item.icon size={19} />
            </NavLink>
          ))}
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-6 md:pl-28 md:pr-8">
        <Outlet />
      </main>
    </div>
  );
}
