import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __synergyPrisma: PrismaClient | null | undefined;
}

export function getPrismaClient(): PrismaClient | null {
  if (globalThis.__synergyPrisma !== undefined) {
    return globalThis.__synergyPrisma;
  }

  try {
    globalThis.__synergyPrisma = new PrismaClient();
  } catch {
    globalThis.__synergyPrisma = null;
  }

  return globalThis.__synergyPrisma;
}

export const prisma = getPrismaClient();

if (process.env.NODE_ENV !== 'production' && globalThis.__synergyPrisma === undefined) {
  globalThis.__synergyPrisma = prisma;
}
