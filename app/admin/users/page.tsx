// app/admin/users/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { createUser } from "./actions";
import CreateUserForm from "./create-user-form";
import BulkUploadForm from "./bulk-upload-form";

const prisma = new PrismaClient();

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const users = await prisma.user.findMany({
    include: { role: true },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <CreateUserForm />
          <div className="mt-6">
            <BulkUploadForm />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Existing Users</h2>
          <ul className="divide-y divide-gray-200">
            {users.map((user) => (
              <li key={user.id} className="py-4">
                <p className="font-medium">
                  {user.name} ({user.email})
                </p>
                <span className="text-sm text-gray-500">
                  Role: {user.role.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
