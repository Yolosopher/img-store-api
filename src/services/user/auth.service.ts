import DuplicateError from "@/errors/DuplicateError";
import UnauthorizedError from "@/errors/UnauthorizedError";
import User from "@/models/user";
import { UserModel } from "@/models/user/types";
import jwtInstance from "@/utils/jwt";
import { comparePassword } from "@/utils/password";
import { SessionServiceMethodParams } from "../session";

export class AuthService {
  constructor(protected userModel: UserModel) {
    this.userModel = userModel;
  }

  public async create({
    email,
    full_name,
    password,
  }: {
    email: string;
    full_name: string;
    password: string;
  }) {
    // check if user already exists
    const userExists = await this.userModel.findOne({
      email,
    });
    if (userExists) {
      throw new DuplicateError({
        message: "User with this email already exists",
      });
    }

    return await this.userModel.create({
      email,
      full_name,
      password,
    });
  }
  public async login({ email, password }: { email: string; password: string }) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedError({
        message: "Invalid email or password",
      });
    }
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError({
        message: "Invalid email or password",
      });
    }

    // check if user was deleted and restore in that case

    if (user.deleted) {
      await this.userModel.findByIdAndUpdate(
        user._id,
        { deleted: false },
        { new: true }
      );
    }

    // generate token
    const tokenPayload = {
      _id: user._id.toString(),
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };
    return {
      ...tokenPayload,
      auth_token: await jwtInstance.generate(tokenPayload),
    };
  }
  public async logout(params: SessionServiceMethodParams) {
    // add token to blacklist
    await jwtInstance.blacklist(params);
  }
}

const authService = new AuthService(User);

export default authService;
