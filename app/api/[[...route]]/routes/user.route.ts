import { Hono } from "hono";
import {
  createOrUpdateUser,
  getUserByWallet,
} from "../controllers/user.controller";

const userRoutes = new Hono();

userRoutes.post("/", createOrUpdateUser);
userRoutes.get("/wallet/:address", getUserByWallet);

export default userRoutes;
