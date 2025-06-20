import { Request } from "express";

declare global {
  namespace Express {
    interface User {
      id: string; // Example: UUID or numeric ID
      role: string; // Example: "admin", "user", etc.
    }

    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}
