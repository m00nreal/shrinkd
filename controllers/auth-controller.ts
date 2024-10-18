function createAuthController() {
  function register() {
    return new Response("register");
  }

  function login() {
    return new Response("login");
  }

  return {
    register,
    login,
  };
}

const AuthController = createAuthController();

export default AuthController;
