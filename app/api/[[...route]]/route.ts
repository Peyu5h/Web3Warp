import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import userRoutes from "./routes/user.route";
import nftRoutes from "./routes/nft.route";
import indexRoute from "./routes";

export const runtime = "nodejs";
const app = new Hono();

// Add CORS middleware
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

const routes = app.route("/api", indexRoute);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
