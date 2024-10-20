import { Hono } from "hono";

export const apiRouter = new Hono();

apiRouter.post("/optimize", (c) => {
  return c.json({ message: "optimized!" });
});

apiRouter.get("/hello", (c) => {
  const payload = c.get("jwtPayload");
  return c.json({
    message: "Hello!" + payload.username,
  });
});
