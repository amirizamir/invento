import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function resolveAdminEmail(username: string): string {
  const trimmed = username.trim().toLowerCase();
  if (trimmed.includes("@")) return trimmed;
  return `${trimmed}@ahg.local`;
}

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log("Database already initialized — skipping bootstrap.");
    return;
  }

  const adminUsername = process.env.ADMIN_USERNAME?.trim() || "zamir.amiri";
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const adminName = process.env.ADMIN_NAME?.trim() || "Zamir Amiri";
  const adminEmail = resolveAdminEmail(process.env.ADMIN_EMAIL?.trim() || adminUsername);

  if (!adminPassword) {
    console.error(
      "ERROR: No users exist and ADMIN_PASSWORD is not set. Set ADMIN_USERNAME and ADMIN_PASSWORD in .env before first deploy."
    );
    process.exit(1);
  }

  console.log("Bootstrapping admin account...");

  await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      password: await bcrypt.hash(adminPassword, 12),
      role: Role.ADMIN,
      department: process.env.ADMIN_DEPARTMENT?.trim() || "IT Infrastructure",
    },
  });

  console.log("Admin account created.");
  console.log(`  Username: ${adminUsername}`);
  console.log("  Password: (value from ADMIN_PASSWORD in .env)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
