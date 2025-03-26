import { Hono } from "hono";
import userRoutes from "./user.route";
import nftRoutes from "./nft.route";

const indexRoute = new Hono();

// test route
indexRoute.get("/", (c) => {
  return c.json({ message: "working" });
});

// routes
indexRoute.route("/users", userRoutes);
indexRoute.route("/nft", nftRoutes);

export default indexRoute;
