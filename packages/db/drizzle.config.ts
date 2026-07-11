import { defineConfig } from "drizzle-kit";
import path from "path";

const envPath = path.resolve(__dirname, "../../.env");

try {
  process.loadEnvFile(envPath);
} catch {
  // .env file not found locally — fine in CI/production where
  // DATABASE_URL is already set as a real environment variable.
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Provision a Postgres database first.");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});