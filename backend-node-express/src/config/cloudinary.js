const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (buffer, folder = "cookbook-app") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          {
            aspect_ratio: "16:9",
            crop: "fill",
            gravity: "auto",
          },
          {
            width: 1200,
            crop: "limit",
          },
        ],
        quality: "auto",
        fetch_format: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
};
