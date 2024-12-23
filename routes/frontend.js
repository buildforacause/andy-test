const express = require("express");
const router = express.Router();
const categoryModel = require("../models/categories");
const productModel = require("../models/products");
const sponsorModel = require("../models/sponsor");
const addressModel = require("../models/address");
const customizeModel = require("../models/customize");
const infoModel = require("../models/info");
const userModel = require("../models/users");
const orderModel = require("../models/orders");
const couponModel = require("../models/coupon");
const secondarybannerModel = require("../models/secondarybanner");
const customizedSportswearModel = require("../models/customizedsportswear");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const delivery = 50;
const extradelivery = 30;

function cleanText(inputText) {
  let lowercaseText = inputText.toLowerCase();
  let cleanedText = lowercaseText.replace(/\s+/g, '').replace(/[^\w\s]/g, '');
  return cleanedText;
}

router.get("/", async (req, res) => {
  const targetDate = new Date('February 28, 2024 11:00:00 GMT+0530');
  const currentDate = new Date();
  if (currentDate.getTime() < targetDate.getTime()) {
    return res.redirect('/timer');
  }
  let Products = await productModel
    .find({ featured: true, status: "Active" })
    .populate("category", "_id cName")
    .sort({ createdAt: -1 });
  Products = Products.filter(
    (value, index, self) => index === self.findIndex((t) => t.SKU === value.SKU)
  );
  Products = Products.filter((_, index) => index < 5);
  let FProducts = await productModel
    .find({ status: "Active" })
    .populate("category", "_id cName")
    .sort({ createdAt: -1 });
  FProducts = FProducts.filter(
    (value, index, self) => index === self.findIndex((t) => t.SKU === value.SKU)
  );
  //   FProducts = FProducts.filter((_, index) => index < 8);
  const groupedProducts = {};
  FProducts.forEach(product => {
    if (!groupedProducts[product.category._id]) {
      groupedProducts[product.category._id] = [];
    }
    groupedProducts[product.category._id].push(product);
  });
  const numCategories = Object.keys(groupedProducts).length;
  const minProductsPerCategory = Math.floor(8 / numCategories);
  const remainingProducts = 8 % numCategories;
  const productsFromEachCategory = [];
  for (const categoryId in groupedProducts) {
    if (groupedProducts.hasOwnProperty(categoryId)) {
      const productsInCategory = groupedProducts[categoryId].slice(0, minProductsPerCategory);
      productsFromEachCategory.push(...productsInCategory);
    }
  }
  if (remainingProducts > 0) {
    const remainingCategories = Object.keys(groupedProducts).slice(0, remainingProducts);
    remainingCategories.forEach(categoryId => {
      const productToAdd = groupedProducts[categoryId][minProductsPerCategory];
      if (productToAdd) {
        productsFromEachCategory.push(productToAdd);
      }
    });
  }

  // You can sort the products if needed
  productsFromEachCategory.sort((a, b) => a.category.cName.localeCompare(b.category.cName));

  FProducts = productsFromEachCategory;

  // You can sort the products if needed
  productsFromEachCategory.sort((a, b) => a.category.cName.localeCompare(b.category.cName));
  let Categories = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 });
  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(5);
  let banner = await secondarybannerModel.find({});

  let allProducts = await productModel
    .find({ status: "Active" })
    .populate("category")
    .sort({ createdAt: -1 });
  const top5RecentProductsByCategory = new Map();
  allProducts.forEach((product) => {
    const category = product.category.cName; // Assuming "category" is the name field of your category model
    if (!top5RecentProductsByCategory.has(category)) {
      top5RecentProductsByCategory.set(category, []);
    }
    if (top5RecentProductsByCategory.get(category).length < 5) {
      top5RecentProductsByCategory.get(category).push(product);
    }
  });
  let result = Array.from(
    top5RecentProductsByCategory,
    ([category, products]) => ({
      category,
      products,
    })
  );
  result = result.map(categoryData => ({
    category: categoryData.category,
    products: categoryData.products.reduce((uniqueProducts, currentProduct) => {
      const isDuplicate = uniqueProducts.some(product => product.SKU === currentProduct.SKU);
      if (!isDuplicate) {
        uniqueProducts.push(currentProduct);
      }

      return uniqueProducts;
    }, []),
  }));

  let Sponsors = await sponsorModel.find({}).sort({ _id: -1 });
  let sliders = await customizeModel.find({});
  let customizedsportswear = await customizedSportswearModel.find({disabled: false});
  let user = req.cookies.autOken;
  let userid = req.cookies.userid;
  let Info = await infoModel.find({});
  res.render("frontend/index.ejs", {
    banner: banner[0],
    info: Info[0],
    navCats: navCats,
    userid: userid,
    products: Products,
    categories: Categories,
    recentproducts: result,
    sponsors: Sponsors,
    user: user,
    sliders: sliders,
    customizedsportswear: customizedsportswear,
    fproducts: FProducts
  });
});

