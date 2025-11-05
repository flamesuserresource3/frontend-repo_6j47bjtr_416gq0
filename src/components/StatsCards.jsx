import React, { useMemo } from 'react';
import { Users, Building2, BookOpen, CheckCircle2 } from 'lucide-react';

export default function StatsCards({ timetable, courses, classrooms }) {
  const stats = useMemo(() => {
    const days = Object.keys(timetable || {});
    const slots = days.length ? Object.keys(timetable[days[0]]) : [];
    let scheduledCount = 0;
    let roomUsage = {};

    days.forEach((d) => {
      slots.forEach((s) => {
        const cell = timetable[d][s];
        if (cell?.courseId) scheduledCount += 1;
        if (cell?.roomId) {
          roomUsage[cell.roomId] = (roomUsage[cell.roomId] || 0) + 1;
        }
      });
    });

    const totalSlots = days.length * slots.length;
    const utilization = totalSlots ? Math.round((scheduledCount / totalSlots) * 100) : 0;

    const mostUsedRoom = Object.entries(roomUsage)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      utilization,
      scheduledCount,
      totalSlots,
      courseCount: courses.length,
      roomCount: classrooms.length,
      mostUsedRoom: mostUsedRoom || '—',
    };
  }, [timetable, courses, classrooms]);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card icon={<CheckCircle2 className="text-emerald-600" size={18} />} title="Scheduled Slots" value={`${stats.scheduledCount}/${stats.totalSlots}`}>
        Overall utilization {stats.utilization}%
      </Card>
      <Card icon={<BookOpen className="text-indigo-600" size={18} />} title="Courses" value={stats.courseCount}>
        Active courses loaded
      </Card>
      <Card icon={<Building2 className="text-violet-600" size={18} />} title="Rooms" value={stats.roomCount}>
        Most used: {stats.mostUsedRoom}
      </Card>
      <Card icon={<Users className="text-amber-600" size={18} />} title="Engagement" value={`${Math.min(100, stats.utilization + 12)}%`}>
        Projected attendance
      </Card>
    </div>
  );
}

function Card({ icon, title, value, children }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className="h-10 w-10 grid place-items-center rounded-lg bg-neutral-100">
          {icon}
        </div>
      </div>
      <p className="text-xs text-neutral-500 mt-3">{children}</p>
    </div>
  );
}
