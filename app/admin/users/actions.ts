// In app/admin/actions.ts
"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import * as XLSX from "xlsx";
import { revalidatePath } from "next/cache";



declare global {
  // prisma singleton for serverless/dev
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}
const prisma: PrismaClient = global.__prisma__ ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") global.__prisma__ = prisma;


type UploadResult = {
  created: number;
  skipped: number;
  errors: { row: number; email?: string; message: string }[];
};

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


/**
 * Expected columns (headers) in the sheet (case-insensitive):
 * name, email, role, yearGroup, className, password
 *
 * role defaults to STUDENT if missing; valid roles: STUDENT, TEACHER, ADMIN
 * password is optional — if missing we assign a default temporary password.
 */
export async function uploadUsersExcel(formData: FormData): Promise<UploadResult> {
  await checkAdminRole();

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided.");

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  if (!workbook.SheetNames?.length) throw new Error("Excel file contains no sheets.");

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: null });

  const result: UploadResult = { created: 0, skipped: 0, errors: [] };
  let rowIndex = 1; // Human-friendly 1-based index

  for (const rawRow of rows) {
    rowIndex++;

    try {
      // Normalize keys (case-insensitive)
      const normalize = (key: string) =>
        Object.keys(rawRow).find((k) => k.toLowerCase() === key.toLowerCase()) ?? null;

      const name = normalize("name") ? String(rawRow[normalize("name")!]).trim() : "";
      const email = normalize("email")
        ? String(rawRow[normalize("email")!]).trim().toLowerCase()
        : "";
      let role = normalize("role")
        ? String(rawRow[normalize("role")!]).trim().toUpperCase()
        : "STUDENT";
      const yearGroup = normalize("yearGroup") ? String(rawRow[normalize("yearGroup")!]).trim() : undefined;
      const className = normalize("className") ? String(rawRow[normalize("className")!]).trim() : undefined;
      let password = normalize("password") ? String(rawRow[normalize("password")!]).trim() : "";

      if (!email) {
        result.errors.push({ row: rowIndex, message: "Missing email" });
        continue;
      }

      // Validate role
      if (!["STUDENT", "TEACHER", "ADMIN"].includes(role)) role = "STUDENT";

      // Skip existing users
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        result.skipped++;
        continue;
      }

      // Default password if missing
      if (!password) password = `Pass@${Math.random().toString(36).slice(2, 10)}`;

      const hashed = await bcrypt.hash(password, 10);

      // Find role in DB
      const roleRow = await prisma.role.findUnique({ where: { name: role } });
      if (!roleRow) {
        result.errors.push({ row: rowIndex, email, message: `Role not found: ${role}` });
        continue;
      }

      // Create user
      await prisma.user.create({
        data: {
          name: name || undefined,
          email,
          password: hashed,
          role: { connect: { name: roleRow.name } },
          yearGroup: role === "STUDENT" ? yearGroup || undefined : undefined,
          className: role === "STUDENT" ? className || undefined : undefined,
        },
      });

      result.created++;
    } catch (err: any) {
      result.errors.push({
        row: rowIndex,
        email: rawRow.email || "",
        message: err?.message ?? String(err),
      });
    }
  }

  return result;
}


export async function updateUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const roleId = formData.get("roleId") as string;
  const yearGroup = formData.get("yearGroup") as string;
  const className = formData.get("className") as string;

  try {
    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        roleId,
        yearGroup: yearGroup || null,
        className: className || null,
      },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { error: "Failed to update user" };
  }
}

export async function deleteUser(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const id = formData.get("id") as string;

  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
return { error: "Failed to delete user" };
  }
}