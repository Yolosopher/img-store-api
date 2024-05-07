import { Schema, model } from "mongoose";
import { hashPassword } from "@/utils/password";
import { IUser, UserModel } from "./types";
import { Role } from "@/global";

const UserSchema = new Schema<IUser>(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: [Role.ADMIN, Role.SUPER_ADMIN, Role.USER],
      default: Role.USER,
    },
    api_tokens: {
      type: [
        new Schema(
          {
            token: {
              type: String,
              required: true,
            },
            name: {
              type: String,
              required: true,
            },
          },
          {
            _id: false,
            versionKey: false,
            timestamps: {
              createdAt: "created_at",
              updatedAt: false,
            },
          }
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
    versionKey: false,
  }
);

UserSchema.pre("save", { document: true, query: true }, async function (done) {
  if (this.isModified("password") || this.isNew) {
    const hashed = hashPassword(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

const User = model<IUser, UserModel>("User", UserSchema);

export default User;
