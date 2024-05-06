import { randomBytes } from "crypto";

const generateUID = (length: number = 3) => {
  return randomBytes(length).toString("hex");
};

export default generateUID;
