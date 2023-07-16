const infoModel = require("../models/info");
const fs = require("fs");
const path = require("path");

class Info {
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

  async postEditInfo(req, res) {
    let {
      _id,
      about,
      name,
      previmage,
      phone,
      address,
      email
    } = req.body;
    let editImages = req.files;

    // Validate other fileds
    if (
      !_id |
      !about|
      !phone|
      !address|
      !email|
      !name
    ) {
      return res.json({ error: "All fields are required" });
    }
    // Validate Update Images
    else {
      let editData = {
        about: about,
        phone: phone,
        address: address,
        email: email,
        name : name
      };
        let i = "/uploads/products/" +editImages[0].filename;
        editData = { ...editData, image: i };
        Info.deleteImages(previmage, "file");
      try {
        let editSponsor = await infoModel.findByIdAndUpdate(_id, editData);
        let save = await editSponsor.save()
        if(save){
            return res.redirect("/admin");
        }else{
            let editSponsor = await infoModel.findByIdAndUpdate(_id, editData);
            await editSponsor.save()
            if (err) console.log(err);
            return res.redirect("/admin")
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

}

const infoController = new Info();
module.exports = infoController;
