import CONFIG from "@/config";
import { JWT_PAYLOAD } from "@/global";
import sessionService, {
  SessionService,
  SessionServiceMethodParams,
} from "@/services/session";
import jwt from "jsonwebtoken";

class JWT {
  private secret: string;
  private expiresIn: string;
  private api_token_expires_in: string;
  constructor(private sessionService: SessionService) {
    this.secret = CONFIG.secret_key;
    this.expiresIn = CONFIG.jwt_expires_in;

    // api tokens
    this.api_token_expires_in = "30y";
  }
  public async generate(payload: JWT_PAYLOAD) {
    const token = jwt.sign(payload, this.secret, {
      expiresIn: this.expiresIn,
    });
    await this.sessionService.addToken({
      token,
      userId: payload._id.toString(),
    });
    return token;
  }
  public async verify(
    token: string
  ): Promise<
    | { success: true; payload: JWT_PAYLOAD }
    | { success: false; message: string; expired: boolean }
  > {
    try {
      const result = jwt.verify(token, this.secret) as JWT_PAYLOAD;

      const isCorrect = await this.sessionService.verifyToken({
        token,
        userId: result._id,
      });

      if (!isCorrect) {
        return {
          success: false,
          message: "Token Is Blacklisted",
          expired: false,
        };
      }
      return {
        success: true,
        payload: {
          _id: result._id,
          email: result.email,
          full_name: result.full_name,
          role: result.role,
          auth_api_token: result.auth_api_token,
        },
      };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return { success: false, message: "Token is expired", expired: true };
      }
      return { success: false, message: "Invalid Token", expired: false };
    }
  }
  public async blacklist(params: SessionServiceMethodParams) {
    await this.sessionService.blacklistToken(params);
  }

  // api tokens
  public async generateApiToken(user_id: string) {
    const api_token = jwt.sign({ user_id }, this.secret, {
      expiresIn: this.api_token_expires_in,
    });
    return api_token;
  }
  public async verifyApiToken(
    token: string
  ): Promise<{ success: boolean; user_id?: string }> {
    try {
      const result = jwt.verify(token, this.secret) as { user_id: string };
      return { success: true, user_id: result.user_id };
    } catch (error) {
      return { success: false };
    }
  }
}

const jwtInstance = new JWT(sessionService);

export default jwtInstance;
