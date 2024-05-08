import CONFIG from "@/config";
import BadRequestError from "@/errors/BadRequestError";
import { ReadAccess } from "@/models/image-store/types";
import imageStoreService from "@/services/image-store";
import getFileExtension from "@/utils/file-extention";
import generateUID from "@/utils/generateUID";
import { NextFunction, Request, Response } from "express";
import { existsSync, mkdirSync } from "fs";
import multer, { diskStorage } from "multer";
import path from "path";

const checkFolderAndCreateIfNotExists = (pathToFolder: string) => {
  if (!existsSync(pathToFolder)) {
    mkdirSync(pathToFolder, { recursive: true });
  }
};

const storage = diskStorage({
  destination: function (req: Request, file, cb) {
    const read_access = req.body.access;
    if (
      read_access !== ReadAccess.PRIVATE &&
      read_access !== ReadAccess.PUBLIC
    ) {
      return cb(
        new BadRequestError({
          message:
            "The 'access' field is required and must be either private or public",
        }),
        ""
      );
    }

    const dest = CONFIG.image_upload_path;
    checkFolderAndCreateIfNotExists(dest);
    cb(null, dest);
  },
  filename: function (req: Request, file, cb) {
    try {
      const read_access = req.body.access;
      if (
        read_access !== ReadAccess.PRIVATE &&
        read_access !== ReadAccess.PUBLIC
      ) {
        return cb(
          new BadRequestError({
            message: "Invalid read access",
          }),
          ""
        );
      }
      const uniqueSuffix = generateUID(6);
      const ext = getFileExtension(file.originalname); //without dot
      if (!CONFIG.allowed_image_extensions.includes(ext)) {
        return cb(
          new BadRequestError({
            message: `Invalid file extension, only ${CONFIG.allowed_image_extensions.join(
              ", "
            )} are allowed.`,
          }),
          ""
        );
      }
      if (file.size > CONFIG.allowed_image_sizes.free.bytes) {
        console.log("throwing file size error...");
        return cb(
          new BadRequestError({
            message: `File size exceeds the allowed limit of ${CONFIG.allowed_image_sizes.free.text}`,
          }),
          ""
        );
      }
      cb(null, `${uniqueSuffix}.${ext}`);
    } catch (error: any) {
      return cb(
        new BadRequestError({
          message: error.message,
        }),
        ""
      );
    }
  },
});

const uploadMiddleware = multer({ storage: storage }).single("image");

export const fileSizeController = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const file = req.file!;
  const filename = file.filename;

  if (file.size > CONFIG.allowed_image_sizes.free.bytes) {
    // delete the file
    imageStoreService.deleteImageFromFS(filename);

    // throw that error
    throw new BadRequestError({
      message: `File size exceeds the allowed limit of ${CONFIG.allowed_image_sizes.free.text}`,
    });
  }

  next();
};

export default uploadMiddleware;
