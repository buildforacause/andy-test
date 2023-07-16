const mongoose = require("mongoose");

const secondarybanner = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const secondarybannerModel = mongoose.model("secondarybanner", secondarybanner);
module.exports = secondarybannerModel;
