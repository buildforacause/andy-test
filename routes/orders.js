const express = require("express");
const router = express.Router();
const ordersController = require("../controller/orders");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/customer");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/get-all-orders", ordersController.getAllOrders);

router.post("/order-by-user", ordersController.getOrderByUser);
router.post("/update-order-status", ordersController.postUpdateOrder2)
router.post("/create-order", upload.any(), ordersController.postCreateOrder);
router.post("/update-order", ordersController.postUpdateOrder);
router.post("/delete-order", ordersController.postDeleteOrder);
router.post("/return-add", ordersController.addReturn);

module.exports = router;
