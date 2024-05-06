import CONFIG from "@/config";
import ForbiddenError from "@/errors/ForbiddenError";
import NotFoundError from "@/errors/NotFoundError";
import ImageStore from "@/models/image-store";
import { ImageStoreModel, ReadAccess } from "@/models/image-store/types";
import { unlink } from "fs";
import path from "path";

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
      deleted_image: image,
    };
  }
  public async getMyImages(owner: string) {
    return await this.imageStoreModel.find({ owner });
  }

  private deleteImageFromFS(name: string) {
    const imagePath = this.getImagePath(name);
    unlink(imagePath, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  public getImagePath(name: string) {
    return path.resolve(CONFIG.image_upload_path, name);
  }
}

const imageStoreService = new ImageStoreService(ImageStore);

export default imageStoreService;
