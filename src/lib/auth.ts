import { createHash } from "crypto";
import type { Request, Response, NextFunction } from "express";
import { db } from "../drizzle/db.js";
import { TokenTable, UserTable } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401).json({ errors: { message: "must be authenticated" } });
    return;
  }
  next();
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return next();
  }

  if (!authorizationHeader) {
    return next(); // If the header is undefined, proceed to the next middleware
  }

  const parts = authorizationHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return next();
  }

  const token = parts[1];

  if (token?.length !== 43) {
    return next();
  }

  const hash = createHash("sha256").update(token).digest("hex");

  try {
    const result = await db
      .select({ id: UserTable.id, role: UserTable.accountType })
      .from(TokenTable)
      .innerJoin(UserTable, eq(TokenTable.userId, UserTable.id))
      .where(eq(TokenTable.hash, hash))
      .limit(1);

    if (!result.length) {
      return next();
    }

    const user = result[0]; // The first record from the query, containing { id, role }

    if (!user) {
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    next();
  }
}

export function ensureAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({ errors: { message: "Not allowed" } });
    return;
  }
  next();
}
