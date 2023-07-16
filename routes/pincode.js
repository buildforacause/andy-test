const express = require("express");
const router = express.Router();
const pincodeController = require("../controller/pincode");

router.post("/check-pincode", pincodeController.checkPincode);
router.get("/all-pincode", pincodeController.allPincode);

router.post("/add-pincode", pincodeController.addPincode);
router.post("/edit-pincode", pincodeController.editPincode);
router.post("/delete-pincode", pincodeController.deletePincode);

module.exports = router;

