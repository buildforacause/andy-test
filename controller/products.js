const productModel = require("../models/products");
const fs = require("fs");
const path = require("path");

async function getProductSize(SKU,SIZE) {
  SIZE = SIZE.trim().toLowerCase()
  try { 
    let Products = await productModel
      .find({SKU:SKU})
    if (Products.length > 0) {
      const secondNameParts = Products.reduce((result, product) => {
        const parts = product.name.split('-');
        if (parts.length >= 2) {
          result.push(parts[parts.length - 1].trim().toLowerCase());
        }
        return result;
      }, []);
      const isPresent = secondNameParts.includes(SIZE);
      return isPresent;
    }
  } catch (err) {
    return 0
  }
}

class Product {
  // Delete Image from uploads -> products folder
  static deleteImages(images, mode) {
    var basePath =
      path.resolve(__dirname + "../../") + "/public";
    console.log(basePath);
    for (var i = 0; i < images.length; i++) {
      let filePath = "";
      if (mode == "file") {
        filePath = basePath + `${images[i].filename}`;
      } else {
        filePath = basePath + `${images[i]}`;
      }
      console.log(filePath);
      if (fs.existsSync(filePath)) {
        console.log("Exists image");
      }
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
    }
  }

  async getAllProduct(req, res) {
    try {
      let Products = await productModel
        .find({})
        .populate("category", "_id cName")
        .sort({ _id: -1 });
      if (Products) {
        return res.json({ Products });
      }
    } catch (err) {
      console.log(err);
    }
  }



  async postAddProduct(req, res) {
    let { name, description,weight, price, quantity, category, offer, status, SKU, company, featured, shipping, previmages, sizes } =
      req.body;
    let images = req.files;
    let ok = 1;
    // Validation
    if (
      !name |
      !description |
      !weight |
      !price |
      !quantity |
      !category |
      !offer |
      !status |
      !SKU |
      !company
    ) {
      return res.json({ error: "All fields are required" });
    }
    // Validate Name and description
    else if (name.length > 255 || description.length > 3000) {
      return res.json({
        error: "Name should not be more than 255 characters & Description should not be more than 3000 characters",
      });
    }
    // Validate Images
    else if (images !== undefined) {
        if (images.length < 2 && previmages == undefined) {
            Product.deleteImages(images, "file");
            return res.json({ error: "Must need to provide 2 images" });
        }
    }
    let check = await getProductSize(SKU,sizes);
    if(check){
      return res.json({ error: "Already added a product with that size in this SKU!" });
    }
      try {
        if(previmages !== undefined){
          if(previmages.length > 1){
            images = previmages.join(",")
            ok = 0;
          }
        }
        let allImages = [];
        if(ok == 1){
        for (const img of images) {
            allImages.push("/uploads/products/" +img.filename);
          }
        }else{
          allImages = images.split(",");
        }
        let featured_n = (featured == 0 ? false : true);
        let shipping_n = (shipping == 0 ? false : true);
        name = name.replace(/-/g, ' ');
        name = name + "-" + sizes;
        let newProduct = new productModel({
          image: allImages,
          name: name,
          weight:weight,
          description: description,
          price: price,
          quantity: quantity,
          category: category,
          offer: offer,
          status: status,
          SKU: SKU,
          company: company,
          featured: featured_n,
          shipping: shipping_n
        });
        let save = await newProduct.save();
        if (save) {
          let message="✅Successfully added the product!"
          return res.redirect("/admin/product-view/"+`?message=${encodeURIComponent(message)}`)
          // return res.json({ success: "Product created successfully" });
        }
      } catch (err) {
        let message="❌Error adding the product!"
        return res.redirect("/admin/product-view/"+`?message=${encodeURIComponent(message)}`)
    }

  }

  async postEditProduct(req, res) {
    let {
      _id,
      name,
      description,
      price,
      quantity,
      category,
      offer,
      weight,
      status,
      images,
      company,
      featured, shipping
    } = req.body;
    let editImages = req.files;

    // Validate other fileds
    if (
      !_id |
      !name |
      !description |
      !price |
      !quantity |
      !category |
      !weight |
      !offer |
      !status |
      !company
    ) {
      // return res.json({ error: "All fields must be required" });
      let message="❌All fields must be required";
      return res.redirect("/admin/product-edit/" + _id + `?message=${encodeURIComponent(message)}`);
    }
    // Validate Name and description
    else if (name.length > 255 || description.length > 3000) {
      // return res.json({
      //   error: "Name 255 & Description must not be 3000 charecter long",
      // });
      let message="❌Name 255 & Description must not be 3000 charecter long";
      return res.redirect("/admin/product-edit/" + _id + `?message=${encodeURIComponent(message)}`);
    }
    
    // Validate Update Images
    else {
      let featured_n = (featured == 0 ? false : true);
      let shipping_n = (shipping == 0 ? false : true);
      let editData = {
        name: name,
        description: description,
        weight:weight,
        price: price,
        quantity: quantity,
        category: category,
        offer: offer,
        status: status,
        company: company,
        featured: featured_n,
        shipping: shipping_n
      };
      images = images.join(",")
      if (editImages.length >= 2) {
        let allEditImages = [];
        for (const img of editImages) {
          allEditImages.push("/uploads/products/" +img.filename);
        }
        editData = { ...editData, image: allEditImages };
        Product.deleteImages(images.split(","), "string");
      }
      try {
        let editProduct = productModel.findByIdAndUpdate(_id, editData);
        editProduct.exec((err) => {
          if (err) console.log(err);
          let message="✅Successfully edited the product!"
          return res.redirect("/admin/product-edit/" + _id + `?message=${encodeURIComponent(message)}`)
        });
      } catch (err) {
        let message="❌Error editing the product."
        return res.redirect("/admin/product-edit/" + _id + `?message=${encodeURIComponent(message)}`)
      }
    }
  }

