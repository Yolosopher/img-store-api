import { Schema, model } from "mongoose";
import { IImageStore, ImageStoreModel, ReadAccess } from "./types";

const ImageStoreSchema = new Schema<IImageStore>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      index: true,
    },
    read_access: {
      type: String,
      enum: [ReadAccess.PRIVATE, ReadAccess.PUBLIC],
      default: ReadAccess.PRIVATE,
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

const ImageStore = model<IImageStore, ImageStoreModel>(
  "ImageStore",
  ImageStoreSchema
);

export default ImageStore;
