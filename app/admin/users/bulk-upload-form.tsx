"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { uploadUsersExcel } from "./actions"; // server action we created above

export default function BulkUploadForm() {
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const { pending } = useFormStatus();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setResult(null);
    try {
      const res = await uploadUsersExcel(formData);
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Bulk Upload Users (Excel/CSV)</h2>

      <form action={handleSubmit} className="space-y-4" >
        <div>
          <label className="block text-sm font-medium mb-1">File (.xlsx, .xls, .csv)</label>
          <input
            type="file"
            name="file"
            accept=".xlsx,.xls,.csv"
            required
            className="block w-full"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={pending}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
          >
            {pending ? "Uploading..." : "Upload and Create Users"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {result && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p>Created: <strong>{result.created}</strong></p>
          <p>Skipped (duplicates): <strong>{result.skipped}</strong></p>
          {result.errors && result.errors.length > 0 && (
            <>
              <p className="mt-2 font-semibold">Errors:</p>
              <ul className="list-disc pl-5">
                {result.errors.map((e: any, i: number) => (
                  <li key={i}>
                    Row {e.row} {e.email ? `(${e.email})` : ""}: {e.message}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
