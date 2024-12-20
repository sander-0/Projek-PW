import UserModel, { User } from "../models/user.model";
import { encrypt } from "../utils/encryption";
import { generateToken } from "../utils/jwt";

interface ILoginPayload {
  username: string;
  password: string;
}

export const login = async (payload: ILoginPayload): Promise<string> => {
  const { username, password } = payload;

  // Find user by username
  const user = await UserModel.findOne({ username });

  if (!user) {
    return Promise.reject(new Error("username: user not found"));
  }

  // Validate password
  const validatePassword: boolean = encrypt(password) === user.password;

  if (!validatePassword) {
    return Promise.reject(new Error("password: invalid credentials"));
  }

  // Generate token
  const token = generateToken({
    username: user.username
  });

  return token;
};

interface IRegisterPayload {
  username: string;
  password: string;
}

export const register = async (payload: IRegisterPayload): Promise<User> => {
  const { username, password } = payload;

  // Create new user
  const user = await UserModel.create({
    username,
    password,
  });

  return user;
};

