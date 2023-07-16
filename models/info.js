const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema(
  {
    _id: { type: String},
    about: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    }
  },{ timestamps: true },
);

const infoModel = mongoose.model("info", infoSchema);
module.exports = infoModel;
