const express = require("express");
const router = express.Router();
const infoController = require("../controller/info");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/products");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/info", upload.any(), infoController.postEditInfo);

module.exports = router;

