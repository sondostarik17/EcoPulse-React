import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ChartNoAxesCombined,
  Settings,
  ExternalLink,
  Leaf,
  ShieldCheck,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "Reports Management",
    path: "/admin/reports",
    icon: ClipboardList,
  },
  {
    label: "Users Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Analytics",
    path: "/admin/analytics",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/[0.07] bg-[#0B0D0C] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[82px] shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            
            <div>
              <h2 className="text-xl font-black tracking-tight">
                Eco<span className="text-emerald-400">Pulse</span>
              </h2>

              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">
                Admin Workspace
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-400 hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Main navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-7">
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[2px] text-gray-500">
            Workspace
          </p>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/10"
                        : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
                    }`
                  }
                >
                  <Icon size={19} strokeWidth={1.9} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="my-7 border-t border-white/[0.07]" />

          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[2px] text-gray-500">
            Quick Access
          </p>

          <Link
            to="/"
            onClick={onClose}
            className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ExternalLink size={18} />
            <span>User Website</span>
          </Link>
        </div>

        {/* Sidebar footer */}
        <div className="shrink-0 border-t border-white/[0.07] p-4">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.06] p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck
                size={17}
                className="text-emerald-400"
              />

              <span className="text-sm font-bold text-white">
                Admin Workspace
              </span>
            </div>

            <p className="mt-2 text-xs leading-5 text-gray-500">
              Manage reports and support a cleaner community.
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Leaf size={14} />
              EcoPulse Mission
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}