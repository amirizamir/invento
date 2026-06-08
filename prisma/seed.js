const { PrismaClient, Role } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function resolveAdminEmail(username) {
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
    console.error("");
    console.error("ERROR: First deploy requires an admin account.");
    console.error("Set ADMIN_PASSWORD in your .env file, for example:");
    console.error('  ADMIN_PASSWORD="your-secure-password"');
    console.error("");
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
}

main()
  .catch((error) => {
    console.error("Bootstrap failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
