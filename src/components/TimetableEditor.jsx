import React, { useMemo, useState } from 'react';
import { Upload, Play, CheckCircle2, Trash2 } from 'lucide-react';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOTS = ['8-9', '9-10', '10-11', '11-12', '1-2', '2-3'];

export default function TimetableEditor({
  mode = 'student',
  timetable,
  setTimetable,
  courses,
  setCourses,
  classrooms,
  faculty,
  notifications,
  setNotifications,
  currentFaculty,
  setCurrentFaculty,
}) {
  const [csvError, setCsvError] = useState('');

  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses]);

  const handleDragStart = (e, courseId) => {
    e.dataTransfer.setData('text/plain', courseId);
  };

  const onDropCell = (day, slot, e) => {
    const courseId = e.dataTransfer.getData('text/plain');
    if (!courseId) return;

    const course = courseById[courseId];
    if (!course) return;

    // Constraint: prevent double-booking same faculty in the same cell if already occupied by same faculty
    if (hasFacultyClash(timetable, courseById, course.faculty, day, slot, courseId)) {
      notify(`Clash: ${course.faculty} already has a class at ${day} ${slot}`);
      return;
    }

    const next = structuredClone(timetable);
    next[day][slot] = { courseId, roomId: next[day][slot]?.roomId || null };
    setTimetable(next);
    notify(`Placed ${course.name} at ${day} ${slot}`);
  };

  const clearCell = (day, slot) => {
    const next = structuredClone(timetable);
    next[day][slot] = { courseId: null, roomId: null };
    setTimetable(next);
  };

  const setRoomForCell = (day, slot, roomId) => {
    const next = structuredClone(timetable);
    next[day][slot] = { ...(next[day][slot] || {}), roomId };
    setTimetable(next);
  };

  const notify = (msg) => {
    setNotifications((prev) => [{ id: Date.now(), msg }, ...prev].slice(0, 6));
  };

  const unscheduled = useMemo(() => {
    const scheduledIds = new Set();
    DAYS.forEach((d) =>
      SLOTS.forEach((s) => {
        const cell = timetable[d][s];
        if (cell?.courseId) scheduledIds.add(cell.courseId);
      })
    );
    return courses.filter((c) => !scheduledIds.has(c.id));
  }, [timetable, courses]);

  const handleCsv = async (file) => {
    setCsvError('');
    try {
      const text = await file.text();
      const rows = text.trim().split(/\r?\n/);
      const header = rows.shift()?.split(',').map((h) => h.trim().toLowerCase());
      if (!header) throw new Error('Empty CSV');

      // Expecting for courses: id,name,faculty,dept,hours
      if (header.includes('id') && header.includes('name') && header.includes('faculty')) {
        const parsed = rows
          .map((line) => line.split(',').map((x) => x.trim()))
          .map((cols) => Object.fromEntries(cols.map((v, i) => [header[i], v])));
        const mapped = parsed.map((r, idx) => ({
          id: r.id || `C-${Date.now()}-${idx}`,
          name: r.name,
          faculty: r.faculty,
          dept: r.dept || 'General',
          hours: Number(r.hours || 3),
        }));
        setCourses((prev) => {
          const exist = new Set(prev.map((p) => p.id));
          return [...prev, ...mapped.filter((m) => !exist.has(m.id))];
        });
        notify(`Imported ${mapped.length} courses from CSV`);
      } else {
        throw new Error('Unsupported CSV. Include headers: id,name,faculty,dept,hours');
      }
    } catch (e) {
      setCsvError(e.message);
    }
  };

  const autoGenerate = () => {
    // Very naive backtracking: iterate courses and place in first available slot without faculty clash
    const next = structuredClone(timetable);
    const placed = new Set();
    for (const course of courses) {
      outer: for (const d of DAYS) {
        for (const s of SLOTS) {
          const cell = next[d][s];
          if (!cell?.courseId && !hasFacultyClash(next, courseById, course.faculty, d, s, course.id)) {
            next[d][s] = { courseId: course.id, roomId: null };
            placed.add(course.id);
            break outer;
          }
        }
      }
    }
    setTimetable(next);
    notify(`Auto-scheduled ${placed.size} courses`);
  };

  const schedule = useMemo(() => timetable, [timetable]);

  return (
    <div className="grid lg:grid-cols-12 gap-6">
      <div className="lg:col-span-3 space-y-4">
        {mode === 'admin' && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Admin Actions</h3>
              <span className="text-xs text-neutral-500">CSV / Generate</span>
            </div>
            <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-neutral-300 hover:bg-neutral-50 cursor-pointer">
              <Upload size={16} />
              <span className="text-sm">Import Courses CSV</span>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleCsv(e.target.files[0])}
                className="hidden"
              />
            </label>
            {csvError && <p className="text-xs text-rose-600">{csvError}</p>}
            <button onClick={autoGenerate} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
              <Play size={16} /> One-click Generate
            </button>
            <button onClick={() => notify('Timetable published to all users')} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100">
              <CheckCircle2 size={16} /> Approve & Publish
            </button>
          </div>
        )}

        {mode === 'faculty' && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3">
            <h3 className="font-medium">Faculty Panel</h3>
            <select
              value={currentFaculty}
              onChange={(e) => setCurrentFaculty(e.target.value)}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm"
            >
              {Array.from(new Set(faculty.map((f) => f.name))).map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <p className="text-xs text-neutral-600">Tip: Drag courses into the grid. You cannot double-book yourself.</p>
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <h3 className="font-medium mb-3">Unscheduled Courses</h3>
          <div className="flex flex-wrap gap-2">
            {unscheduled.length === 0 && (
              <p className="text-sm text-neutral-500">All courses are scheduled 🎉</p>
            )}
            {unscheduled.map((c) => (
              <div
                key={c.id}
                draggable={mode !== 'student'}
                onDragStart={(e) => handleDragStart(e, c.id)}
                className={`px-2.5 py-1.5 rounded-lg text-sm border ${
                  mode !== 'student' ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-60'
                } bg-white hover:bg-neutral-50`}
                title={`${c.name} • ${c.faculty}`}
              >
                <span className="font-medium">{c.name}</span>
                <span className="text-neutral-500"> · {c.faculty}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-9 space-y-4">
        <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
          <div className="grid grid-cols-6 bg-neutral-50 border-b border-neutral-200">
            <div className="p-3 text-xs font-medium text-neutral-500">Day / Slot</div>
            {SLOTS.map((s) => (
              <div key={s} className="p-3 text-xs font-medium text-neutral-600 border-l border-neutral-200">{s}</div>
            ))}
          </div>
          {DAYS.map((day) => (
            <div key={day} className="grid grid-cols-6 border-b last:border-b-0 border-neutral-200">
              <div className="p-3 text-sm font-medium text-neutral-700 bg-neutral-50">{day}</div>
              {SLOTS.map((slot) => {
                const cell = schedule[day][slot];
                const course = courseById[cell?.courseId];
                return (
                  <div
                    key={slot}
                    onDragOver={(e) => mode !== 'student' && e.preventDefault()}
                    onDrop={(e) => mode !== 'student' && onDropCell(day, slot, e)}
                    className={`min-h-[76px] p-2 border-l border-neutral-200 ${
                      mode !== 'student' ? 'bg-white hover:bg-neutral-50' : 'bg-white'
                    }`}
                  >
                    {!course ? (
                      <div className="h-full w-full rounded-md border border-dashed border-neutral-300 text-neutral-400 text-xs grid place-items-center">
                        Drop here
                      </div>
                    ) : (
                      <div className="h-full w-full rounded-md border border-neutral-200 p-2 bg-gradient-to-br from-indigo-50 to-violet-50">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium leading-5">{course.name}</p>
                            <p className="text-xs text-neutral-500">{course.faculty} · {course.dept}</p>
                          </div>
                          {mode !== 'student' && (
                            <button
                              onClick={() => clearCell(day, slot)}
                              className="p-1 rounded-md hover:bg-white/60"
                              title="Remove"
                            >
                              <Trash2 size={14} className="text-neutral-500" />
                            </button>
                          )}
                        </div>
                        <div className="mt-2">
                          <label className="text-xs text-neutral-500">Room</label>
                          <select
                            disabled={mode === 'student'}
                            value={cell?.roomId || ''}
                            onChange={(e) => setRoomForCell(day, slot, e.target.value)}
                            className="w-full mt-1 text-sm border border-neutral-200 rounded-md px-2 py-1 bg-white"
                          >
                            <option value="">Select room</option>
                            {classrooms.map((r) => (
                              <option key={r.id} value={r.id}>{r.name} • {r.capacity}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-sm">
            Download PDF
          </button>
          <button onClick={() => notify('Exported calendar (.ics) sent to your inbox')} className="px-3 py-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-sm">
            Export Calendar (.ics)
          </button>
        </div>
      </div>
    </div>
  );
}

function hasFacultyClash(timetable, courseById, facultyName, day, slot, candidateCourseId) {
  const cell = timetable[day][slot];
  if (!cell?.courseId) return false;
  if (cell.courseId === candidateCourseId) return false;
  const occupying = courseById[cell.courseId];
  return occupying && occupying.faculty === facultyName;
}
