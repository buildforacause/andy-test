const express = require("express");
const router = express.Router();
const secondarybannerController = require("../controller/secondarybanner");
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

router.get("/all", secondarybannerController.all);

router.post("/add-banner", upload.any(), secondarybannerController.add);
router.post("/edit-banner", upload.any(), secondarybannerController.edit);

module.exports = router;

