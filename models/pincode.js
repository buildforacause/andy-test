const mongoose = require("mongoose");

const pincodeSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const pincodeModel = mongoose.model("pincodes", pincodeSchema);
module.exports = pincodeModel;
