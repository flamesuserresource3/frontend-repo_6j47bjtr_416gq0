import React from 'react';
import { Calendar, Bell } from 'lucide-react';

export default function Navbar({ role, notifications }) {
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 grid place-items-center text-white">
            <Calendar size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">ATGS</h1>
            <p className="text-xs text-neutral-500">Automatic Timetable Generator & Scheduler</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-neutral-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Role:</span>
            <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-medium">{role}</span>
          </div>
          <button className="relative p-2 rounded-lg border border-neutral-200 hover:bg-neutral-50">
            <Bell size={18} />
            {notifications?.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-[10px] text-white grid place-items-center">
                {notifications.length}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
