const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    coupon: {
      type: String,
      required: true,
    },
    discount: {
        type: Number,
        required: true
    }
  },
  { timestamps: true }
);

const couponModel = mongoose.model("coupons", couponSchema);
module.exports = couponModel;
