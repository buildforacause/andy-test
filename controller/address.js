const addressModel = require("../models/address");

class Address {

  async postAddress(req, res) {
    let { aname, aaddress, aphone, user, acity, apincode, astate } =
      req.body;
    if (
      !aname |
      !aphone |
      !aaddress |
      !user |
      !acity |
      !apincode |
      !astate
    ) {
      return res.json({ error: "All fields are required" });
    }
    else {
      try {
        let newAddress = new addressModel({
          aname: aname,
          aphone: aphone,
          aaddress: aaddress,
          acity: acity,
          apincode: apincode,
          astate: astate,
          user: user
        });
        let save = await newAddress.save();
        if (save) {
          return res.redirect("/dashboard#tab-address")
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getDeleteAddress(req, res) {
    let { _id } = req.body;
    if (!_id) {
      return res.json({ error: "All fields must be required" });
    } else {
      try {
        let deleteProduct = await addressModel.findByIdAndUpdate(_id,{"hidden": 1});
        if (deleteProduct) {
          return res.redirect("/dashboard#tab-address");
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

}

const addressController = new Address();
module.exports = addressController;
