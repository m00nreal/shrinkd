export type AuthRequest = {
  username: string;
  password: string;
};

function CreateAuthService(hostname: string) {
  function register(body: AuthRequest) {
    return fetch("http://localhost:3000", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  function login(body: AuthRequest) {
    return fetch("http://localhost:3000", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  return {
    register,
    login,
  };
}

const AuthService = CreateAuthService("localhost");

export default AuthService;
