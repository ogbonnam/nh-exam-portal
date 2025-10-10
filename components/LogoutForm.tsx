// components/LogoutForm.tsx
"use client";

import { logout } from "@/app/actions/logout";

export default function LogoutForm() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="bg-red-500 px-4 py-2 rounded-md text-white"
      >
        Sign Out
      </button>
    </form>
  );
}
