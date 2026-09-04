import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = 'e2e_test_user';
  const email = 'e2e_test_user@example.com';
  const passwordHash = await bcrypt.hash('123456Clone', 10);

  const existing = await prisma.users.findUnique({ where: { username } });
  if (existing) {
    console.log(`Test account "${username}" already exists.`);
    return;
  }

  await prisma.users.create({
    data: {
      id: crypto.randomUUID(),
      username,
      email,
      password: passwordHash,
      name: 'E2E Test User',
      bio: 'Automated e2e test account',
      roles: 'viewer',
      emailVerified: new Date().toISOString(),
      followersCount: 0,
      followingsCount: 0,
    },
  });

  console.log(`Created test account "${username}" (password: 123456Clone).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
