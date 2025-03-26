import { Hono } from "hono";

import { getTokensByOwner } from "../controllers/nft.controller";

const nftRoutes = new Hono();

nftRoutes.get("/tokens", getTokensByOwner);

export default nftRoutes;
