import { TID } from "@/global";
import { Document, Model } from "mongoose";
import { IUser } from "../user/types";

export enum ReadAccess {
  PUBLIC = "public",
  PRIVATE = "private",
}

export interface IImageStore extends Document {
  _id: TID;
  owner: TID;
  name: string;
  read_access: ReadAccess;
}

export interface IImageStorePopulated extends Omit<IImageStore, "owner"> {
  owner: IUser;
}

export interface ImageStoreModel extends Model<IImageStore> {}
