const bodyParser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const userModel = require("../models/users");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const uuid = require('uuid');
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
        user: 'mayursportsnoreply@gmail.com',
        pass: process.env.NOREPLY
      }
    });

    // Define the email options
    const mailOptions = {
      from: 'mayursportsnoreply@gmail.com',
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


async function sendEmail(email, subject, text) {
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

class Auth {
  async isAdmin(req, res) {
    let { loggedInUserId } = req.body;
    try {
      let loggedInUserRole = await userModel.findById(loggedInUserId);
      res.json({ role: loggedInUserRole.userRole });
    } catch {
      res.status(404);
    }
  }

  async allUser(req, res) {
    try {
      let allUser = await userModel.find({});
      res.json({ users: allUser });
    } catch {
      res.status(404);
    }
  }



  /* User Registration/Signup controller  */
  async postSignup(req, res) {
    let { name, email, password, validpot123, captcha, ans } = req.body;
    let error = {};
    let check = parseInt(captcha) !== parseInt(ans);
    if (!name || !email || !password || validpot123 || check) {
      error = {
        ...error,
        name: "Field must not be empty",
        email: "Field must not be empty",
        password: "Field must not be empty",
        validpot123: "Invalid Form Fields. Dont Use Robots!",
        captcha: "Captcha Verification Failed"
      };
      return res.json({ error });
    }
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 characters long" };
      return res.json({ error });
    } else {
      if (validateEmail(email)) {
        name = toTitleCase(name);
        if ((password.length > 255) | (password.length < 8)) {
          error = {
            ...error,
            password: "Password must be 8 characters long",
            name: "",
            email: "",
            validpot123: "",
            captcha: ""
          };
          return res.json({ error });
        } else {
          // If Email & Number exists in Database then:
          try {
            let mailpass = password;
            password = bcrypt.hashSync(password, 10);
            const data = await userModel.findOne({ email: email });
            if (data) {
              error = {
                ...error,
                password: "",
                name: "",
                email: "Email already exists",
                validpot123: "",
                captcha: ""
              };
              return res.json({ error });
            } else {
              const verificationToken = uuid.v4();
              let newUser = new userModel({
                name,
                email,
                password,
                userRole: 1, // role = 0 admin , role = 1 customer
                secretKey: verificationToken
              });
              const verificationLink = `https://www.mayursports.com/verify?token=${verificationToken}`;
              let res123 = await newUser.save();
              if(res123){
                let subject = 'Email Verification | Mayur Sports';
                let text = `<div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                              <h2 style="color: #007bff;">Email Verification:</h2>
                              <p>Dear ${name},</p>
                              <p>To verify your email, please click on this link: <a href="${verificationLink}">Verify Email</a></p>
                              <div style="text-align: center; padding: 10px; background-color: #f5f5f5;">
                                <p style="color: #333;">Follow us on social media: <a href="https://www.facebook.com/mayursports1/">Facebook</a> | <a href="https://www.instagram.com/mayursports1/">Instagram</a></p>
                              </div>
                            </div>`;
                let abc = await sendEmailNoReply(email, subject, text);
                if(abc){
                  return res.json({
                    success: "Success! An Email has been sent on your registered email address.",
                  });
                }else{
                  let data1 = await userModel.findOneAndDelete({ email: email });
                  error = {
                    ...error,
                    password: "",
                    name: "",
                    email: "",
                    validpot123: "",
                    captcha: "Something Went Wrong!"
                  };
                  return res.json({ error });
                }
              }else {
                error = {
                  ...error,
                  password: "",
                  name: "",
                  email: "",
                  validpot123: "",
                  captcha: "Something Went Wrong!"
                };
                return res.json({ error });
              };
            }
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        error = {
          ...error,
          password: "",
          name: "",
          email: "Email is not valid",
        };
        return res.json({ error });
      }
    }
  }

  async postSignupInfluencer(req, res) {
    let { name, email, password } = req.body;
    let error = {};
    if (!name || !email || !password) {
      error = {
        ...error,
        name: "Field must not be empty",
        email: "Field must not be empty",
        password: "Field must not be empty",
      };
      return res.json({ error });
    }
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 characters long" };
      return res.json({ error });
    } else {
      if (validateEmail(email)) {
        name = toTitleCase(name);
        if ((password.length > 255) | (password.length < 8)) {
          error = {
            ...error,
            password: "Password must be 8 characters long",
            name: "",
            email: "",
          };
          return res.json({ error });
        } else {
          // If Email & Number exists in Database then:
          try {
            password = bcrypt.hashSync(password, 10);
            const data = await userModel.findOne({ email: email });
            if (data) {
              error = {
                ...error,
                password: "",
                name: "",
                email: "Email already exists",
              };
              return res.json({ error });
            } else {
              let newUser = new userModel({
                name,
                email,
                password,
                userRole: 2, // role = 0 admin , role = 1 customer, role = 2 influencer
                verified: "YES"
              });
              
              let res123 = await newUser.save();
              if(res123){
                let subject = 'Khush Toh Bohot Honge Tum 😎';
                let text = `
                <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                  <h2 style="color: #007bff;">Exciting Collaboration Opportunity</h2>
                  <p>Dear ${name},</p>
                  <p>We are thrilled to inform you that we have selected you as the influencer for our upcoming coupons distribution and promotion campaign on our website.</p>
                  <p>As an influencer, you play a crucial role in shaping the shopping experiences of our users, and we believe your audience will greatly benefit from the exclusive discounts and promotions we have to offer.</p>
                  <p><strong>Login Details:</strong></p>
                  <ul>
                    <li>Email : ${email}</li>
                    <li>Password : ${mailpass} <br>(can be changed here after login: <a href="https://www.mayursports.com/dashboard" target="_blank">Click here</a>)</li>
                  </ul>
                  <p>We are confident that your influence will contribute to the success of this campaign, and we look forward to a mutually beneficial collaboration.</p>
                  <p>If you have any questions or require additional information, please feel free to reach out to us. Thank you for being a part of our journey!</p>
                  <p>Best regards,<br><strong>Mayur Jadhav</strong><br>
                  <a href="https://www.mayursports.com" target="_blank">Mayur Sports</a></p>
                  <div style="text-align: center; padding: 10px; background-color: #f5f5f5;">
                    <p style="color: #333;">Follow us on social media: <a href="https://www.facebook.com/mayursports1/">Facebook</a> | <a href="https://www.instagram.com/mayursports1/">Instagram</a></p>
                  </div>
                </div>
                `;
                let abc = await sendEmail(email, subject, text);
                if(abc){
                  return res.json({
                    success: "Account created successfully. Please login",
                  });
                }else{
                  return res.json({
                    success: "Account created successfully. EMAIL ERROR",
                  });
                }
              }else {
                  console.log(err);
              };
            }
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        error = {
          ...error,
          password: "",
          name: "",
          email: "Email is not valid",
        };
        return res.json({ error });
      }
    }
  }


  async postDeleteUser(req, res) {
    let { uid } = req.body;
    if (!uid) {
      return res.json({ message: "All fields must be required" });
    } else {
      let currentUser = userModel.findByIdAndDelete(uid);
      currentUser.exec((err, result) => {
        if (err) console.log(err);

        const message = "✅Influencer deleted successfully!";
        // Redirect with the message as a query parameter
        return res.redirect(`/admin/influencers?message=${encodeURIComponent(message)}`);
      });
    }
  }

  /* User Login/Signin controller  */
  async postSignin(req, res) {
    let { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        error: "Fields must not be empty",
      });
    }
    try {
      const data = await userModel.findOne({ email: email });
      if (!data) {
        return res.json({
          error: "Invalid email or password",
        });
      } else {
        if (data.verified !== "YES") {
          return res.json({
            error: "Please verify email before logging in.",
          });
        }
        const login = await bcrypt.compare(password, data.password);
        if (login) {
          const token = jwt.sign(
            { _id: data._id, role: data.userRole },
            JWT_SECRET
          );
          const encode = jwt.verify(token, JWT_SECRET);
          return res.json({
            token: token,
            user: encode,
            userid: data._id,
            role: data.userRole
          });
        } else {
          return res.json({
            error: "Invalid email or password",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  // // Configure Google OAuth 2.0 strategy
  //   passport.use(new GoogleStrategy({
  //     clientID: 'your-client-id',
  //     clientSecret: 'your-client-secret',
  //     callbackURL: 'http://localhost:3000/auth/google/callback'
  //   },
  //   function(accessToken, refreshToken, profile, done) {
  //     // Look up the user in the database
  //     User.findOne({ email: profile.emails[0].value }, function(err, user) {
  //       if (err) { return done(err); }
  //       if (user) {
  //         // If the user already exists, update their profile and return it
  //         user.name = profile.displayName;
  //         user.updatedAt = Date.now();
  //         user.save(function(err) {
  //           if (err) { return done(err); }
  //           return done(null, user);
  //         });
  //       } else {
  //         // If the user doesn't exist, create a new user and return it
  //         const newUser = new User({
  //           name: profile.displayName,
  //           email: profile.emails[0].value,
  //           userRole: 2
  //         });
  //         newUser.save(function(err) {
  //           if (err) { return done(err); }
  //           return done(null, newUser);
  //         });
  //       }
  //     });
  
  //     return done(null, profile);
  //   }
  // ));

  // // Configure session management
  //   passport.serializeUser(function(user, done) {
  //   done(null, user);
  //   });

  //   passport.deserializeUser(function(id, done) {
  //     User.findById(id, function(err, user) {
  //       done(err, user);
  //     });
  //   });

  // // Configure authentication routes
  //   app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  //   app.get('/auth/google/callback', 
  //   passport.authenticate('google', { failureRedirect: '/' }),
  //   function(req, res) {
  //   // redirect the user to the homepage or to dashboard
  //   res.redirect('/');
  // });
}

const authController = new Auth();
module.exports = authController;
