import { Class, MyRegistrations } from "../types";
import { formatDate } from "../utils";
import { ListIcon, PlusIcon } from "./Icons";

type ClassTableProps = {
  classes: Class[];
  myRegs: MyRegistrations | null;
  busy: string | null;
  onRegister: (classId: string) => void;
};

export default function ClassTable({
  classes,
  myRegs,
  busy,
  onRegister,
}: ClassTableProps) {
  const isRegistered = (classId: string) =>
    myRegs?.registrations?.some((r) => r.class_id === classId);

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h2 className="flex items-center gap-2 text-slate-800 font-semibold">
          <ListIcon />
          All Classes
          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
            {classes.length}
          </span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Class
              </th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Schedule
              </th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Spots
              </th>
              <th className="text-left py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => {
              const reg = c.registered_count;
              const full = reg >= c.capacity;
              const registered = isRegistered(c.id);

              return (
                <tr
                  key={c.id}
                  className="border-b border-slate-100 hover:bg-slate-50/50 transition"
                >
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-slate-800">{c.name}</div>
                      {c.description && (
                        <div className="text-sm text-slate-500 mt-0.5">
                          {c.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">
                    {formatDate(c.start_time)}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        full
                          ? "bg-amber-100 text-amber-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {full ? "FULL" : `${c.capacity - reg} LEFT`}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    {registered ? (
                      <span className="text-sm font-medium text-emerald-600">
                        ✓ Registered
                      </span>
                    ) : full ? (
                      <span className="text-sm text-slate-400">
                        Unavailable
                      </span>
                    ) : (
                      <button
                        onClick={() => onRegister(c.id)}
                        disabled={!!busy}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-300 bg-white text-emerald-600 text-sm font-medium hover:bg-emerald-50 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <PlusIcon />
                        {busy === c.id ? "…" : "Register"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
