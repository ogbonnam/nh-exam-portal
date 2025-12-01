// // app/teacher/dashboard/Filters.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, usePathname, useSearchParams } from "next/navigation";

// interface FiltersProps {
//   yearGroups: string[];
//   yearGroupClasses: Record<string, string[]>;
//   initialYear?: string;
//   initialClass?: string;
// }

// export default function Filters({
//   yearGroups,
//   yearGroupClasses,
//   initialYear,
//   initialClass,
// }: FiltersProps) {
//   const router = useRouter();
//   const pathname = usePathname();
//   const searchParams = useSearchParams();

//   const [yearGroup, setYearGroup] = useState(initialYear || "");
//   const [className, setClassName] = useState(initialClass || "");

//   useEffect(() => {
//     setYearGroup(initialYear || "");
//     setClassName(initialClass || "");
//   }, [initialYear, initialClass]);

//   const handleChange = (newYear?: string, newClass?: string) => {
//     const params = new URLSearchParams(searchParams as any);
//     if (newYear !== undefined) params.set("yearGroup", newYear);
//     if (newClass !== undefined) params.set("className", newClass);

//     if (newYear === "") params.delete("yearGroup");
//     if (newClass === "") params.delete("className");

//     params.set("page", "1"); // reset to first page on filter
//     router.push(`${pathname}?${params.toString()}`);
//   };

//   const onYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setYearGroup(e.target.value);
//     setClassName(""); // reset class
//     handleChange(e.target.value, "");
//   };

//   const onClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setClassName(e.target.value);
//     handleChange(yearGroup, e.target.value);
//   };

//   const onClear = () => {
//     setYearGroup("");
//     setClassName("");
//     router.push(pathname);
//   };

//   return (
//     <div className="flex gap-4 mb-6 items-center">
//       <label>Year Group:</label>
//       <select value={yearGroup} onChange={onYearChange}>
//         <option value="">All</option>
//         {yearGroups.map((y) => (
//           <option key={y} value={y}>
//             {y}
//           </option>
//         ))}
//       </select>

//       <label>Class Name:</label>
//       <select value={className} onChange={onClassChange} disabled={!yearGroup}>
//         <option value="">All</option>
//         {(yearGroup ? yearGroupClasses[yearGroup] || [] : []).map((c) => (
//           <option key={c} value={c}>
//             {c}
//           </option>
//         ))}
//       </select>

//       <button
//         onClick={onClear}
//         className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
//       >
//         Clear
//       </button>
//     </div>
//   );
// }

"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface FiltersProps {
  yearGroups: string[];
  yearGroupClasses: Record<string, string[]>;
  academicYears: string[];
  terms: string[];
  subterms: string[];
  initialYear?: string;
  initialClass?: string;
  initialAcademicYear?: string;
  initialTerm?: string;
  initialSubterm?: string;
}

export default function Filters({
  yearGroups,
  yearGroupClasses,
  academicYears,
  terms,
  subterms,
  initialYear,
  initialClass,
  initialAcademicYear,
  initialTerm,
  initialSubterm,
}: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1"); // Reset to first page when filtering
    router.push(`?${params.toString()}`);
  };

  // Sort academic years by the starting year (e.g., "2023-2024" -> 2023)
  const sortedAcademicYears = [...academicYears].sort((a, b) => {
    const yearA = parseInt(a.split('-')[0]);
    const yearB = parseInt(b.split('-')[0]);
    return yearA - yearB;
  });

  // Sort terms in the order: AUTUMN, SPRING, SUMMER
  const termOrder = ['AUTUMN', 'SPRING', 'SUMMER'];
  const sortedTerms = [...terms].sort((a, b) => termOrder.indexOf(a) - termOrder.indexOf(b));

  // Sort subterms in the order: MIDTERM, END_OF_TERM
  const subtermOrder = ['MIDTERM', 'END_OF_TERM'];
  const sortedSubterms = [...subterms].sort((a, b) => subtermOrder.indexOf(a) - subtermOrder.indexOf(b));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Academic Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Academic Year
          </label>
          <select
            value={initialAcademicYear || ""}
            onChange={(e) => updateFilter("academicYear", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Academic Years</option>
            {sortedAcademicYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Term Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Term
          </label>
          <select
            value={initialTerm || ""}
            onChange={(e) => updateFilter("term", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Terms</option>
            {sortedTerms.map((term) => (
              <option key={term} value={term}>
                {term.charAt(0) + term.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Subterm Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subterm
          </label>
          <select
            value={initialSubterm || ""}
            onChange={(e) => updateFilter("subterm", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subterms</option>
            {sortedSubterms.map((subterm) => (
              <option key={subterm} value={subterm}>
                {subterm === "MIDTERM" ? "Midterm" : "End of Term"}
              </option>
            ))}
          </select>
        </div>

        {/* Year Group Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year Group
          </label>
          <select
            value={initialYear || ""}
            onChange={(e) => updateFilter("yearGroup", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Year Groups</option>
            {yearGroups.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Class Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class
          </label>
          <select
            value={initialClass || ""}
            onChange={(e) => updateFilter("className", e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Classes</option>
            {initialYear &&
              yearGroupClasses[initialYear]?.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
          </select>
        </div>
      </div>
    </div>
  );
}