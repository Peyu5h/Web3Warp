import { Hono } from "hono";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import userRoutes from "./routes/user.route";

export const runtime = "nodejs";
const app = new Hono().basePath("/api");

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

// Mount user routes
app.route("/users", userRoutes);

export const GET = handle(app);
export const POST = handle(app);
export const OPTIONS = handle(app);
