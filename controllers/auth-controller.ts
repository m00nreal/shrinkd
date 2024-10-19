import { match, P } from "ts-pattern";
import AuthService from "../services/auth-service";
import { RegisterSchema } from "../validators";

function createAuthController() {
  async function register(req: Request) {
    const formData = await req.formData();
    const { data: user, success } = RegisterSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });

    if (!success) {
      return new Response("Bad Request", { status: 400 });
    }

    const actualUser = await AuthService.register(user);

    return match(actualUser)
      .with(P.instanceOf(Error), () =>
        Response.json({ error: "Username not available" }, { status: 400 }),
      )
      .otherwise((u) => Response.json(u));
  }

  async function login(req: Request) {
    const formData = await req.formData();
    const { data: user, success } = RegisterSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });

    if (!success) {
      return new Response("invalid credentials");
    }

    const actualUser = await AuthService.login(user);
    return match(actualUser)
      .with(P.instanceOf(Error), () =>
        Response.json({ error: "Bad Request" }, { status: 400 }),
      )
      .otherwise(({ username }) => Response.json({ username }));
  }

  return {
    register,
    login,
  };
}

const AuthController = createAuthController();

export default AuthController;
