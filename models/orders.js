const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const orderSchema = new mongoose.Schema(
  {
    allProduct: [
      {
        id: { type: ObjectId, ref: "products" },
        quantity: Number,
      },
    ],
    user: {
      type: ObjectId,
      ref: "users",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    transactionScreenShot: { //temporary payment gw
      type: String,
      default: "Not Uploaded",
    },
    address: {
      type: ObjectId,
      ref: "address",
    },
    notes: {
      type: String,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    approval: {
      type: String,
      default: "Not approved",
      enum: [
        "Not approved",
        "Approved",
      ],
    },
    status: {
      type: String,
      default: "Not processed",
      enum: [
        "Not processed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
    },
    refund: {
      type: Object,
      required: false,
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("orders", orderSchema);
module.exports = orderModel;
