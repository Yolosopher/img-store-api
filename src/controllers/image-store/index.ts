import CONFIG from "@/config";
import ForbiddenError from "@/errors/ForbiddenError";
import { ReadAccess } from "@/models/image-store/types";
import imageStoreService, { GetMyImagesParams } from "@/services/image-store";
import { Request, Response } from "express";

class ImageStoreController {
  constructor() {}
  public async uploadImage(req: Request, res: Response) {
    const { user_id } = req.api_token!;
    const file = req.file as Express.Multer.File;
    const read_access = req.body.access as ReadAccess;

    const image = await imageStoreService.create({
      owner: user_id,
      name: file.filename,
      read_access,
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      image_name: image.name,
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

    return res.status(200).json(image);
  }
  public async getMyImages(req: Request, res: Response) {
    const { user_id } = req.api_token!;

    const { access } = req.query;

    const query: GetMyImagesParams = {
      owner: user_id,
    };
    if (access === ReadAccess.PUBLIC) {
      query.read_access = ReadAccess.PUBLIC;
    } else if (access === ReadAccess.PRIVATE) {
      query.read_access = ReadAccess.PRIVATE;
    }

    const images = await imageStoreService.getMyImages(query);

    res.status(200).json(images);
  }
  public async changeImageAccess(req: Request, res: Response) {
    const { name } = req.params;
    const { access } = req.body;
    const user_id = req.api_token!.user_id;

    const image = await imageStoreService.changeImageAccess({
      name,
      access,
      subject_id: user_id,
    });

    res.status(200).json(image);
  }
}

const imageStoreController = new ImageStoreController();

export default imageStoreController;
