const userModel = require("../models/users");
const bcrypt = require("bcryptjs");
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const nodemailer = require('nodemailer');

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
class User {
  async getAllUser(req, res) {
    try {
      let Users = await userModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Users) {
        return res.json({ Users });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getSingleUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let User = await userModel
          .findById(uId)
          .select("name email phoneNumber userImage updatedAt createdAt");
        if (User) {
          return res.json({ User });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async postAddUser(req, res) {
    let { allProduct, user, amount, transactionId, address, phone } = req.body;
    if (
      !allProduct ||
      !user ||
      !amount ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let newUser = new userModel({
          allProduct,
          user,
          amount,
          transactionId,
          address,
          phone,
        });
        let save = await newUser.save();
        if (save) {
          return res.json({ success: "User created successfully" });
        }
      } catch (err) {
        return res.json({ error: error });
      }
    }
  }

  async postEditUser(req, res) {
    let { uId, name, phoneNumber } = req.body;
    if (!uId || !name || !phoneNumber) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentUser = userModel.findByIdAndUpdate(uId, {
        name: name,
        phoneNumber: phoneNumber,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "User updated successfully" });
      });
    }
  }

  async getDeleteUser(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentUser = userModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentUser.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "User updated successfully" });
      });
    }
  }

  async changePassword(req, res) {
    let { uId, oldPassword, newPassword } = req.body;
    if (!uId || !oldPassword || !newPassword) {
      return res.json({ error: "All fields must be required" });
    } else {
      const data = await userModel.findById(uId);
      if (!data) {
        return res.json({
          error: "Invalid user",
        });
      } else {
        const oldPassCheck = await bcrypt.compare(oldPassword, data.password);
        if (oldPassCheck) {
          newPassword = bcrypt.hashSync(newPassword, 10);
          let passChange = userModel.findByIdAndUpdate(uId, {
            password: newPassword,
          });
          let user123 = await userModel.findById(uId);
          let subject = 'Password Has Been Changed | Mayur Sports';
          let text = `<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                        <h2 style="color: #007bff;">Password Changed:</h2>
                        <p>Dear ${user123.name},</p>
                        <p>Your password to login at Mayur Sports was changed successfully! <br> Shop for trending products <a href="https://www.mayursports.com/shop">here</a>.</p>
                        <div style="text-align: center; padding: 10px; background-color: #f5f5f5;">
                          <p style="color: #333;">Follow us on social media: <a href="https://www.facebook.com/mayursports1/">Facebook</a> | <a href="https://www.instagram.com/mayursports1/">Instagram</a></p>
                        </div>
                      </div>`;
          let email = user123.email;
          let abc = await sendEmailNoReply(email, subject, text);

          passChange.exec((err, result) => {
            if (err) console.log(err);
            return res.json({ success: "Password updated successfully" });
          });
        } else {
          return res.json({
            error: "Your old password is wrong!!",
          });
        }
      }
    }
  }
}

const ordersController = new User();
module.exports = ordersController;
