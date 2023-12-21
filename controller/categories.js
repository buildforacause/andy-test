const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const fs = require("fs");
const path = require("path");

class Category {
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

  async getAllCategory(req, res) {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.json({ Categories });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddCategory(req, res) {
    let { cName, cDescription, cStatus } = req.body;
    let images = req.files;

    cName = toTitleCase(cName);
      try {
        let checkCategoryExists = await categoryModel.findOne({ cName: cName });
        if (checkCategoryExists) {
            Category.deleteImages(images[0], "file");
            // return res.json({ error: "Category already exists" });
            let message="❌Category already exists!"
            return res.redirect("/admin/category-view"+`?message=${encodeURIComponent(message)}`);
        } else {
          let i = "/uploads/categories/" +images[0].filename;
          let newCategory = new categoryModel({
            cName: cName,
            cDescription:cDescription,
            cStatus:cStatus,
            cImage: i
          });
          await newCategory.save((err) => {
            if (!err) {
              let message="✅Successfully added the category!"
              return res.redirect("/admin/category-view"+`?message=${encodeURIComponent(message)}`);
            }
          });
        }
      } catch (err) {
        console.log(err);
        let message="❌Error adding the category!"
        return res.redirect("/admin/category-view"+`?message=${encodeURIComponent(message)}`);
      }
  }

  async postEditCategory(req, res) {
    let { cId, cName, cDescription, cStatus, previmage } = req.body;
    let editImages = req.files;

    if (!cId | !cName | !cDescription | !cStatus) {
      // return res.json({ error: "All fields are required" });
      let message="❌All fields are required!"
      return res.redirect("/admin/category-edit/" + cId+`?message=${encodeURIComponent(message)}`);
    }
    try {
      let i = previmage;
      if(editImages.length > 0){
        i = "/uploads/categories/" +editImages[0].filename;
      }else if(previmage.length < 1){
        //  return res.json({ error: "Image required" });
         let message="❌Images are required!"
          return res.redirect("/admin/category-edit/" + cId+`?message=${encodeURIComponent(message)}`);
      }
      let editCategory = categoryModel.findByIdAndUpdate(cId, {
        cDescription:cDescription,
        cName : cName,
        cStatus:cStatus,
        cImage: i,
        updatedAt: Date.now(),
      });
      let edit = await editCategory.exec();
      if (edit) {
        let message="✅Successfully edited the category!"
        return res.redirect("/admin/category-edit/" + cId+`?message=${encodeURIComponent(message)}`);
      }
    } catch (err) {
        console.log(err);
        let message="❌Error editing the category!"
        return res.redirect("/admin/category-edit/" + cId+`?message=${encodeURIComponent(message)}`);
    }
  }

  async getDeleteCategory(req, res) {
    let { cId } = req.body;
    if (!cId) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let deleteProductObj = await categoryModel.findById(cId);
        let deleteCategory = await categoryModel.findByIdAndDelete(cId);
        if (deleteCategory) {
          // Delete Image from uploads -> products folder
          Category.deleteImages(deleteProductObj.cImage, "string");
          return res.redirect("/admin/category-view");
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
