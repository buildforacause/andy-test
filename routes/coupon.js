const express = require("express");
const router = express.Router();
const couponController = require("../controller/coupon");

router.post("/check", couponController.check);
router.get("/all", couponController.all);

router.post("/add", couponController.add);
router.post("/edit", couponController.edit);
router.post("/delete", couponController.delete);

module.exports = router;
