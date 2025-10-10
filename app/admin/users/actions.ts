// In app/admin/actions.ts
"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function checkAdminRole() {
  const session = await auth();
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }
}

export async function createUser(formData: FormData) {
  await checkAdminRole();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const roleName = formData.get("role") as string;
  const password = formData.get("password") as string;

  // Only student fields
  const yearGroup = formData.get("yearGroup") as string | null;
  const className = formData.get("className") as string | null;

  if (!name || !email || !roleName || !password) {
    return { error: "All fields are required." };
  }

  try {
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      return { error: "Role not found." };
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Build user data
    const data: any = {
      name,
      email,
      password: hashedPassword,
      roleId: role.id,
    };

    // If it's a student, include yearGroup + className
    if (roleName === "STUDENT") {
      if (!yearGroup || !className) {
        return { error: "Year group and class are required for students." };
      }
      data.yearGroup = yearGroup;
      data.className = className;
    }

    await prisma.user.create({ data });

    return { success: "User created successfully!" };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: "Failed to create user. Email may already be in use." };
  }
}

// Seed roles if missing
export async function seedRoles() {
  "use server";
  await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });
  await prisma.role.upsert({
    where: { name: "TEACHER" },
    update: {},
    create: { name: "TEACHER" },
  });
  await prisma.role.upsert({
    where: { name: "STUDENT" },
    update: {},
    create: { name: "STUDENT" },
  });
  return { message: "Roles seeded!" };
}
