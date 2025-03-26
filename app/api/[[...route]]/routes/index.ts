import { Hono } from "hono";
import userRoutes from "./user.route";
import nftRoutes from "./nft.route";

const app = new Hono();

// test route
app.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
app.route("/users", userRoutes);
app.route("/nft", nftRoutes);

export default app;
