import { Request } from "express";

declare global {
  namespace Express {
    interface User {
      id: number;
      role: string; // Example: "admin", "user", etc.
    }

    interface Request {
      user?: {
        id: number;
        role: string;
      };
    }
  }
}
