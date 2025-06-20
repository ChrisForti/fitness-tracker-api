import { createHash, randomBytes } from "crypto";
import { eq, gt, and } from "drizzle-orm";
import { db } from "../drizzle/db.js";
import { TokenTable, UserTable } from "../drizzle/schema.js";

export enum Scope {
  AUTHENTICATION = "authentication",
  PASSWORD_RESET = "password",
}

export async function generateAuthenticationToken(userId: string) {
  const plaintext = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(plaintext).digest("hex");
  const expiry = Math.trunc(Date.now() / 1000) + 60 * 60 * 24 * 30;

  await db.insert(TokenTable).values({
    hash,
    expiry,
    userId,
    scope: Scope.AUTHENTICATION,
  });

  return plaintext;
}

export async function generatePasswordResetToken(userId: string) {
  const plaintext = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(plaintext).digest("hex");
  const expiry = Math.trunc(Date.now() / 1000) + 60 * 60;

  await db.insert(TokenTable).values({
    hash,
    expiry,
    userId,
    scope: Scope.PASSWORD_RESET,
  });

  return plaintext;
}

export async function getUserForToken(token: string, scope: Scope) {
  const hash = createHash("sha256").update(token).digest("hex");
  const currentTimestamp = Math.trunc(Date.now() / 1000);

  const result = await db
    .select({
      id: UserTable.id,
      firstName: UserTable.firstName,
      lastName: UserTable.lastName,
      email: UserTable.email,
      emailVerified: UserTable.emailVerified,
    })
    .from(UserTable)
    .innerJoin(TokenTable, eq(UserTable.id, TokenTable.userId))
    .where(
      and(
        eq(TokenTable.hash, hash),
        gt(TokenTable.expiry, currentTimestamp),
        eq(TokenTable.scope, scope)
      )
    );

  return result.length > 0 ? result[0] : null;
}
