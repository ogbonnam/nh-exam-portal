// app/admin/users/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import { createUser } from "./actions";
import CreateUserForm from "./create-user-form";
import BulkUploadForm from "./bulk-upload-form";
import UserList from "./user-list";

const prisma = new PrismaClient();

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  const roles = await prisma.role.findMany();

  return (
    <div className="container mx-auto p-4 my-10">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <CreateUserForm roles={roles} />
          <div className="mt-6">
            <BulkUploadForm />
          </div>
        </div>
        <div>
          <UserList initialUsers={users} roles={roles} />
        </div>
      </div>
    </div>
  );
}