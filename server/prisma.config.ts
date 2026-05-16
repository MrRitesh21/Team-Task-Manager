import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use process.env directly to avoid strict validation errors during build
    url: process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/db",
  },
});
