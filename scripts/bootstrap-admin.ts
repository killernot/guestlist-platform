/* ============================================================
   BOOTSTRAP ADMIN SCRIPT
   Creates the first administrator account.
   
   Usage:
     DATABASE_URL="postgresql://..." npx tsx scripts/bootstrap-admin.ts
   
   Or with env vars (no prompt):
     BOOTSTRAP_ADMIN_EMAIL=admin@example.com \
     BOOTSTRAP_ADMIN_PASSWORD="SecurePass123!@#" \
     DATABASE_URL="postgresql://..." \
     npx tsx scripts/bootstrap-admin.ts
   
   Safety:
     - Aborts if any admin user already exists
     - Never creates duplicate admins
     - Password must meet minimum requirements (12+ chars, uppercase, lowercase, number, special)
   ============================================================ */

import { createInterface } from "readline";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

// Construct Prisma client with explicit connection
function createPrismaClient(datasourceUrl: string): PrismaClient {
  const pool = new Pool({ connectionString: datasourceUrl, max: 5 });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

async function prompt(question: string, mask: boolean = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    if (mask) {
      const stdin = process.stdin;
      const stdout = process.stdout;
      stdout.write(question);
      stdin.setRawMode(true);
      let password = "";
      stdin.on("data", (char: unknown) => {
        const c = String(char);
        switch (c) {
          case "\n":
          case "\r":
          case "\u0004":
            stdin.setRawMode(false);
            stdin.pause();
            stdout.write("\n");
            rl.close();
            resolve(password);
            break;
          case "\u0003":
            process.exit(1);
            break;
          case "\u007f":
            if (password.length > 0) {
              password = password.slice(0, -1);
              stdout.write("\b \b");
            }
            break;
          default:
            password += c;
            stdout.write("*");
            break;
        }
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
      });
    }
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters long";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain at least one number";
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    return "Password must contain at least one special character";
  return null;
}

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║   Guestlist Platform — Admin Bootstrap       ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  const datasourceUrl = process.env.DATABASE_URL;
  if (!datasourceUrl) {
    console.error("❌ DATABASE_URL is required.");
    console.error("   Example: DATABASE_URL=\"postgresql://user:pass@host:5432/db\" npx tsx scripts/bootstrap-admin.ts");
    process.exit(1);
  }

  if (!datasourceUrl.startsWith("postgresql://")) {
    console.error("❌ Only PostgreSQL databases are supported.");
    console.error(`   Got: ${datasourceUrl.split("://")[0]}://`);
    process.exit(1);
  }

  const prisma = createPrismaClient(datasourceUrl);

  // Step 1: Check if admin already exists
  console.log("🔍 Checking for existing admin accounts...");
  const existingAdminCount = await prisma.adminUser.count();

  if (existingAdminCount > 0) {
    console.error(`\n❌ ABORT: ${existingAdminCount} administrator account(s) already exist.`);
    console.error("   This script will never create duplicate bootstrap admins.");
    console.error("   To add additional admins, use the admin panel or write a targeted script.\n");
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log("✅ No admin accounts found. Proceeding with bootstrap.\n");

  // Step 2: Get email
  let email = process.env.BOOTSTRAP_ADMIN_EMAIL || "";
  if (!email) {
    email = await prompt("📧 Admin email: ");
  }

  if (!email.trim()) {
    console.error("❌ Email is required.");
    await prisma.$disconnect();
    process.exit(1);
  }

  email = email.trim().toLowerCase();

  if (!validateEmail(email)) {
    console.error("❌ Invalid email format.");
    await prisma.$disconnect();
    process.exit(1);
  }

  // Step 3: Get password
  let password = process.env.BOOTSTRAP_ADMIN_PASSWORD || "";
  if (!password) {
    console.log("\n🔒 Password requirements:");
    console.log("   • Minimum 12 characters");
    console.log("   • At least one uppercase letter (A-Z)");
    console.log("   • At least one lowercase letter (a-z)");
    console.log("   • At least one number (0-9)");
    console.log("   • At least one special character (!@#$%^&*...)\n");
    password = await prompt("🔑 Admin password: ", true);

    const confirmPassword = await prompt("🔑 Confirm password: ", true);
    if (password !== confirmPassword) {
      console.error("❌ Passwords do not match.");
      await prisma.$disconnect();
      process.exit(1);
    }
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    console.error(`❌ ${passwordError}.`);
    await prisma.$disconnect();
    process.exit(1);
  }

  // Step 4: Get optional name
  const nameInput = process.env.BOOTSTRAP_ADMIN_NAME || "";
  // Name is optional — can be empty

  // Step 5: Hash password and create user
  console.log("\n⏳ Creating administrator account...");
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.create({
    data: {
      email,
      name: nameInput.trim() || null,
      passwordHash,
      role: "ADMIN",
    },
  });

  // Step 6: Verify the account was created
  const [verifiedCount, createdUser] = await Promise.all([
    prisma.adminUser.count(),
    prisma.adminUser.findUnique({ where: { email } }),
  ]);

  if (!createdUser || verifiedCount !== 1) {
    console.error("❌ Verification failed: user not found after creation.");
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   ✅ Bootstrap Complete                      ║");
  console.log("╚══════════════════════════════════════════════╝");
  console.log(`   Email:     ${admin.email}`);
  console.log(`   Role:      ${admin.role}`);
  console.log(`   Created:   ${admin.createdAt.toISOString()}`);
  console.log(`   Total admins in DB: ${verifiedCount}`);
  console.log("\n⚠️  IMPORTANT: Store these credentials securely.");
  console.log("   Password cannot be recovered if lost.");
  console.log("   Consider creating a secondary admin for backup access.\n");

  await prisma.$disconnect();
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Bootstrap failed:", error);
    process.exit(1);
  });
