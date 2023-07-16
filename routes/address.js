const express = require("express");
const router = express.Router();
const addressController = require("../controller/address");

router.post("/add", addressController.postAddress);
router.post("/delete", addressController.getDeleteAddress);

module.exports = router;
