import { defineConfig } from "drizzle-kit";
import { connectionString } from "./src/environment";

export default defineConfig({
  dialect: "postgresql",
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dbCredentials: {
    url: connectionString,
  },
  strict: true,
});
