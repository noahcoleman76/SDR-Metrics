import { BarChart3, BriefcaseBusiness, CheckSquare, CircleDollarSign, Flag, LogOut, Settings } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logoUrl from "../assets/sdr-logo.png";

const nav = [
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/accounts", label: "Accounts", icon: BriefcaseBusiness },
  { to: "/opportunities", label: "Opportunities", icon: CircleDollarSign },
  { to: "/stage-0", label: "Stage 0", icon: Flag },
  { to: "/arr-actuals", label: "ARR Actuals", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useTheme();
  return (
    <div className="theme-shell min-h-screen text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-28 border-r border-slate-200 bg-white/95 px-4 py-4 md:flex md:flex-col">
        <button className="logo-backdrop focus-ring mb-6 flex h-20 items-center justify-center rounded-xl border border-slate-200 shadow-sm transition hover:scale-[1.02]" onClick={toggleMode} type="button" title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
          <img src={logoUrl} alt="SDR Metrics" className="h-16 w-16 object-contain" />
        </button>
        <nav className="flex flex-1 flex-col gap-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                clsx("focus-ring flex h-11 items-center justify-center rounded-xl transition", isActive ? "accent-gradient text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-950")
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
        <div className="flex items-center gap-2 overflow-x-auto">
          <button className="logo-backdrop focus-ring flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl border border-slate-200" onClick={toggleMode} type="button" title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
            <img src={logoUrl} alt="SDR Metrics" className="h-16 w-16 object-contain" />
          </button>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => clsx("flex min-w-11 items-center justify-center rounded-lg px-3 py-2", isActive ? "accent-gradient text-white" : "text-slate-500")}>
              <item.icon size={19} />
            </NavLink>
          ))}
        </div>
      </div>
      <main className="w-full px-4 py-4 md:pl-32 md:pr-4 md:py-4 lg:pl-32 lg:pr-5">
        <Outlet />
      </main>
    </div>
  );
}
