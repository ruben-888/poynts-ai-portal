import { PrismaClient } from "@prisma/client";

// Prisma driver options undocumented, see https://github.com/blackbeam/mysql_async.
const connectionString = ({
  driver,
  host,
  port,
  socket,
  database,
  username,
  password,
  options = new Map(),
}: {
  driver: "mysql" | "postgres";
  host: string;
  port?: number;
  socket?: string;
  database: string;
  username: string;
  password: string;
  options?: Map<string, string>;
}): string => {
  const portString = port ? `:${port}` : "";
  const driverString = `${driver}://${username}:${encodeURIComponent(password)}@${host}${portString}/${database}`;
  switch (driver) {
    case "mysql":
      if (socket) {
        options.set("socket", socket);
      }
    case "postgres":
      if (socket) {
        options.set("host", socket);
      }
  }
  // Rusttls requires hostname for ca validation.
  if (!socket) {
    options.set("sslaccept", "skip_domain_validation");
  }
  let optionsString = "";
  if (options) {
    options.forEach((value, name) => (optionsString += `&${name}=${value}`));
    optionsString = "?" + optionsString.substring(1);
  }
  return driverString + optionsString;
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: connectionString({
          driver: "mysql",
          host: process.env.DB_HOST ?? "",
          port: parseInt(process.env.DB_PORT ?? "", 10),
          socket: process.env.DB_SOCKET_PATH ?? "",
          database: process.env.DB_NAME ?? "",
          username: process.env.DB_USER ?? "",
          password: process.env.DB_PASSWORD ?? "",
        }),
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
