const pincodeModel = require("../models/pincode");

class pincode {
  async checkPincode(req, res){
    let pin = req.body.pincode;
    try {
      let pinCodeAvailable = await pincodeModel.findOne({pincode: pin});
      if(pinCodeAvailable){
        return res.json({ message: "Delivery is available" , color: "text-success"});
      }else{
        return res.json({ message: "Delivery is not available" , color: "text-danger"});
      }
    } catch (err) {
      console.log(err);
    }
  }

  async allPincode(req, res) {
    try {
      let Pincodes = await pincodeModel.find({}).sort({ _id: -1 });
      if(Pincodes){
        return res.json({Pincodes});
      }
    } catch (err) {
      console.log(err);
    }
  }

  async addPincode(req, res) {
    let {pincode} = req.body;
    if (!pincode) {
      return res.json({ error: "Please enter pincode" });
    }
    try {
      let newPincode = new pincodeModel({
        pincode: pincode,
      });
      let save = await newPincode.save();
      if (save) {
        return res.redirect("/admin/pincode-view")
      }
    } catch (err) {
      console.log(err);
    }
  }

  async editPincode(req, res){
    let { _id, pincode } = req.body;
    if (!_id | !pincode) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let deleteCategory = await pincodeModel.findByIdAndUpdate(_id, {pincode: pincode});
        if (deleteCategory) {
          return res.redirect("/admin/pincode-view")
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

async deletePincode(req, res){
  let { _id } = req.body;
  if (!_id) {
    return res.json({ error: "All fields are required" });
  } else {
    try {
      let deleteCategory = await pincodeModel.findOneAndDelete({_id: _id});
      if (deleteCategory) {
        return res.redirect("/admin/pincode-view")
      }
    } catch (err) {
      console.log(err);
    }
  }
}

}


const pincodeController = new pincode();
module.exports = pincodeController;