router.get("/cart", async (req, res) => {
  let user = req.cookies.autOken;
  let userid = req.cookies.userid;
  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(5);
  let Info = await infoModel.find({});
  let errmsg = "";
  let errid = "";
  res.render("frontend/cart.ejs", {
    errmsg: errmsg,
    errid: errid,
    user: user,
    userid: userid,
    navCats: navCats,
    info: Info[0],
  });
});

router.get("/dashboard", async (req, res) => {
  let user = req.cookies.autOken;
  let userid = req.cookies.userid;
  let userRole = req.cookies.role;
  if (!user) {
    res.redirect("/");
  }
  let userAddress = await addressModel.find({ user: userid, hidden: 0 });
  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(5);
  let Info = await infoModel.find({});
  let verify = await userModel.find({ _id: userid });
  let orders = await orderModel
    .find({ user: userid })
    .populate("allProduct.id", "name image price")
    .populate("address", "aaddress aphone aname acity apincode")
    .sort({ _id: -1 });
  let inforders = await couponModel.find({ user: userid, status: 1 })
  res.render("frontend/dashboard.ejs", {
    inforders: inforders,
    orders: orders,
    userRole: userRole,
    verify: verify[0],
    user: user,
    addresses: userAddress,
    userid: userid,
    navCats: navCats,
    info: Info[0],
  });
});

router.get("/track", async (req, res) => {
  let user = req.cookies.autOken;
  let userid = req.cookies.userid;
  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(5);
  let Info = await infoModel.find({});
  let order = [];
  if (req.query.of) {
    try {
      order = await orderModel
        .find({ _id: req.query.of })
        .populate("allProduct.id", "name image price SKU")
        .populate("address", "aaddress aphone aname acity apincode");
    } catch (r) {
      res.redirect("/dashboard");
    }
  } else {
    res.redirect("/dashboard");
  }
  res.render("frontend/track.ejs", {
    order: order[0],
    user: user,
    userid: userid,
    navCats: navCats,
    info: Info[0],
  });
});

router.post("/upload", async (req, res) => {
  let user = req.body.user;
  let userid = req.cookies.userid;
  let allProduct = req.body.allProduct;
  let coupon = req.body.coupon;
  let transactionId = req.body.transactionId;
  let notes = req.body.notes;
  let address = req.body.address;
  let prods = req.body.prods;
  let quant = req.body.quant;
  allProduct = JSON.parse(allProduct);
  var couponValue = 0;
  var totalValue = 0;
  var totalweight = 0;
  if (coupon) {
    let couponName = await couponModel.find({ coupon: coupon });
    if (couponName) {
      couponValue = couponName[0].discount;
    }
  }
  await Promise.all(
    allProduct.map(async (prod) => {
      let p = await productModel.find({ _id: prod.id });
      let quantity = Number(prod.quantity);
      let price = Number(p[0].price);
      let offer = p[0].offer;
      price = price - (price / 100) * offer;
      let total = price * quantity;
      totalweight += (Number(p[0].weight) ? Number(p[0].weight) * quantity : 1 * quantity);
      totalValue += total;
    })
  );

  let amount = totalValue - (totalValue / 100) * couponValue;
  amount = amount + delivery;
  if (totalweight > 1600 && totalweight <= 2600) {
    amount += 20;
  } else if (totalweight > 2600 && totalweight <= 3600) {
    amount += 40
  } else if (totalweight > 3600 && totalweight <= 4600) {
    amount += 60
  } else if (totalweight > 4600 && totalweight <= 5600) {
    amount += 80
  } else if (totalweight > 5600) {
    amount += 100
  }
  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(5);
  let Info = await infoModel.find({});
  let data = {
    amount: amount,
    allProduct: JSON.stringify(allProduct),
    coupon: coupon,
    user: user,
    transactionId: transactionId,
    notes: notes,
    address: address,
    prods: prods,
    quant: quant,
    totalweight: totalweight
  };
  // let order = []
  // if(req.query.order){
  //     try{
  //         order = await orderModel.find({_id: req.query.order}).populate("allProduct.id", "name image price")
  //         .populate("address", "aaddress aphone aname acity apincode")
  //     }catch(r){
  //         res.redirect("/dashboard");
  //     }
  // }else{
  //     res.redirect("/dashboard");
  // }
  // order = order[0];
  // if(order.transactionScreenShot === "Not Uploaded"){
  //     res.render("frontend/upload.ejs",{order:order,user:user, userid: userid, navCats:navCats, info: Info[0]})
  // }else{
  //     res.redirect("/dashboard");
  // }
  if (req.body.allProduct) {
    return res.render("frontend/upload.ejs", {
      data: data,
      user: user,
      userid: userid,
      navCats: navCats,
      info: Info[0],
    });
  } else {
    res.redirect("/dashboard");
  }
});

