// app/teacher/dashboard/Filters.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface FiltersProps {
  yearGroups: string[];
  yearGroupClasses: Record<string, string[]>;
  initialYear?: string;
  initialClass?: string;
}

export default function Filters({
  yearGroups,
  yearGroupClasses,
  initialYear,
  initialClass,
}: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [yearGroup, setYearGroup] = useState(initialYear || "");
  const [className, setClassName] = useState(initialClass || "");

  useEffect(() => {
    setYearGroup(initialYear || "");
    setClassName(initialClass || "");
  }, [initialYear, initialClass]);

  const handleChange = (newYear?: string, newClass?: string) => {
    const params = new URLSearchParams(searchParams as any);
    if (newYear !== undefined) params.set("yearGroup", newYear);
    if (newClass !== undefined) params.set("className", newClass);

    if (newYear === "") params.delete("yearGroup");
    if (newClass === "") params.delete("className");

    params.set("page", "1"); // reset to first page on filter
    router.push(`${pathname}?${params.toString()}`);
  };

  const onYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setYearGroup(e.target.value);
    setClassName(""); // reset class
    handleChange(e.target.value, "");
  };

  const onClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setClassName(e.target.value);
    handleChange(yearGroup, e.target.value);
  };

  const onClear = () => {
    setYearGroup("");
    setClassName("");
    router.push(pathname);
  };

  return (
    <div className="flex gap-4 mb-6 items-center">
      <label>Year Group:</label>
      <select value={yearGroup} onChange={onYearChange}>
        <option value="">All</option>
        {yearGroups.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      <label>Class Name:</label>
      <select value={className} onChange={onClassChange} disabled={!yearGroup}>
        <option value="">All</option>
        {(yearGroup ? yearGroupClasses[yearGroup] || [] : []).map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <button
        onClick={onClear}
        className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
      >
        Clear
      </button>
    </div>
  );
}
