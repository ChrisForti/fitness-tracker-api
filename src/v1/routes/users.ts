import { Router, type Request, type Response } from "express";
import { db } from "../../drizzle/db.js";
import { UserTable } from "../../drizzle/schema.js";
import { compare, hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { generateAuthenticationToken } from "../../lib/tokens.js";
// import { SERVER_ERROR } from "../../lib/errors.js";
import { Validator } from "../../lib/Validator.js";
import { ensureAuthenticated } from "../../lib/auth.js";
import { v4 as uuidv4 } from "uuid";
import { validate as validateUuid } from "uuid";

export const userRouter = Router();

userRouter.post("/", createUserHandler);
// userRouter.post("/login", loginUserHandler);
// userRouter.get("/", ensureAuthenticated, getUserByIdHandler);
// userRouter.put("/", ensureAuthenticated, updateUserHandler);
// userRouter.delete("/", ensureAuthenticated, deleteUserHandler);

type CreateUserBodyParams = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accountType: "admin" | "user";
};

async function createUserHandler(
  req: Request<{}, {}, CreateUserBodyParams>,
  res: Response
) {
  const { firstName, lastName, email, password } = req.body;
  const emailRx =
    "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$";
  const validator = new Validator();
  // const accountType = req.body.accountType;

  // if (!["admin", "user"].includes(accountType)) {
  //   res.status(400).json({ error: "Invalid account type" });
  //   return;
  // }

  try {
    validator.check(!!firstName, "firstName", "is required");
    validator.check(
      firstName.length < 3,
      "firstName",
      "must be at least 3 characters"
    );
    validator.check(!!lastName, "lastName", "is required");
    validator.check(
      lastName.length < 3,
      "lastName",
      " must be at least 3 characters"
    );
    validator.check(!!email, "email", "is required");
    validator.check(
      !!email.match(emailRx),
      "email",
      "must be a valid email address"
    );
    validator.check(!!password, "password", "is required");
    validator.check(
      password.length < 8,
      "password",
      "must be at least 8 digits"
    );

    if (!validator.valid) {
      res.status(400).json({ errors: validator.errors });
      return;
    }

    const passwordHash = await hash(password!, 10);
    if (!passwordHash) {
      res.status(500).json({
        error:
          "The server encountered an error and cannot complete your request",
      });
      return;
    }

    await db.insert(UserTable).values({
      id: uuidv4(),
      firstName,
      lastName,
      email,
      passwordHash,
      accountType: "user",
    });

    res.json({ message: "User created successfully" });
    return;
  } catch (error) {
    res.status(500).json({ error: "Unknown error occurred" });
    return;
  }
}
