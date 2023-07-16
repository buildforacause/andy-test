const sponsorModel = require("../models/sponsor");
const fs = require("fs");
const path = require("path");

class Sponsor {
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

  async getAllSponsor(req, res) {
    try {
      let sponsors = await sponsorModel.find({});

      if (sponsors) {
        return res.json({ sponsors });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddSponsor(req, res) {
    let { name } = req.body;
    let images = req.files;
    // Validation
    if (
      !name
    ) {
      Sponsor.deleteImages(images[0], "file");
      return res.json({ error: "All fields are required" });
    }
    // Validate Name and description
    else if (name.length > 255) {
      Sponsor.deleteImages(images[0], "file");
      return res.json({
        error: "Name must not be more than 255 characters",
      });
    }
    // Validate Images
    else {
      try {
        let i = "/uploads/products/" +images[0].filename;
        let newSponsor = new sponsorModel({
          image: i,
          name: name,
        });
        let save = await newSponsor.save();
        if (save) {
          return res.redirect("/admin/sponsor-view")
          // return res.json({ success: "Sponsor created successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postEditSponsor(req, res) {
    let {
      _id,
      name,
      previmage,
    } = req.body;
    let editImages = req.files;

    // Validate other fileds
    if (
      !_id |
      !name
    ) {
      return res.json({ error: "All fields are required" });
    }
    // Validate Name and description
    else if (name.length > 255) {
      return res.json({
        error: "Name must not be 255 character long",
      });
    }
    // Validate Update Images
    else {
      let editData = {
        name: name,
      };
        let i = "/uploads/products/" +editImages[0].filename;
        editData = { ...editData, image: i };
        Sponsor.deleteImages(previmage, "file");
      try {
        let editSponsor = sponsorModel.findByIdAndUpdate(_id, editData);
        editSponsor.exec((err) => {
          if (err) console.log(err);
          return res.redirect("/admin/sponsor-edit/" + _id)
        });
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getDeleteSponsor(req, res) {
    let { _id } = req.body;
    if (!_id) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let deleteSponsorObj = await sponsorModel.findById(_id);
        let deleteSponsor = await sponsorModel.findByIdAndDelete(_id);
        if (deleteSponsor) {
          // Delete Image from uploads -> products folder
          Sponsor.deleteImages(deleteSponsorObj.image, "file");
          return res.redirect("/admin/sponsor-view");
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

}

const sponsorController = new Sponsor();
module.exports = sponsorController;