router.get("/return", async (req, res) => {
  if (!req.query.of) {
    res.redirect("/dashboard");
  }
  const Orderid = req.query.of;
  //required
  let userid = req.cookies.userid;
  let user = req.cookies.autOken;
  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(5);
  let Info = await infoModel.find({});
  let errmsg = "";
  let errid = "";
  //order details
  let orders = await orderModel
    .find({ _id: Orderid })
    .populate("allProduct.id", "name image price")
    .populate("address", "aaddress aphone aname acity apincode");
  if (!orders[0]._id || orders[0].user != userid) {
    res.redirect("/dashboard");
    //if order id doesnt exist or if given order id's user isnt the same47



  }
  res.render("frontend/return.ejs", {
    order: orders[0],
    errmsg: errmsg,
    errid: errid,
    user: user,
    userid: userid,
    navCats: navCats,
    info: Info[0],
  });
});

router.get("/checkout", async (req, res) => {
  res.redirect("/cart");
});

router.get("/upload", async (req, res) => {
  res.redirect("/cart");
});

router.post("/checkout", async (req, res) => {
  let user = req.cookies.autOken;
  let ids = req.body.productids;
  let quantity = req.body.quantity;
  let couponcode = req.body.couponcode;
  let userid = req.cookies.userid;
  console.log("User ID:", userid); // Add this line to log the userid

  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(5);
  let Info = await infoModel.find({});
  let cartProducts = await productModel.find({
    _id: { $in: ids },
  });
  let totalweight = 0;
  let userAddress = await addressModel.find({ user: userid, hidden: 0 });
  if (cartProducts.length === 1) {
    for (let i = 0; i < cartProducts.length; i++) {
      if (cartProducts[i].quantity < quantity[i]) {
        let errmsg = "Only " + cartProducts[i].quantity + " remaining.";
        let errid = cartProducts[i]._id;
        res.render("frontend/cart.ejs", {
          errmsg: errmsg,
          errid: errid,
          user: user,
          userid: userid,
          navCats: navCats,
          info: Info[0],
        });
      } else {
        cartProducts[i].quantity = quantity[i];
        totalweight += (Number(cartProducts[i].weight) ? Number(cartProducts[i].weight) * quantity[i] : 1 * quantity[i]);
      }
    }
  } else {
    if (cartProducts.length !== ids.length) {
      res.redirect("/cart");
    } else {
      for (let i = 0; i < cartProducts.length; i++) {
        if (cartProducts[i].quantity < quantity[i]) {
          let err = {
            msg: "Only " + cartProducts[i].quantity + " remaining.",
            id: cartProducts[i]._id,
          };

          res.render("frontend/cart.ejs", {
            errmsg: err.msg,
            errid: err.id,
            user: user,
            userid: userid,
            navCats: navCats,
            info: Info[0],
          });
        } else {
          cartProducts[i].quantity = quantity[i];
          totalweight += (Number(cartProducts[i].weight) ? Number(cartProducts[i].weight) * quantity[i] : 1 * quantity[i]);
        }
      }
    }
  }

  let finaldelivery = delivery;
  if (totalweight > 1600 && totalweight <= 2600) {
    finaldelivery += 20;
  } else if (totalweight > 2600 && totalweight <= 3600) {
    finaldelivery += 40
  } else if (totalweight > 3600 && totalweight <= 4600) {
    finaldelivery += 60
  } else if (totalweight > 4600 && totalweight <= 5600) {
    finaldelivery += 80
  } else if (totalweight > 5600) {
    finaldelivery += 100
  }

  res.render("frontend/checkout.ejs", {
    couponcode: couponcode,
    user: user,
    userid: userid,
    quantity: quantity,
    products: cartProducts,
    addresses: userAddress,
    navCats: navCats,
    info: Info[0],
    delivery: finaldelivery,
    totalweight: totalweight
  });
});

