import { match } from "ts-pattern";
import AuthController from "./controllers/auth-controller";
import ImageController from "./controllers/image-controller";

async function router(req: Request): Promise<Response> {
  const url = new URL(req.url);
  return match(url.pathname)
    .with("/", () => {
      return new Response("hello bun");
    })
    .with("/register", AuthController.register)
    .with("/login", AuthController.login)
    .with("/optimize", () => ImageController.optimize(req))
    .otherwise(() => new Response("not implemented!"));
}

export { router };
