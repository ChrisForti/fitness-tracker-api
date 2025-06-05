import "dotenv/config";
import assert from "assert";

export const connectionString = process.env.DATABASE_URL!;

assert(connectionString, "DATABASE_URL must be set.");
