import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || "429138998788435",
  api_secret: process.env.CLOUDINARY_API_SECRET || "y2F6NLVW0Ku3NzbVGZEIbF8MK8o",
  secure: true,
});

export default cloudinary;
