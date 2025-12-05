import { PrismaClient } from "@prisma/postgres-client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { postgresDb: PrismaClient | undefined };

function createPrismaClient() {
  if (!process.env.POSTGRES_DATABASE_URL) {
    throw new Error("POSTGRES_DATABASE_URL environment variable is not set");
  }
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_DATABASE_URL,
      },
    },
  });
}

// Lazy initialization to avoid build-time errors
export const postgresDb = globalForPrisma.postgresDb ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.postgresDb = postgresDb;
