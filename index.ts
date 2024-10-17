import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { router } from "./router";

if (!existsSync("images")) {
  await mkdir("images");
}

Bun.serve({
  port: Bun.env.PORT,
  fetch: router,
});
