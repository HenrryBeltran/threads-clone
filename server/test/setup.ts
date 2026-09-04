import { execSync } from 'child_process';
import { existsSync, rmSync } from 'fs';
import { join } from 'path';

const DB_DIR = join(__dirname, '..');
const DB_PATH = join(DB_DIR, 'test.e2e.db');

export default async function globalSetup() {
  if (existsSync(DB_PATH)) {
    rmSync(DB_PATH);
  }
  if (existsSync(`${DB_PATH}-shm`)) {
    rmSync(`${DB_PATH}-shm`);
  }
  if (existsSync(`${DB_PATH}-wal`)) {
    rmSync(`${DB_PATH}-wal`);
  }

  process.env.DATABASE_URL = `file:${DB_PATH}`;

  execSync('npx prisma generate --schema=prisma/schema.prisma', {
    cwd: DB_DIR,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: `file:${DB_PATH}` },
  });

  execSync('npx prisma db push --schema=prisma/schema.prisma', {
    cwd: DB_DIR,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: `file:${DB_PATH}` },
  });
}

export async function globalTeardown() {
  if (existsSync(DB_PATH)) {
    rmSync(DB_PATH);
  }
  if (existsSync(`${DB_PATH}-shm`)) {
    rmSync(`${DB_PATH}-shm`);
  }
  if (existsSync(`${DB_PATH}-wal`)) {
    rmSync(`${DB_PATH}-wal`);
  }
}