router.get("/view/:id", async (req, res) => {
  let id = req.params.id;
  let Product = await productModel
    .find({ _id: id })
    .populate("category", "_id cName")
    .populate("ratings.user");
  if (Product.length < 1) {
    res.redirect("/");
  }
  let SKU = Product[0].SKU;
  let ProductSize = await productModel
    .find({ SKU: SKU, status: "Active" })
    .populate("category", "_id cName")
    .populate("ratings.user");
  const order = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
  ProductSize = ProductSize.sort((productA, productB) => {
    const sizeA = productA.name.split('-').pop().toUpperCase();
    const sizeB = productB.name.split('-').pop().toUpperCase();

    return order.indexOf(sizeA) - order.indexOf(sizeB);
  });
  let allProds = await productModel
    .find({ SKU: { $ne: SKU }, status: "Active" })
    .populate("category", "_id cName");
  let uniqueProds = {};
  let uniqueProducts = [];
  allProds.forEach(prod => {
    if (!uniqueProds[prod.SKU]) {
      uniqueProds[prod.SKU] = true;
      uniqueProducts.push(prod);
    }
  });
  var allReviews = [];
  ProductSize.forEach(product => {
    product.ratings.forEach(pro => {
      allReviews.push(pro);
    })
  });
  let total = 0;
  allReviews.forEach(r => {
    total = total + Number(r.rating);
  });

  total = total / allReviews.length;
  let user = req.cookies.autOken;
  let userid = req.cookies.userid;
  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(5);
  let Info = await infoModel.find({});
  const protocol = req.protocol;
  const host = req.hostname;
  const url = req.originalUrl;
  const port = process.env.PORT;
  let fullUrl = `${protocol}://${host}:${port}${url}`;
  let reviewcheck = await orderModel.find({
    'user': ObjectId(userid),
    'allProduct.id': id
  });
  res.render("frontend/single-product.ejs", {
    fullUrl: fullUrl,
    total: total,
    info: Info[0],
    userid: userid,
    product: Product[0],
    productsizes: ProductSize,
    allProds: uniqueProducts,
    user: user,
    userid: userid,
    navCats: navCats,
    reviewcheck: reviewcheck,
    allReviews: allReviews
  });
});

