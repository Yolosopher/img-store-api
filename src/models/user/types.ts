import { Role, TID } from "@/global";
import { Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: TID;
  full_name: string;
  email: string;
  password: string;
  deleted: boolean;
  role: Role;
  api_tokens: { token: string; name: string }[];
}

// export interface IUserPopulated
//   extends Omit<IUser, "paychecks" | "owned_products"> {
//   paycheks: IPaycheck[];
//   owned_products: IProduct[];
// }

export interface UserModel extends Model<IUser> {}
