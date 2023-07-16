const orderModel = require("../models/orders");
const productModel = require("../models/products");
const couponModel = require("../models/coupon");
const fs = require("fs");
const path = require("path");

class Order {
  static deleteImages(images, mode) {
    var basePath =
      path.resolve(__dirname + "../../") + "/public";
      let filePath = "";
      if (mode == "file") {
        filePath = basePath + `${images}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          return err;
        }
      });
      }
  }
  async getAllOrders(req, res) {
    try {
      let Orders = await orderModel
        .find({})
        .populate("allProduct.id", "name image price")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Orders) {
        return res.json({ Orders });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getOrderByUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let Order = await orderModel
          .find({ user: uId })
          .populate("allProduct.id", "name image price")
          .populate("user", "name email")
          .sort({ _id: -1 });
        if (Order) {
          return res.json({ Order });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postCreateOrder(req, res) {
    let { allProduct, user, coupon, transactionId, address, notes } = req.body;
    let images = req.files;
    if (!allProduct || !user || !transactionId || !address) {
        Order.deleteImages(images[0], "file");
        return res.json({ error: "All fields are required" });
    } else {
      try {
        allProduct = JSON.parse(allProduct)
        let transactionScreenShot = "/uploads/customer/" +images[0].filename;
        var couponValue=0;
        var totalValue=0;
        if(coupon){
          let couponName = await couponModel.find({coupon:coupon})
          if (couponName){
            couponValue=couponName[0].discount;
          }
        }
        console.log(allProduct)
        
        await Promise.all(
          
          allProduct.map(async (prod) => {
            let p = await productModel.find({ _id: prod.id });
        
            let quantity = Number(prod.quantity);
            let price = Number(p[0].price);
            let offer= p[0].offer;
            price=price-((price/100)*offer)
            let total = price * quantity;
        
            totalValue += total;
          })
        );
   
        let amount=totalValue-((totalValue/100)*couponValue);
        let newOrder = new orderModel({
          allProduct: allProduct,
          user: user,
          amount: amount,
          transactionId: transactionId,
          transactionScreenShot: transactionScreenShot,
          address: address,
          notes: notes,
        });

        let save = await newOrder.save();
        if (save) {
          allProduct.forEach(async (prod) => {
            let p = await productModel.find({ _id: prod.id });
            let quant = p[0].quantity;
            let remain = quant - prod.quantity;
            let q = await productModel.findByIdAndUpdate(prod.id, {
              quantity: remain,
              updatedAt: Date.now(),
            });
          });
          return res.redirect("/dashboard")
        }
      } catch (err) {
        Order.deleteImages(images[0], "file");
        console.log(err);
        return res.json({ msg: err });
      }
    }
  }

  async postUpdateOrder(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentOrder = orderModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentOrder.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "Order updated successfully" });
      });
    }
  }

  async postUpdateOrder2(req, res) {
    let { oId, approval } = req.body;
    if (!oId || !approval) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentOrder = orderModel.findByIdAndUpdate(oId, {
        approval: approval,
        updatedAt: Date.now(),
      });
      currentOrder.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "Order updated successfully" });
      });
    }
  }

  async postDeleteOrder(req, res) {
    let { oId } = req.body;
    if (!oId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteOrder = await orderModel.findByIdAndDelete(oId);
        if (deleteOrder) {
          return res.json({ success: "Order deleted successfully" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async addReturn(req, res) {
    let { userid, orderid, reason, description, payment } = req.body;
    
    let Order = await orderModel
      .find({ _id: orderid })
      .populate("allProduct.id", "name image price")
      .populate("user", "name email userRole")
      .sort({ _id: -1 });
    
    //checking if someone else apart from the admin is trying to access
    if(Order[0].user._id != userid || Order[0].user.userRole == 1){
      return res.json({ error: "There was an error processing your request." });
    }
   
    if (
      !Order[0] ||
      !reason ||
      !description ||
      !payment
    ) {
      return res.json({ error: "There was an error processing your request. Please try again." });
    }

    let Refund = { reason, description, payment };
    if(req.body.status){
      Refund.status=req.body.status;
    }

    let currentOrder = orderModel.findByIdAndUpdate(orderid, {
      refund: Refund,
      updatedAt: Date.now(),
    });
    currentOrder.exec((err, result) => {
      if (err) return res.json({error:"There was a backend error. Please try later."});
    });
    return res.json({ success: "Refund request updated successfully" });
  }
}

const ordersController = new Order();
module.exports = ordersController;
