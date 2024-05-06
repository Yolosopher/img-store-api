import UnauthorizedError from "@/errors/UnauthorizedError";
import userService from "@/services/user";
import authService from "@/services/user/auth.service";
import { Request, Response } from "express";

class UserController {
  public async create(req: Request, res: Response) {
    const { email, full_name, password } = req.body;

    await authService.create({ email, full_name, password });

    const result = await authService.login({ email, password });

    req.current_user = result;

    res.status(201).json({
      message: "Sign up successful",
      current_user: req.current_user,
    });
  }
  public async login(req: Request, res: Response) {
    const { email, password } = req.body;

    req.current_user = await authService.login({ email, password });

    res.status(200).json({
      message: "Login successful",
      current_user: req.current_user,
    });
  }
  public async delete(req: Request, res: Response) {
    const { _id, auth_token } = req.current_user!;

    await userService.delete({ _id });

    await authService.logout({ token: auth_token, userId: _id });
    delete req.current_user;
    res.status(200).json({
      message: "User deleted successfully",
    });
  }
  public async logout(req: Request, res: Response) {
    const { _id, auth_token } = req.current_user!;

    await authService.logout({ token: auth_token, userId: _id });

    delete req.current_user;

    res.status(200).json({
      message: "Logout successful",
    });
  }
  public async self(req: Request, res: Response) {
    const foundUser = await userService.getOne(req.current_user!._id);
    if (!foundUser) {
      throw new UnauthorizedError({
        message: "User not found",
      });
    }
    const userInfo = foundUser.toJSON();
    delete userInfo.password;
    res.status(200).json({
      message: "User info",
      user: userInfo,
    });
  }

  // change user info
  public async changeFullName(req: Request, res: Response) {
    const { full_name } = req.body;
    const { _id } = req.current_user!;

    await userService.changeFullName({ user_id: _id, full_name });

    return res.sendStatus(204);
  }
  public async changePassword(req: Request, res: Response) {
    const { new_password, password } = req.body;
    const { _id } = req.current_user!;

    const auth_token = await userService.changePassword({
      user_id: _id,
      new_password,
      password,
    });

    const old_auth_token = req.current_user!.auth_token;
    await authService.logout({ token: old_auth_token, userId: _id });

    return res.status(200).json({
      auth_token,
      message: "Password updated successfully",
    });
  }

  // admin routes
  public async grantAdmin(req: Request, res: Response) {
    const { target_id } = req.params;

    await userService.grantAdminRole(target_id);

    res.status(200).json({
      message: "Admin role granted",
    });
  }
  public async getAllUsers(req: Request, res: Response) {
    const { includeAdmins } = req.query;

    const users = await userService.getAllUsers(includeAdmins === "true");

    res.status(200).json({
      message: "All users",
      users,
    });
  }

  // api tokens
  public async createApiToken(req: Request, res: Response) {
    const { _id } = req.current_user!;
    const name = req?.body?.name || "default";

    const token = await userService.createApiToken({ user_id: _id, name });

    res.status(201).json({
      ...token,
      message: "Api token created",
    });
  }

  public async deleteApiToken(req: Request, res: Response) {
    const { _id } = req.current_user!;
    const { token } = req.params;

    const result = await userService.deleteApiToken({ user_id: _id, token });

    res.status(200).json(result);
  }

  public async deleteAllApiTokens(req: Request, res: Response) {
    const { _id } = req.current_user!;

    const result = await userService.deleteAllApiTokens(_id);

    return res.status(200).json(result);
  }
}

const userController = new UserController();

export default userController;
