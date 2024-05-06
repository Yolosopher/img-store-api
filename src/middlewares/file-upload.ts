import CONFIG from "@/config";
import BadRequestError from "@/errors/BadRequestError";
import { ReadAccess } from "@/models/image-store/types";
import getFileExtension from "@/utils/file-extention";
import generateUID from "@/utils/generateUID";
import { Request } from "express";
import { existsSync, mkdirSync } from "fs";
import multer, { diskStorage } from "multer";

const checkFolderAndCreateIfNotExists = (pathToFolder: string) => {
  if (!existsSync(pathToFolder)) {
    mkdirSync(pathToFolder, { recursive: true });
  }
};

const storage = diskStorage({
  destination: function (req: Request, file, cb) {
    const read_access = req.body.read_access;
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

    const dest = CONFIG.image_upload_path;
    console.log("dest", dest);

    checkFolderAndCreateIfNotExists(dest);
    cb(null, dest);
  },
  filename: function (req: Request, file, cb) {
    const read_access = req.body.read_access;
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
    cb(null, `${uniqueSuffix}.${ext}`);
  },
});

const uploadMiddleware = multer({ storage: storage }).single("image");

export default uploadMiddleware;
