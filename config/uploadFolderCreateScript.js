const fs = require("fs");

const categoriesFolder = "./public/uploads/categories";
const customizeFolder = "./public/uploads/customize";
const productsFolder = "./public/uploads/products";
const customizedsportswearFolder = "./public/uploads/customizedsportswear"

const CreateAllFolder = () => {
  if (!fs.existsSync(categoriesFolder)) {
    fs.mkdirSync(categoriesFolder, {
      recursive: true,
    });
  }

  if (!fs.existsSync(customizeFolder)) {
    fs.mkdirSync(customizeFolder, {
      recursive: true,
    });
  }

  if (!fs.existsSync(productsFolder)) {
    fs.mkdirSync(productsFolder, {
      recursive: true,
    });
  }

  if (!fs.existsSync(customizedsportswearFolder)) {
    fs.mkdirSync(customizedsportswearFolder, {
      recursive: true,
    });
  }
};

module.exports = CreateAllFolder;