  async getDeleteProduct(req, res) {
    let { _id } = req.body;
    if (!_id) {
      return res.json({ error: "All fields must be required" });
    } else {
      try {
        let deleteProductObj = await productModel.findById(_id);
        let deleteProduct = await productModel.findByIdAndDelete(_id);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
          Product.deleteImages(deleteProductObj.image, "string");
          return res.redirect("/admin/product-view");
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getSingleProduct(req, res) {
    let { _id } = req.body;
    if (!_id) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let singleProduct = await productModel
          .findById(_id)
          .populate("category", "cName")
          .populate("ratings.user", "name email userImage");
        if (singleProduct) {
          return res.json({ Product: singleProduct });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getProductByCategory(req, res) {
    let { catId } = req.body;
    if (!catId) {
      return res.json({ error: "All fields must be required" });
    } else {
      try {
        let products = await productModel
          .find({ category: catId })
          .populate("category", "cName");
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Search product wrong" });
      }
    }
  }

  async getProductBySKU(req, res) {
    let { SKU } = req.body;
    if (!SKU) {
      return res.json({ error: "All fields must be required" });
    } else {
      try {
        let products = await productModel
          .find({ SKU: SKU })
          .populate("category", "cName");
        if (products) {
          return res.json({ prod : products[0] });
        }
      } catch (err) {
        return res.json({ error: "No Product" });
      }
    }
  }

  async getProductByPrice(req, res) {
    let { price } = req.body;
    if (!price) {
      return res.json({ error: "All fields must be required" });
    } else {
      try {
        let products = await productModel
          .find({ price: { $lt: price } })
          .populate("category", "cName")
          .sort({ price: -1 });
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getWishProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All fields must be required" });
    } else {
      try {
        let wishProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (wishProducts) {
          return res.json({ Products: wishProducts });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getCartProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All fields must be required" });
    } else {
      try {
        let cartProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (cartProducts) {
          return res.json({ Products: cartProducts });
        }
      } catch (err) {
        return res.json({ error: "Cart product wrong" });
      }
    }
  }

  async postAddReview(req, res) {
    let { _id, uId, rating, review } = req.body;
    let images = req.files;
    console.log(images);
    let allImages = [];
    if(images){
      for (const img of images) {
        allImages.push("/uploads/products/" +img.filename);
      }
    }
    console.log(allImages);
    if (!_id || !rating || !review || !uId) {
      // Product.deleteImages(images, "file");
      return res.json({ error: "All fields are required" });
    } else {
      let checkReviewRatingExists = await productModel.findOne({ _id: _id });
      if (checkReviewRatingExists.ratings.length > 0) {
        checkReviewRatingExists.ratings.map((item) => {
          if (item.user.toString() === uId) {
            // Product.deleteImages(images, "file");
            return res.json({ error: "Your already reviewed the product" });
          } else {  
            try {
              let newRatingReview = productModel.findByIdAndUpdate(_id, {
                $push: {
                  ratings: {
                    review: review,
                    user: uId,
                    rating: rating,
                    image: allImages
                  },
                },
              });
              newRatingReview.exec((err, result) => {
                if (err) {
                  console.log(err);
                }
                return res.json({ success: "Thanks for your review" });
              });
            } catch (err) {
              // Product.deleteImages(images, "file");
              return res.json({ error: "Cart product wrong" });
            }
          }
        });
      } else {
        try {
          let newRatingReview = productModel.findByIdAndUpdate(_id, {
            $push: {
              ratings: { review: review, user: uId, rating: rating , image: allImages},
            },
          });
          newRatingReview.exec((err, result) => {
            if (err) {
              console.log(err);
            }
            return res.json({ success: "Thanks for your review" });
          });
        } catch (err) {
          Product.deleteImages(images, "file");
          return res.json({ error: "Cart product wrong" });
        }
      }
    }
  }

  async deleteReview(req, res) {
    let { rId, _id } = req.body;
    if (!rId) {
      return res.json({ message: "All fields must be required" });
    } else {
      try {
        let reviewDelete = productModel.findByIdAndUpdate(_id, {
          $pull: { ratings: { _id: rId } },
        });
        reviewDelete.exec((err, result) => {
          if (err) {
            console.log(err);
          }
          return res.redirect("back");
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const productController = new Product();
module.exports = productController;
