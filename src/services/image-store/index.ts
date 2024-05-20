import CONFIG from "@/config";
import BadRequestError from "@/errors/BadRequestError";
import ForbiddenError from "@/errors/ForbiddenError";
import NotFoundError from "@/errors/NotFoundError";
import ImageStore from "@/models/image-store";
import { ImageStoreModel, ReadAccess } from "@/models/image-store/types";
import { existsSync, unlink } from "fs";
import path from "path";

export type GetMyImagesParams = {
  owner: string;
  read_access?: ReadAccess;
};

class ImageStoreService {
  constructor(private imageStoreModel: ImageStoreModel) {}

  public async create({
    owner,
    name,
    read_access,
  }: {
    owner: string;
    name: string;
    read_access: ReadAccess;
  }) {
    return await this.imageStoreModel.create({ owner, name, read_access });
  }
  public async getOne(name: string) {
    const image = await this.imageStoreModel.findOne({ name });
    if (!image) {
      throw new NotFoundError({
        message: "Image not found",
      });
    }
    return image;
  }
  public async delete({
    name,
    subject_id,
  }: {
    name: string;
    subject_id: string;
  }) {
    const image = await this.getOne(name);

    // check owner
    if (image.owner.toString() !== subject_id) {
      throw new ForbiddenError({
        message: "You do not have permission to delete this image",
      });
    }

    await this.imageStoreModel.findByIdAndDelete(image._id.toString());

    // delete image from file system
    this.deleteImageFromFS(name);

    return {
      message: "Image deleted successfully",
      deleted_image_name: image.name,
    };
  }
  public async getMyImages(query: GetMyImagesParams) {
    return await this.imageStoreModel.find(query).sort("created_at");
  }

  public deleteImageFromFS(name: string) {
    const imagePath = this.getImagePath(name);
    unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  public getImagePath(name: string) {
    const pth = path.resolve(CONFIG.image_upload_path, name);
    // check if the image exists

    if (existsSync(pth) === false) {
      throw new NotFoundError({
        message: "Image file not found",
      });
    }

    return pth;
  }

  public async changeImageAccess({
    name,
    subject_id,
    access,
  }: {
    name: string;
    subject_id: string;
    access: ReadAccess;
  }) {
    const image = await this.getOne(name);

    if (image.owner.toString() !== subject_id) {
      throw new ForbiddenError({
        message: "You do not have permission to change access of this image",
      });
    }

    if (image.read_access === access) {
      throw new BadRequestError({
        message: "Image access is already set to this value",
      });
    }

    image.read_access = access;
    await image.save();

    return {
      message: "Image access changed successfully",
      image_name: image.name,
      new_access: image.read_access,
    };
  }
}

const imageStoreService = new ImageStoreService(ImageStore);

export default imageStoreService;
