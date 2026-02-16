import { CalendarIcon, RefreshIcon } from "./Icons";

type ClassManagementHeaderProps = {
  onRefresh: () => void;
};

export default function ClassManagementHeader({
  onRefresh,
}: ClassManagementHeaderProps) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon />
          <h1 className="text-xl font-bold text-slate-800">
            Class Management
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 shadow-sm"
          >
            <RefreshIcon />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
