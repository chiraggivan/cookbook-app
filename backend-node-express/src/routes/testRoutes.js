const express = require("express");
const router = express.Router();

router.get("/test", (req, res) => {
  res.json({
    message: "This is coming from test route using Router",
    success: true,
  });
});

module.exports = router;
