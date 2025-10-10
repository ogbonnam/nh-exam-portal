// app/admin/page.tsx
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/admin/users"
          className="bg-white p-6 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold text-blue-600">
            User Management
          </h2>
          <p className="mt-2 text-gray-600">Add new users and manage roles.</p>
        </Link>
        <Link
          href="/admin/quizzes"
          className="bg-white p-6 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-xl font-semibold text-purple-600">
            Quiz Management
          </h2>
          <p className="mt-2 text-gray-600">
            View all quizzes and student results.
          </p>
        </Link>
      </div>
    </div>
  );
}
