import React from 'react';

const roles = [
  { key: 'Admin', desc: 'Configure, generate, and publish schedules' },
  { key: 'Faculty', desc: 'View schedule, mark unavailability' },
  { key: 'Student', desc: 'View published timetables' },
];

export default function RoleTabs({ role, setRole }) {
  return (
    <div className="w-full">
      <div className="inline-flex rounded-xl p-1 bg-neutral-100 border border-neutral-200">
        {roles.map((r) => (
          <button
            key={r.key}
            onClick={() => setRole(r.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              role === r.key
                ? 'bg-white shadow-sm border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-white'
            }`}
          >
            {r.key}
          </button>
        ))}
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        {roles.find((r) => r.key === role)?.desc}
      </p>
    </div>
  );
}
