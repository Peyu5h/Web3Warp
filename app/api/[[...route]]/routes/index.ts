import { Hono } from "hono";
import userRoutes from "./user.route";

const app = new Hono();

// test route
app.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
app.route("/users", userRoutes);

export default app;
