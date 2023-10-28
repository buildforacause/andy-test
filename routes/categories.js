const express = require("express");
const router = express.Router();
const categoryController = require("../controller/categories");
const multer = require("multer");
const { loginCheck } = require("../middleware/auth");

// Image Upload setting
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/categories");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/all-category", categoryController.getAllCategory);
router.post(
  "/add-category", upload.any(),
  categoryController.postAddCategory
);
router.post("/edit-category", upload.any(), categoryController.postEditCategory);
router.post(
  "/delete-category",
  categoryController.getDeleteCategory
);

module.exports = router;
