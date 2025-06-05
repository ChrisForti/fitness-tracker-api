import { Router } from "express";
import { userRouter } from "./routes/users.js";

export const v1Router = Router(); // Can add auth logig here too encompass whole router

v1Router.use("/user", userRouter);
