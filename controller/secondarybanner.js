const secondarybannerModel = require("../models/secondarybanner");
const fs = require("fs");
const path = require("path");

class secondarybanner {
  // Delete Image from uploads -> products folder
  static deleteImages(images, mode) {
    var basePath =
      path.resolve(__dirname + "../../") + "/public";
      let filePath = "";
      if (mode == "file") {
        filePath = basePath + `${images}`;
        console.log(filePath);
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
      }
  }

  async all(req, res) {
    try {
      let secondarybanner = await secondarybannerModel.find({})[0];

      if (secondarybanner) {
        return res.json({ secondarybanner });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async add(req, res) {
    let { title, description, link } = req.body;
    let images = req.files;
    // Validation
    if (
      !link
    ) {
    secondarybanner.deleteImages(images[0], "file");
      return res.json({ error: "Link is required" });
    }
    else {
      try {
        let i = "/uploads/products/" +images[0].filename;
        let newsecondarybanner = new secondarybannerModel({
          image: i,
          title: title,
          link: link,
          description: description
        });
        let save = await newsecondarybanner.save();
        if (save) {
          return res.redirect("/admin/banner-view")
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async edit(req, res) {
    let {
      _id,
      title,
      previmage,
      description,
      link
    } = req.body;
    let editImages = req.files;

    // Validate other fileds
    if (
      !_id | !link
    ) {
      return res.json({ error: "Link field is required" });
    }
    else {
      let editData = {
        title: title,
        description: description,
        link:link
      };
      if(editImages.length > 0){
        let i = "/uploads/products/" +editImages[0].filename;
        editData = { ...editData, image: i };
        secondarybanner.deleteImages(previmage, "file");
      }else{
        editData = { ...editData, image: previmage };
      }
      try {
        let secondarybanneredit = secondarybannerModel.findByIdAndUpdate(_id, editData);
        secondarybanneredit.exec((err) => {
          if (err) console.log(err);
          const message = "✅Edited banner successfully!";
          return res.redirect("/admin/banner-view/"+`?message=${encodeURIComponent(message)}`);
        });
      } catch (err) {
          const message = "❌Error editing the banner";
          return res.redirect("/admin/banner-view/"+`?message=${encodeURIComponent(message)}`);
      }
    }
  }

}

const secondarybannerController = new secondarybanner();
module.exports = secondarybannerController;
