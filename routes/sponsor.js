const express = require("express");
const router = express.Router();
const sponsorController = require("../controller/sponsor");
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

router.get("/all", sponsorController.getAllSponsor);

router.post("/add-sponsor", upload.any(),sponsorController.postAddSponsor);
router.post("/edit-sponsor", upload.any(),sponsorController.postEditSponsor);
router.post("/delete-sponsor", sponsorController.getDeleteSponsor);

module.exports = router;

