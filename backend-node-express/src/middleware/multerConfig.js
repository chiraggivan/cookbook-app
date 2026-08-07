const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploadedImages/");
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + req.user.id + path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
});

module.exports = upload;
