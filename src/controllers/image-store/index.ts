import CONFIG from "@/config";
import ForbiddenError from "@/errors/ForbiddenError";
import { ReadAccess } from "@/models/image-store/types";
import imageStoreService from "@/services/image-store";
import { Request, Response } from "express";

class ImageStoreController {
  constructor() {}
  public async uploadImage(req: Request, res: Response) {
    const { user_id } = req.api_token!;
    const file = req.file as Express.Multer.File;
    const read_access = req.body.read_access as ReadAccess;

    const image = await imageStoreService.create({
      owner: user_id,
      name: file.filename,
      read_access,
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      image,
    });
  }
  public async getImage(req: Request, res: Response) {
    const { name } = req.params;

    const image = await imageStoreService.getOne(name);
    if (image.read_access === ReadAccess.PRIVATE) {
      // check if the user is the owner of the image

      if (!req.api_token || req.api_token.user_id !== image.owner.toString()) {
        throw new ForbiddenError({
          message: "You do not have permission to access this image",
        });
      }
    }

    const imagePath = imageStoreService.getImagePath(name);

    return res.sendFile(imagePath);
  }
  public async deleteImage(req: Request, res: Response) {
    const { name } = req.params;
    const user_id = req.api_token!.user_id;

    const image = await imageStoreService.delete({
      name,
      subject_id: user_id,
    });

    res.status(200).json(image);
  }
  public async getMyImages(req: Request, res: Response) {
    const { user_id } = req.api_token!;
    const images = await imageStoreService.getMyImages(user_id);

    res.status(200).json(images);
  }
}

const imageStoreController = new ImageStoreController();

export default imageStoreController;
