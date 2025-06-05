import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema.js";
import { Pool } from "pg";
import { connectionString } from "../environment.js";

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });
