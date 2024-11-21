const customizedSportswearModel = require("../models/customizedsportswear");
const fs = require("fs");
const path = require("path");

class customizedSportswear {
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

//   async all(req, res) {
//     try {
//       let customizedSportswear = await customizedSportswearModel.find({})[0];

//       if (customizedSportswearModel) {
//         return res.json({ customizedSportswearModel });
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   }

  async add(req, res) {
    let {link } = req.body;
    let image = req.file.filename;
    // Validation
    if (
      !link
    ) {
        const filePath = `../server/public/customizedsportswear/${image}`;
        fs.unlink(filePath, (err) => {
            if (err) {
            
              console.log(err);
            }
            const message = `❌Process cancelled. Kindly share the URL for the Instagram Post`;
            return res.redirect(`/admin/customized-sportswear-view?message=${encodeURIComponent(message)}`);
          });
    }
    else if(!image){
        const message = `❌Process cancelled. Kindly provide Image for the Customized Sportswear`;
        return res.redirect(`/admin/customized-sportswear-view?message=${encodeURIComponent(message)}`);
    }
    else {
      try {
        let uploadimage = "/uploads/customizedsportswear/" +image;
        let newcustomizedSportswear = new customizedSportswearModel({
          image: uploadimage,
          link: link,
          disabled: false
        });
        let save = await newcustomizedSportswear.save();
        if (save) {
            const message = "✅Added the Customized Sportswear image successfully!";
            return res.redirect(`/admin/customized-sportswear-view?message=${encodeURIComponent(message)}`);  
        }
      } catch (err) {
        const message = `❌${err}`;
        return res.redirect(`/admin/customized-sportswear-view?message=${encodeURIComponent(message)}`);
      }
    }
  }

  async edit(req, res) {
    let {
      prev_id,
      prev_image,
      link
    } = req.body;
    
    let editImages=req.files;


    // Validate other fileds
    if (
      !prev_id | !link
    ) {
      return res.json({ error: "Link field is required" });
    }
    else {
      let editData = {
        link:link
      };
      if(editImages.length>0){
        let i = "/uploads/customizedsportswear/" +editImages[0].filename;
        editData = { ...editData, image: i };
        customizedSportswear.deleteImages(prev_image, "file");
      }else{
        editData = { ...editData, image: prev_image };
      }
      try {
        let customizedSportswear = customizedSportswearModel.findByIdAndUpdate(prev_id, editData);
        customizedSportswear.exec((err) => {
          if (err) console.log(err);
          const message = "✅Edited Customized Sportswear successfully!";
          return res.redirect("/admin/customized-sportswear-view/"+`?message=${encodeURIComponent(message)}`);
        });
      } catch (err) {
          const message = "❌Error editing the Customized Sportswear";
          return res.redirect("/admin/customized-sportswear-view/"+`?message=${encodeURIComponent(message)}`);
      }
    }
  }

  async deleteCustomImage(req, res) {
    let { id } = req.body;
    if (!id) {
      return res.json({ error: "All field required" });
    } else {
      try {
        let deletedCustomImage = await customizedSportswearModel.findById(id);
        
        const filePath = path.resolve(__dirname + "../../") + "/public" + deletedCustomImage.image;

        let deleteImage = await customizedSportswearModel.findByIdAndDelete(id);
        if (deleteImage) {
          // Delete Image from uploads -> customizes folder
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log(err);
            }
            const message = "✅Deleted the Customized Sportswear image successfully!";
            return res.redirect(`/admin/customized-sportswear-view?message=${encodeURIComponent(message)}`);
          });
        }
      } catch (err) {
        const message = `❌${err}`;
        return res.redirect(`/admin/customized-sportswear-view?message=${encodeURIComponent(message)}`);
      }
    }
  }

}




const customizedSportswearController = new customizedSportswear();
module.exports = customizedSportswearController;
