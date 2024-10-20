import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import { logger } from "hono/logger";
import { Jwt } from "hono/utils/jwt";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { match, P } from "ts-pattern";
import { apiRouter } from "./api";
import AuthService from "./services/auth-service";
import { RegisterSchema } from "./validators";
import { getImages } from "./services/storage";

const TOKEN_EXPIRATION_IN_MINUTES = 30;

if (!existsSync("images")) {
  await mkdir("images");
}

type Variables = JwtVariables;
const app = new Hono<{ Variables: Variables }>();

app.use(logger());
app.use("/api/*", jwt({ secret: Bun.env.SECRET }));

app.route("/api", apiRouter);
app.post("/register", async (c) => {
  const formData = await c.req.formData();
  const { data: user, success } = RegisterSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!success) {
    return c.newResponse("Bad Request", { status: 400 });
  }

  const actualUser = await AuthService.register(user);

  return match(actualUser)
    .with(P.instanceOf(Error), () =>
      c.json({ error: "Username not available" }, 400),
    )
    .otherwise((u) => c.json(u));
});

app.post("/login", async (c) => {
  await getImages();
  const formData = await c.req.formData();
  const { data: user, success } = RegisterSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!success) {
    return c.newResponse("Bad Request");
  }

  const actualUser = await AuthService.login(user);
  return match(actualUser)
    .with(P.instanceOf(Error), () =>
      c.json({ error: "Invalid credentials" }, 400),
    )
    .otherwise(async ({ username }) => {
      const token = await Jwt.sign(
        {
          username,
          exp: Math.floor(Date.now() / 1000) + 60 * TOKEN_EXPIRATION_IN_MINUTES,
        },
        Bun.env.SECRET,
      );
      return c.json(
        {
          username,
          access_token: token,
          expires_in: 60 * TOKEN_EXPIRATION_IN_MINUTES,
        },
        200,
      );
    });
});

export default {
  port: Bun.env.port,
  fetch: app.fetch,
};
