import { Database } from "bun:sqlite";
import { P } from "ts-pattern";

type User = {
  username: string;
  password: string;
};

interface UserRepository {
  save(u: User): Promise<boolean>;
  exist(u: string): Promise<boolean>;
  getByUsername(username: string): User | Error;
}
const UserStore: UserRepository = {
  async save(u: User) {
    const db = Database.open(Bun.env.DATABASE_NAME);
    db.run(
      `INSERT INTO users(username, password) VALUES("${u.username}", "${u.password}");`,
    );
    return true;
  },
  async exist(u: string) {
    const db = Database.open(Bun.env.DATABASE_NAME);
    const result =
      db.query(`SELECT * FROM users WHERE username = "${u}";`).get() !== null;
    db.close();
    return result;
  },
  getByUsername(username: string) {
    const db = Database.open(Bun.env.DATABASE_NAME);
    const query = db.prepare(
      `SELECT id, username, password FROM users WHERE username = ?`,
    );
    const user = query.get(username);
    db.close();
    if (!user) return new Error("could not get user");
    return user as User;
  },
};

function CreateAuthService(store: UserRepository) {
  async function createUser({ username, password }: User) {
    const exists = await store.exist(username);

    if (exists) {
      return new Error("Username not available");
    }

    const hashedPassword = await Bun.password.hash(password);

    await store.save({ username, password: hashedPassword });

    return {
      username,
    };
  }

  async function getByUsername(username: string) {
    const exists = store.getByUsername(username);
    return exists;
  }

  return {
    createUser,
    getByUsername,
  };
}
const AuthService = CreateAuthService(UserStore);

export default AuthService;
