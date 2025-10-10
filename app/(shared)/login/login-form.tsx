// In app/login/login-form.tsx (create a new file)
"use client";
import { useFormStatus } from "react-dom";
import { authenticate } from "./actions";
import { useState } from "react";

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400"
    >
      {pending ? "Logging in..." : "Log In"}
    </button>
  );
}

export default function LoginForm() {
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <form
      action={async (formData) => {
        const result = await authenticate(formData);
        if (result?.error) {
          setErrorMessage(result.error);
        }
      }}
      className="space-y-4 text-white"
    >
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          name="email"
          id="email"
          type="email"
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          name="password"
          id="password"
          type="password"
          required
          className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
        />
      </div>
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
      <LoginButton />
    </form>
  );
}
