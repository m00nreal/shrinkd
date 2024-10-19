type RegisteredUser = {
  username: string;
  hashedPassword: string;
};

type User = {
  username: string;
  password: string;
};

export const users: Record<string, RegisteredUser> = {};

// todo: implement DI - arg for creating the service should be an interface with operations attached to it
// it will facilitate mocking operations during testing
// todo 2: implement persistent storage
function CreateAuthService() {
  async function register({ username, password }: User) {
    if (users[username]) {
      return new Error("username is not available");
    }

    const hashedPassword = await Bun.password.hash(password);
    const createdAt = Date.now().toString();
    users[username] = {
      username: username,
      hashedPassword: hashedPassword,
    };

    return {
      username,
      createdAt,
    };
  }

  async function login({ username, password }: User) {
    const user = users[username];

    if (!user) {
      return new Error("Username does not exist");
    }

    const validCredentials = await Bun.password.verify(
      password,
      user.hashedPassword,
    );

    if (!validCredentials) {
      return new Error("Invalid password");
    }

    return {
      username: user.username,
    };
  }

  return {
    register,
    login,
  };
}

const AuthService = CreateAuthService();

export default AuthService;
