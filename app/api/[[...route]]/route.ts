import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import userRoutes from "./routes/user.route";
import nftRoutes from "./routes/nft.route";

export const runtime = "nodejs";
const app = new Hono().basePath("/api");

app.use(
  "*",
  cors({
    origin: "*",
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
  }),
);

app.route("/users", userRoutes);
app.route("/nft", nftRoutes);

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
