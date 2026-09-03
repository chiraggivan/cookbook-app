const multer = require("multer");

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG and WebP images are allowed."));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 6 * 1024 * 1024, // 6 MB
  },
});

module.exports = upload;

// const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploadedImages/");
//   },

//   filename: function (req, file, cb) {
//     const uniqueName = Date.now() + "-" + req.user.id + path.extname(file.originalname);

//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage: storage,
// });
