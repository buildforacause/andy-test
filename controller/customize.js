const fs = require("fs");
const customizeModel = require("../models/customize");

class Customize {
  async getImages(req, res) {
    try {
      let Images = await customizeModel.find({});
      if (Images) {
        return res.json({ Images });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async uploadSlideImage(req, res) {
    let image = req.file.filename;
    if (!image) {
      return res.json({ error: "All field required" });
    }
    try {
      let upload_image = "/uploads/customize/" + image;
      let newCustomzie = new customizeModel({
        slideImage: upload_image,
      });
      let save = await newCustomzie.save();
      if (save) {
        const message = "✅Added the slider image successfully!";
        return res.redirect(`/admin/slider-view?message=${encodeURIComponent(message)}`);
      }
    } catch (err) {
      const message = `❌${err}`;
        return res.redirect(`/admin/slider-view?message=${encodeURIComponent(message)}`);
    }
  }

  async deleteSlideImage(req, res) {
    let { id } = req.body;
    if (!id) {
      return res.json({ error: "All field required" });
    } else {
      try {
        let deletedSlideImage = await customizeModel.findById(id);
        const filePath = `../server/public/${deletedSlideImage.slideImage}`;

        let deleteImage = await customizeModel.findByIdAndDelete(id);
        if (deleteImage) {
          // Delete Image from uploads -> customizes folder
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log(err);
            }
            const message = "✅Deleted the slider image successfully!";
            return res.redirect(`/admin/slider-view?message=${encodeURIComponent(message)}`);
          });
        }
      } catch (err) {
        const message = `❌${err}`;
        return res.redirect(`/admin/slider-view?message=${encodeURIComponent(message)}`);
      }
    }
  }
}

const customizeController = new Customize();
module.exports = customizeController;
