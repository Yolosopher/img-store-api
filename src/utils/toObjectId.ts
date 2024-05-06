import { Types } from "mongoose";

const toObjectId = (id: string) => new Types.ObjectId(id);

export default toObjectId;
