import { MyRegistrations } from "../types";
import { ListIcon } from "./Icons";

type MyBookingsProps = {
  myRegs: MyRegistrations;
  busy: string | null;
  onCancel: (regId: string) => void;
};

export default function MyBookings({ myRegs, busy, onCancel }: MyBookingsProps) {
  if (myRegs.registrations.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mb-6">
      <h2 className="flex items-center gap-2 text-slate-800 font-semibold mb-4">
        <ListIcon />
        My Bookings
        <span className="ml-2 px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
          {myRegs.registrations.length}
        </span>
      </h2>
      <div className="space-y-2">
        {myRegs.registrations.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
          >
            <div>
              <span className="font-medium text-slate-800">{r.class_name}</span>
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                REGISTERED
              </span>
            </div>
            <button
              onClick={() => onCancel(r.id)}
              disabled={!!busy}
              className="text-sm text-slate-500 hover:text-red-600 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
