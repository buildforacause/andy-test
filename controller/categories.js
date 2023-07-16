const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const fs = require("fs");

class Category {
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
    console.log(cName);
      cName = toTitleCase(cName);
      try {
        let checkCategoryExists = await categoryModel.findOne({ cName: cName });
        if (checkCategoryExists) {
            return res.json({ error: "Category already exists" });
        } else {
          let newCategory = new categoryModel({
            cName: cName,
            cDescription:cDescription,
            cStatus:cStatus
          });
          await newCategory.save((err) => {
            if (!err) {
              return res.redirect("/admin/category-view");
            }
          });
        }
      } catch (err) {
        console.log(err);
      }
  }

  async postEditCategory(req, res) {
    let { cId, cName, cDescription, cStatus } = req.body;
    if (!cId | !cName | !cDescription | !cStatus) {
      return res.json({ error: "All fields are required" });
    }
    try {
      let editCategory = categoryModel.findByIdAndUpdate(cId, {
        cDescription:cDescription,
        cName : cName,
        cStatus:cStatus,
        updatedAt: Date.now(),
      });
      let edit = await editCategory.exec();
      if (edit) {
        return res.redirect("/admin/category-edit/" + cId);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getDeleteCategory(req, res) {
    let { cId } = req.body;
    if (!cId) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let deleteCategory = await categoryModel.findByIdAndDelete(cId);
        if (deleteCategory) {
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
