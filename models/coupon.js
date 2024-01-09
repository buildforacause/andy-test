const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const couponSchema = new mongoose.Schema(
  {
    coupon: {
      type: String,
      required: true,
    },
    discount: {
        type: Number,
        required: true
    },
    user: {
      type: ObjectId,
      ref: "users",
    }, 
    status: {
      type: Number,
      default: 1
    },
  },
  { timestamps: true }
);

const couponModel = mongoose.model("coupons", couponSchema);
module.exports = couponModel;
