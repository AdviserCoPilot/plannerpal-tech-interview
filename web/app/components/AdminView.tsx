import { useCallback, useEffect, useState } from "react";
import { Class, AdminRegistration } from "../types";
import { API_URL } from "../utils";
import { ListIcon } from "./Icons";

type AdminViewProps = {
  classes: Class[];
};

export default function AdminView({ classes }: AdminViewProps) {
  const [allRegs, setAllRegs] = useState<AdminRegistration[]>([]);

  const fetchAllRegs = useCallback(() => {
    fetch(`${API_URL}/registrations/all`)
      .then((r) => r.json())
      .then(setAllRegs)
      .catch(() => setAllRegs([]));
  }, []);

  useEffect(() => {
    fetchAllRegs();
    const interval = setInterval(fetchAllRegs, 3000);
    return () => clearInterval(interval);
  }, [fetchAllRegs]);

  const regsByClass = classes.map((c) => ({
    ...c,
    registrations: allRegs.filter((r) => r.class_id === c.id),
  }));

  return (
    <div className="space-y-6">
      {regsByClass.map((c) => {
        const reg = parseInt(c.registered_count, 10);
        const full = reg >= c.capacity;

        return (
          <div
            key={c.id}
            className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">
                  {c.name}
                </h3>
                {c.description && (
                  <p className="text-sm text-slate-500 mt-0.5">
                    {c.description}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    full
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {reg} / {c.capacity} spots filled
                </span>
              </div>
            </div>
            {c.registrations.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-2.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="text-left py-2.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-2.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {c.registrations.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-3 px-6 text-sm font-medium text-slate-800">
                        {r.parent_name}
                      </td>
                      <td className="py-3 px-6 text-sm text-slate-500">
                        {r.parent_email}
                      </td>
                      <td className="py-3 px-6">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          REGISTERED
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-sm text-slate-400 text-center">
                No registrations yet
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
