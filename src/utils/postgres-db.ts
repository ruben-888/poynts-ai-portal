import { PrismaClient } from "@prisma/postgres-client";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { postgresDb: PrismaClient };

export const postgresDb =
  globalForPrisma.postgresDb ||
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.POSTGRES_DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.postgresDb = postgresDb;
