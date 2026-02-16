import { Parent } from "../types";
import { CalendarIcon, ListIcon } from "./Icons";

function ShieldIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

type HeaderProps = {
  parents: Parent[];
  selectedParent: string;
  onParentChange: (parentId: string) => void;
  view: "classes" | "admin";
  onViewChange: (view: "classes" | "admin") => void;
};

export default function Header({
  parents,
  selectedParent,
  onParentChange,
  view,
  onViewChange,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon />
          <span className="font-semibold text-slate-800 text-lg">
            Atlas Academy
          </span>
        </div>
        <nav className="flex items-center gap-1">
          <button
            onClick={() => onViewChange("admin")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === "admin"
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldIcon />
            Admin View
          </button>
          <button
            onClick={() => onViewChange("classes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              view === "classes"
                ? "bg-violet-600 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ListIcon />
            Class View
          </button>
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-sm">Booking as</span>
            <select
              value={selectedParent}
              onChange={(e) => onParentChange(e.target.value)}
              aria-label="Select parent"
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
