import React, { useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import RoleTabs from './components/RoleTabs';
import StatsCards from './components/StatsCards';
import TimetableEditor from './components/TimetableEditor';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SLOTS = ['8-9', '9-10', '10-11', '11-12', '1-2', '2-3'];

export default function App() {
  const [role, setRole] = useState('Admin');
  const [notifications, setNotifications] = useState([
    { id: 1, msg: 'Welcome to ATGS — build your schedule visually.' },
  ]);

  // Sample seed data (can be replaced via CSV import)
  const [courses, setCourses] = useState([
    { id: 'CSE101', name: 'Data Structures', faculty: 'Dr. Rao', dept: 'CSE', hours: 3 },
    { id: 'CSE205', name: 'Operating Systems', faculty: 'Dr. Mehta', dept: 'CSE', hours: 3 },
    { id: 'ECE110', name: 'Digital Logic', faculty: 'Prof. Iyer', dept: 'ECE', hours: 3 },
    { id: 'MAT201', name: 'Linear Algebra', faculty: 'Dr. Singh', dept: 'Math', hours: 3 },
    { id: 'HUM105', name: 'Communication Skills', faculty: 'Ms. Das', dept: 'HSS', hours: 2 },
  ]);

  const [classrooms] = useState([
    { id: 'R101', name: 'Room 101', capacity: 60 },
    { id: 'R202', name: 'Room 202', capacity: 45 },
    { id: 'LAB3', name: 'Lab 3', capacity: 30 },
  ]);

  const [faculty] = useState([
    { id: 'F1', name: 'Dr. Rao', maxLoad: 12 },
    { id: 'F2', name: 'Dr. Mehta', maxLoad: 12 },
    { id: 'F3', name: 'Prof. Iyer', maxLoad: 10 },
    { id: 'F4', name: 'Dr. Singh', maxLoad: 10 },
    { id: 'F5', name: 'Ms. Das', maxLoad: 8 },
  ]);

  const emptyGrid = useMemo(() => {
    const base = {};
    for (const d of DAYS) {
      base[d] = {};
      for (const s of SLOTS) base[d][s] = { courseId: null, roomId: null };
    }
    return base;
  }, []);

  const [timetable, setTimetable] = useState(emptyGrid);
  const [currentFaculty, setCurrentFaculty] = useState('Dr. Rao');

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <Navbar role={role} notifications={notifications} />
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <RoleTabs role={role} setRole={setRole} />
          <div className="text-sm text-neutral-600">
            {notifications[0]?.msg || 'No notifications'}
          </div>
        </div>

        {/* Stats always visible to give context */}
        <StatsCards timetable={timetable} courses={courses} classrooms={classrooms} />

        {/* Role-based workspace */}
        <section className="space-y-4">
          {role === 'Admin' && (
            <TimetableEditor
              mode="admin"
              timetable={timetable}
              setTimetable={setTimetable}
              courses={courses}
              setCourses={setCourses}
              classrooms={classrooms}
              faculty={faculty}
              notifications={notifications}
              setNotifications={setNotifications}
              currentFaculty={currentFaculty}
              setCurrentFaculty={setCurrentFaculty}
            />
          )}

          {role === 'Faculty' && (
            <TimetableEditor
              mode="faculty"
              timetable={timetable}
              setTimetable={setTimetable}
              courses={courses}
              setCourses={setCourses}
              classrooms={classrooms}
              faculty={faculty}
              notifications={notifications}
              setNotifications={setNotifications}
              currentFaculty={currentFaculty}
              setCurrentFaculty={setCurrentFaculty}
            />
          )}

          {role === 'Student' && (
            <TimetableEditor
              mode="student"
              timetable={timetable}
              setTimetable={setTimetable}
              courses={courses}
              setCourses={setCourses}
              classrooms={classrooms}
              faculty={faculty}
              notifications={notifications}
              setNotifications={setNotifications}
              currentFaculty={currentFaculty}
              setCurrentFaculty={setCurrentFaculty}
            />
          )}
        </section>
      </main>
      <footer className="py-6 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} ATGS · Built with React + Tailwind
      </footer>
    </div>
  );
}
