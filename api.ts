import { Hono } from "hono";
import { getImages } from "./services/storage";

export const apiRouter = new Hono();

apiRouter.post("/optimize", (c) => {
  return c.json({ message: "optimized!" });
});

apiRouter.get("/images", async (c) => {
  const result = await getImages();

  return c.json(result);
});

apiRouter.get("/hello", (c) => {
  const payload = c.get("jwtPayload");
  return c.json({
    message: "Hello!" + payload.username,
  });
});
