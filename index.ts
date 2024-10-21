import { Hono } from "hono";
import { jwt, type JwtVariables } from "hono/jwt";
import { logger } from "hono/logger";
import { Jwt } from "hono/utils/jwt";
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { match, P } from "ts-pattern";
import { apiRouter } from "./api";
import AuthService from "./services/auth-service";
import { doSetup } from "./sqlite";
import { RegisterSchema } from "./validators";

const TOKEN_EXPIRATION_IN_MINUTES = 30;

if (!existsSync("images")) {
  await mkdir("images");
}

type Variables = JwtVariables;
const app = new Hono<{ Variables: Variables }>();

app.use(logger());
app.use("/api/*", jwt({ secret: Bun.env.SECRET }));
doSetup();

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

  const actualUser = await AuthService.createUser(user);

  return match(actualUser)
    .with(P.instanceOf(Error), () =>
      c.json({ error: "Username not available" }, 400),
    )
    .otherwise((u) => c.json(u));
});

app.post("/login", async (c) => {
  const formData = await c.req.formData();
  const { data: user, success } = RegisterSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!success) {
    return c.json({ error: "Username and password required" }, 400);
  }

  // TODO: identify error type: user does not exist | user credentials does not match
  const actualUser = await AuthService.getByUsername(user.username);
  if (actualUser instanceof Error) {
    return c.json({ error: "Could not find user" }, 400);
  }

  const validCredentials = await Bun.password.verify(
    user.password,
    actualUser.password,
  );

  if (!validCredentials) {
    return c.json({ error: "Wrong credentials" }, 400);
  }

  return match(actualUser)
    .with(P.instanceOf(Error), () =>
      c.json({ error: "Invalid credentials" }, 400),
    )
    .otherwise(async () => {
      const token = await Jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) + 60 * TOKEN_EXPIRATION_IN_MINUTES,
        },
        Bun.env.SECRET,
      );
      return c.json(
        {
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
