const orderModel = require("../models/orders");
const productModel = require("../models/products");
const couponModel = require("../models/coupon");
const fs = require("fs");
const path = require("path");
const userModel = require("../models/users");
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const nodemailer = require('nodemailer');

async function sendEmailToAdmin(subject, text) {
  try {
    // Create a transporter with your Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'mayursportsestore@gmail.com',
        pass: process.env.MAINEMAILPASS
      }
    });

    // Define the email options
    const mailOptions = {
      from: 'mayursportsestore@gmail.com',
      to: "mayurjadhav02211@gmail.com",
      subject: subject,
      html: text
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return info.response
  } catch (error) {
    return error
  }
}

async function sendEmailNoReply(email, subject, text) {
  try {
    // Create a transporter with your Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'noreplymayursportsestore@gmail.com',
        pass: process.env.NOREPLY
      }
    });

    // Define the email options
    const mailOptions = {
      from: 'noreplymayursportsestore@gmail.com',
      to: email,
      subject: subject,
      html: text
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return info.response
  } catch (error) {
    return error
  }
}


class Order {
  static deleteImages(images, mode) {
    var basePath = path.resolve(__dirname + "../../") + "/public";
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

  async getTrackingDetails(req, res) {
    let { oId} = req.body;
    if (!oId) {
      console.log(oId);
      return res.json({ message: "Order Id wasn't given"});
    } else {
      try {
        const trackingData = await Order.find({ _id: oId }).select("tracking");
        if (trackingData.length > 0) {
          return res.json({ trackingData });
        }
        return res.json({ message: "No tracking details yet." });
      } catch (err) {
        console.log(err);
        return res.json({ message: "Something went wrong while retrieving your order." });
      }
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
        allProduct = JSON.parse(allProduct);
        let transactionScreenShot = "/uploads/customer/" + images[0].filename;
        var couponValue = 0;
        var totalValue = 0;
        if (coupon) {
          let couponName = await couponModel.find({ coupon: coupon });
          if (couponName) {
            couponValue = couponName[0].discount;
          }
        }
        console.log(allProduct);
        let tr = "";
        await Promise.all(
          allProduct.map(async (prod) => {
            let p = await productModel.find({ _id: prod.id });
            let quantity = Number(prod.quantity);
            let price = Number(p[0].price);
            let offer = p[0].offer;
            price = price - (price / 100) * offer;
            let total = price * quantity;

            totalValue += total;
            tr += `<tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${prod.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">${quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">₹ ${prod.total}</td>
          </tr>`
          })
        );

        let amount = totalValue - (totalValue / 100) * couponValue;
        let newOrder = new orderModel({
          allProduct: allProduct,
          user: user,
          amount: amount + 50,
          transactionId: transactionId,
          transactionScreenShot: transactionScreenShot,
          address: address,
          notes: notes,
          coupon: coupon
        });

        let save = await newOrder.save();
        let user123 = await userModel.findById(user);
        let subject = "Order Details | Mayur Sports";
        let text = `
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h2 style="margin-bottom: 10px;">Order Invoice</h2>
        <p style="margin-bottom: 10px;">Dear ${user123.name}, <br>Thank you for your order. Below is the invoice for your recent purchase: <br><strong>Order ID: #${save._id}</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: left;">Quantity</th>
            <th style="padding: 10px; text-align: left;">Price</th>
          </tr>
          ${tr}
        </table>
        <p style="margin-bottom: 10px;">Grand Total: <strong>₹ ${amount + 50}</strong></p>
        <p style="margin-bottom: 10px;">Tracking Link: <a href="https://www.mayursports.com/track?of=${save._id}">Click here</a></p>
        <p style="margin-bottom: 10px;">Thank you for choosing Mayur Sports. If you have any questions, please contact our support team.</p>
        <p>Best regards,<br><strong>Mayur Sports</strong></p>
        <div style="text-align: center; padding: 10px; background-color: #f5f5f5;">
          <p style="color: #333;">Follow us on social media: <a href="https://www.facebook.com/mayursports1/">Facebook</a> | <a href="https://www.instagram.com/mayursports1/">Instagram</a></p>
        </div>
      </div>`;
      let email = user123.email;
      let abc = sendEmailNoReply(email,subject,text);
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
          return res.redirect("/confirming-order-details");
        }
      } catch (err) {
        Order.deleteImages(images[0], "file");
        console.log(err);
        return res.json({ msg: err });
      }
    }
  }

  async postUpdateOrder(req, res) {
    let { oId, trackingid, trackingcompany, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All fields are required" });
    } else {
      if(status === "Shipped"){
        let currentOrder123 = await orderModel.findById(oId);
        let user123 = await userModel.findById(currentOrder123.user);
        let subject = 'Order Shipped 🚛 | Mayur Sports';
        let text = `<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                      <h2 style="color: #007bff;">Order has been Shipped:</h2>
                      <p>Dear ${user123.name},</p>
                      <p>Your Order <strong>#${oId}</strong> has been shipped successfully! <br>
                      Check Tracking Details <a href="https://www.mayursports.com/track?of=${oId}">here</a>.</p>
                      <div style="text-align: center; padding: 10px; background-color: #f5f5f5;">
                        <p style="color: #333;">Follow us on social media: <a href="https://www.facebook.com/mayursports1/">Facebook</a> | <a href="https://www.instagram.com/mayursports1/">Instagram</a></p>
                      </div>
                    </div>`;
        let email = user123.email;
        let abc = await sendEmailNoReply(email, subject, text);
      }

      if (trackingid !== undefined && trackingcompany !== undefined) {
        let currentOrder = orderModel.findByIdAndUpdate(oId, {
          status: status,
          tracking: { trackingid, trackingcompany },
          updatedAt: Date.now(),
        });
        currentOrder.exec((err, result) => {
          if (err) console.log(err);
          return res.json({ success: "Order updated successfully" });
        });
      } else {
        if(status === "Cancelled"){
          let currentOrder123 = await orderModel.findById(oId).populate("allProduct.id", "quantity");
          for (const p of currentOrder123.allProduct) {
            const orderedquantity = p.quantity + p.id.quantity;
            await productModel.findByIdAndUpdate(p.id.id, { quantity: orderedquantity });
          }
          let user123 = await userModel.findById(currentOrder123.user);
          let subject = 'Order Cancelled 😔 | Mayur Sports';
          let text = `<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #007bff;">Order Cancelled:</h2>
                        <p>Dear ${user123.name},</p>
                        <p>Your Order <strong>#${oId}</strong> has been cancelled successfully! <br>
                        Check out more products <a href="https://www.mayursports.com/shop">here</a>.</p>
                        <div style="text-align: center; padding: 10px; background-color: #f5f5f5;">
                          <p style="color: #333;">Follow us on social media: <a href="https://www.facebook.com/mayursports1/">Facebook</a> | <a href="https://www.instagram.com/mayursports1/">Instagram</a></p>
                        </div>
                      </div>`;
          let email = user123.email;
          let abc = await sendEmailNoReply(email, subject, text);
        }
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
  }

  async postUpdateOrder2(req, res) {
    let { oId, approval } = req.body;
    if (!oId || !approval) {
      return res.json({ message: "All fields are required" });
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
      return res.json({ error: "All fields are required" });
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
    let images = req.files;
    let Order = await orderModel
      .find({ _id: orderid })
      .populate("allProduct.id", "name image price")
      .populate("user", "name email userRole")
      .sort({ _id: -1 });
    let proof ="";
    let Refund = null;

    //checking if someone else apart from the admin is trying to access
    if(images === undefined){
      if (Order[0].user._id != userid || Order[0].user.userRole == 1) {
        return res.json({ error: "There was an error processing your request." });
      }
      if (!Order[0] || !reason || !description || !payment) {
        return res.json({
          error: "There was an error processing your request. Please try again.",
        });
      }
      Refund = Order[0].refund;
    }else{
      if (Order[0].user._id != userid || Order[0].user.userRole == 1) {
        Order.deleteImages(images[0], "file");
        return res.json({ error: "There was an error processing your request." });
      }
  
      if (!Order[0] || !reason || !description || !payment) {
        Order.deleteImages(images[0], "file");
        return res.json({
          error: "There was an error processing your request. Please try again.",
        });
      }
      proof = "/uploads/customer/" + images[0].filename;
      Refund = { reason, description, payment, proof };
      let subject = `Return Request for Order ID #${orderid}`;
      let text = `<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #007bff;">The customer has raised a return request:</h2>
                    <p>Dear Admin,</p>
                    <p>A Customer has raised a return request for the Order <strong>#${orderid}</strong>.</p>
                    <div style="text-align: center; padding: 10px; background-color: #f5f5f5;">
                      <p style="color: #333;">Follow us on social media: <a href="https://www.facebook.com/mayursports1/">Facebook</a> | <a href="https://www.instagram.com/mayursports1/">Instagram</a></p>
                    </div>
                  </div>`;
      let abc = await sendEmailToAdmin(subject, text);
    }

    if (req.body.status) {
      Refund.status = req.body.status;
      let user123 = await userModel.findById(userid);
      let subject = 'Return Request Responded | Mayur Sports';
      let text = `<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #007bff;">Check what the seller says:</h2>
                    <p>Dear ${user123.name},</p>
                    <p>Your Order <strong>#${orderid}</strong> was seen by the seller! Please check the status response below: <br>
                    <a href="https://www.mayursports.com/return?of=${oId}">Open Message</a>.</p>
                    <div style="text-align: center; padding: 10px; background-color: #f5f5f5;">
                      <p style="color: #333;">Follow us on social media: <a href="https://www.facebook.com/mayursports1/">Facebook</a> | <a href="https://www.instagram.com/mayursports1/">Instagram</a></p>
                    </div>
                  </div>`;
      let email = user123.email;
      let abc = await sendEmailNoReply(email, subject, text);
    }

    let currentOrder = orderModel.findByIdAndUpdate(orderid, {
      refund: Refund,
      updatedAt: Date.now(),
    });
    currentOrder.exec((err, result) => {
      if (err)
        return res.json({
          error: "There was a backend error. Please try later.",
        });
    });
    return res.json({ success: "Refund request updated successfully" });
  }
}

const ordersController = new Order();
module.exports = ordersController;
