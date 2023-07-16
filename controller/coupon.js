const couponModel = require("../models/coupon");

class coupon {
  async check(req, res){
    let pin = req.body.coupon;
    try {
      let couponAvailable = await couponModel.findOne({coupon: pin});
      if(couponAvailable){
        return res.json({ success: true, message: "Coupon Applied" , coupon: couponAvailable.coupon , color: "green", discount: couponAvailable.discount});
      }else{
        return res.json({ success: false, message: "This is not a valid coupon" , color: "red"});
      }
    } catch (err) {
      console.log(err);
    }
  }

  async all(req, res) {
    try {
      let coupons = await couponModel.find({}).sort({ _id: -1 });
      if(coupons){
        return res.json({coupons});
      }
    } catch (err) {
      console.log(err);
    }
  }

  async add(req, res) {
    let {coupon, discount} = req.body;
    if (!coupon) {
      return res.json({ error: "Please enter coupon" });
    }

    if (!discount) {
        return res.json({ error: "Please enter discount" });
      }

    try {
      let newcoupon = new couponModel({
        coupon: coupon,
        discount:discount
      });
      let save = await newcoupon.save();
      if (save) {
        return res.redirect("/admin/coupon-view")
      }
    } catch (err) {
      console.log(err);
    }
  }

  async edit(req, res){
    let { _id, coupon, discount } = req.body;
    if (!_id | !coupon | !discount) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let del = await couponModel.findByIdAndUpdate(_id, {coupon: coupon, discount: discount});
        if (del) {
          return res.redirect("/admin/coupon-view")
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

async delete(req, res){
  let { _id } = req.body;
  if (!_id) {
    return res.json({ error: "All fields are required" });
  } else {
    try {
      let deleteCategory = await couponModel.findOneAndDelete({_id: _id});
      if (deleteCategory) {
        return res.redirect("/admin/coupon-view")
      }
    } catch (err) {
      console.log(err);
    }
  }
}

}


const couponController = new coupon();
module.exports = couponController;
