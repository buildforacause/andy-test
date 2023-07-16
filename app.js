/* 

================== Most Important ==================
* Issue 1 :
In uploads folder you need create 3 folder like bellow.
Folder structure will be like: 
public -> uploads -> 1. products 2. customize 3. categories
*** Now This folder will automatically create when we run the server file

* Issue 2:
For admin signup just go to the auth 
controller then newUser obj, you will 
find a role field. role:1 for admin signup & 
role: 0 or by default it for customer signup.
go user model and see the role field.

*/
const productModel = require("./models/products");
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require('body-parser');


// Import Router
const authRouter = require("./routes/auth");
const categoryRouter = require("./routes/categories");
const productRouter = require("./routes/products");
const brainTreeRouter = require("./routes/braintree");
const orderRouter = require("./routes/orders");
const pincodeRouter = require("./routes/pincode");
const usersRouter = require("./routes/users");
const customizeRouter = require("./routes/customize");
const adminRouter = require("./routes/admin");
const frontendRouter = require("./routes/frontend");
const sponsorRouter = require("./routes/sponsor");
const infoRouter = require("./routes/info");
const couponRouter = require("./routes/coupon");
const addressRouter = require("./routes/address");
const bannerRouter = require("./routes/secondarybanner");
// Import Auth middleware for check user login or not~
const { loginCheck } = require("./middleware/auth");
const CreateAllFolder = require("./config/uploadFolderCreateScript");

/* Create All Uploads Folder if not exists | For Uploading Images */
CreateAllFolder();

// Database Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err) => console.log("Database Not Connected !!!" + err));


// Middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());
app.use(express.static("public"));
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
// Routes
app.use("/admin", adminRouter);
app.use("/api", authRouter);
app.use("/api/banner", bannerRouter)
app.use("/api/user", usersRouter);
app.use("/api/address", addressRouter);
app.use("/api/category", categoryRouter);
app.use("/api/sponsor", sponsorRouter);
app.use("/api/product", productRouter);
app.use("/api/pincode", pincodeRouter);
app.use("/api/coupon", couponRouter);
app.use("/api", brainTreeRouter);
app.use("/api/order", orderRouter);
app.use("/api/customize", customizeRouter);
app.use("/", frontendRouter);
app.use("/api/info", infoRouter);
app.get('/logout', function(req, res){
  cookie = req.cookies;
  for (var prop in cookie) {
      if (!cookie.hasOwnProperty(prop)) {
          continue;
      }    
      res.cookie(prop, '', {expires: new Date(0)});
  }
  res.redirect(req.get('referer'));
});

// Run Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