router.get("/shop", async (req, res) => {
  let title = "";
  let allProds = [];
  if (req.query.filterby) {
    try {
      allProds = await productModel
        .find({ category: req.query.filterby, status: "Active" })
        .populate("category", "_id cName");
      title = await categoryModel.find({ _id: req.query.filterby });
      if (title) {
        title = title[0].cName;
      } else {
        return res.redirect("/");
      }
    } catch (e) {
      return res.redirect("/");
    }
  } else if (req.query.s) {
    const searchTerms = cleanText(req.query.s).split(/\s+/).map(term => new RegExp(term, 'i'));
    console.log(searchTerms);
    allProds = await productModel
      .find({
        $and: [
          {
            $or: [
              { name: { $in: searchTerms } },
              { description: { $in: searchTerms } },
              { material: { $in: searchTerms } },
              { searchTerms: { $in: searchTerms } },
            ]
          },
          { status: "Active" },
        ],
      })
      .populate("category", "_id cName");
    title = "Search Results For " + req.query.s;
  } else {
    allProds = await productModel
      .find({ status: "Active" })
      .populate("category", "_id cName");
    title = "All Products";
  }
  let Categories = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 });
  let user = req.cookies.autOken;
  let userid = req.cookies.userid;
  allProds = allProds.filter(
    (value, index, self) => index === self.findIndex((t) => t.SKU === value.SKU)
  );
  let navCats = await categoryModel
    .find({ cStatus: "Active" })
    .sort({ _id: -1 })
    .limit(10);
  let Info = await infoModel.find({});

  let maxPrice = 0;
  for (const product of allProds) {
    if (product.price > maxPrice) {
      maxPrice = product.price;
    }
  }

  //filter based on max price
  if (req.query.maxrate) {
    allProds = allProds.filter(product => product.price <= req.query.maxrate);
  }

  if (req.query.sortby) {
    if (req.query.sortby == 2) {
      allProds.sort((a, b) => a.price - b.price);
    }
    if (req.query.sortby == 3) {
      allProds.sort((a, b) => b.price - a.price);
    }
    if (req.query.sortby == 4) {
      allProds.sort((a, b) => b.offer - a.offer);

    }
  }
  let currMaxPrice = maxPrice;
  if (req.query.maxrate) {
    currMaxPrice = req.query.maxrate
  }
  let sortby = 1;
  if (req.query.sortby) {
    sortby = req.query.sortby
  }
  res.render("frontend/results.ejs", {
    info: Info[0],
    userid: userid,
    allProds: allProds,
    cats: Categories,
    user: user,
    title: title,
    navCats: navCats,
    maxPrice: maxPrice,
    curMaxPrice: currMaxPrice,
    sortby: sortby,
    filteredby: req.query.filterby || ""
  });
});

router.get("/check-quantity/:id", async (req, res) => {
  let id = req.params.id;
  let prod = await productModel.find({ _id: id });
  let quantity = prod[0].quantity;
  res.json({ quantity: quantity });
});

router.get("/confirming-order-details", (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.render("frontend/confirm.ejs");
});

router.get("/timer", (req, res) => {
  const targetDate = new Date('February 28, 2024 11:00:00 GMT+0530');
  const currentDate = new Date();
  if (currentDate.getTime() >= targetDate.getTime()) {
    return res.redirect('/');
  }
  res.render("frontend/timer.ejs");
});

router.get('/verify', async (req, res) => {
  const { token } = req.query;

  const user = await userModel.findOneAndUpdate({ secretKey: token }, { verified: "YES" });

  if (!user) {
    return res.status(404).send('Invalid verification token');
  }

  const htmlResponse = `
    <html>
      <head>
        <meta http-equiv="refresh" content="5;url=/">
      </head>
      <body>
        <h1>Email verification successful.</h1>
        <p>You will be redirected to the home page in 5 seconds. If not, <a href="/">click here</a>.</p>
        <script>
          setTimeout(function() {
            window.location.href = '/';
          }, 5000);
        </script>
      </body>
    </html>
  `;

  res.send(htmlResponse);
});


router.get('/emailverification', async (req, res) => {
  let Info = await infoModel.find({});
  let user = req.cookies.autOken;
  res.render('frontend/emailverification.ejs', {
    info: Info[0],
    user: user,
  });
});


router.get('/resetpassword', async (req, res) => {
  let Info = await infoModel.find({});
  let user = req.cookies.autOken;
  const { token } = req.query;
  let data = await userModel.find({ secretKey: token });
  if (data != "" && data[0].pwdReset == "No") {
    const verified = await userModel.findOneAndUpdate({ secretKey: token }, { pwdReset: "YES" });
    if (!verified) {
      return res.send('Invalid verification token. If you think it is a mistake then please contact the administrator.');
    }
    console.log("Condition true");
    res.render('frontend/resetpassword.ejs', {
      info: Info[0],
      user: user,
      userData: data[0]
    });
  } else {
    console.log("Inside ELse");
    const htmlResponse = `
    <html>
      <head>
        <meta http-equiv="refresh" content="5;url=/">
      </head>
      <body>
        <h1>Invalid verification token. If you think it is a mistake then please contact the administrator.</h1>
      </body>
    </html>
  `;

   return res.send(htmlResponse);
  }
});

module.exports = router;
