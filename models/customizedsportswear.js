const mongoose = require("mongoose");
const { link } = require("../routes/admin");

const customizedSportswearSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required:true,
    },
    link:{
      type:String,
      required:true,
    },
    disabled:{
      type:Boolean,
      required:true,
    }

  },
  { timestamps: true }
);

const customizedSportswearModel = mongoose.model("customizedSportswear", customizedSportswearSchema);
module.exports = customizedSportswearModel;
