const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const addressSchema = new mongoose.Schema(
  {
    aname: {
      type: String,
      required: true,
    },
    aaddress: {
      type: String,
      required: true,
    },
    acity: {
      type: String,
      required: true,
    },
    apincode: {
      type: Number,
      required: true,
  },
    aphone: {
        type: Number,
        required: true,
    },
    user: {
      type: ObjectId,
      ref: "users",
    }
  },
  { timestamps: true }
);

const addressModel = mongoose.model("address", addressSchema);
module.exports = addressModel;
