const express = require("express");
const router = express.Router();
const customizedSportswearController = require("../controller/customizedsportswear");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/customizedsportswear");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// router.get("/all", customizedSportswearController.all);

router.post("/upload-image", upload.single("image"), customizedSportswearController.add);
router.post("/edit-image", upload.any(), customizedSportswearController.edit);
router.post("/delete-image", customizedSportswearController.deleteCustomImage);


module.exports = router;

