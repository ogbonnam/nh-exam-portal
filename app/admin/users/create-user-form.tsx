"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { createUser } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-400"
    >
      {pending ? "Creating..." : "Create User"}
    </button>
  );
}

const yearGroupClasses: Record<string, string[]> = {
  "Year 7": ["Year 7 AMA", "Year 7 SAG"],
  "Year 8": ["Year 8 CAD", "Year 8 LDK"],
  "Year 9": ["Year 9 NOI", "Year 9 ZAB"],
  "Year 10": ["Year 10 MAL"],
  "Year 11": ["Year 11 ZAK", "Year 11 LDK"],
};

export default function CreateUserForm() {
  const [state, setState] = React.useState<{
    error?: string;
    success?: string;
  }>({});
  const [role, setRole] = React.useState<"TEACHER" | "STUDENT" | "ADMIN">(
    "STUDENT"
  );
  const [yearGroup, setYearGroup] = React.useState<string>("");

  async function handleSubmit(formData: FormData) {
    const result = await createUser(formData);
    setState(result || {});
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          name="name"
          id="name"
          type="text"
          required
          className="mt-1 block w-full p-2 border rounded-md"
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          name="email"
          id="email"
          type="email"
          required
          className="mt-1 block w-full p-2 border rounded-md"
        />
      </div>

      {/* Role */}
      <div>
        <label htmlFor="role" className="block text-sm font-medium">
          Role
        </label>
        <select
          name="role"
          id="role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="mt-1 block w-full p-2 border rounded-md"
        >
          <option value="TEACHER">Teacher</option>
          <option value="STUDENT">Student</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Show only for STUDENT */}
      {role === "STUDENT" && (
        <>
          {/* Year Group */}
          <div>
            <label htmlFor="yearGroup" className="block text-sm font-medium">
              Year Group
            </label>
            <select
              name="yearGroup"
              id="yearGroup"
              required
              value={yearGroup}
              onChange={(e) => setYearGroup(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md"
            >
              <option value="">Select Year Group</option>
              {Object.keys(yearGroupClasses).map((yg) => (
                <option key={yg} value={yg}>
                  {yg}
                </option>
              ))}
            </select>
          </div>

          {/* Class */}
          <div>
            <label htmlFor="className" className="block text-sm font-medium">
              Class
            </label>
            <select
              name="className"
              id="className"
              required
              disabled={!yearGroup}
              className="mt-1 block w-full p-2 border rounded-md"
            >
              <option value="">Select Class</option>
              {yearGroup &&
                yearGroupClasses[yearGroup].map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
            </select>
          </div>
        </>
      )}

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Initial Password
        </label>
        <input
          name="password"
          id="password"
          type="password"
          required
          className="mt-1 block w-full p-2 border rounded-md"
        />
      </div>

      {/* Error/Success */}
      {state?.error && (
        <p className="text-sm text-red-600 text-center font-medium mt-4">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600 text-center font-medium mt-4">
          {state.success}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
