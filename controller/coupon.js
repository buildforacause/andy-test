const couponModel = require("../models/coupon");

class coupon {
  async check(req, res){
    let pin = req.body.coupon;
    try {
      let couponAvailable = await couponModel.find({coupon: pin, status:1});
      if(couponAvailable.length > 0){
        return res.json({ success: true, message: "Coupon Applied" , coupon: couponAvailable[0].coupon , color: "green", discount: couponAvailable[0].discount});
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
    let {coupon, discount,user} = req.body;
    if (!coupon) {
      return res.json({ error: "Please enter coupon" });
    }

    if (!discount) {
        return res.json({ error: "Please enter discount" });
      }

    try {
    let coupon123 = couponModel.findOne({coupon:coupon});
    if(coupon123){
      const message = "❌Coupon has been used before.";
      return res.redirect(`/admin/coupon-view?message=${encodeURIComponent(message)}`)
    }
      let newcoupon = new couponModel({
        coupon: coupon,
        discount:discount,
        user:user
      });
      let save = await newcoupon.save();
      if (save) {
        const message = "✅Successfully added the coupon!";
        return res.redirect(`/admin/coupon-view?message=${encodeURIComponent(message)}`)
      }
    } catch (err) {
      const message = "❌Error adding the coupon.";
      return res.redirect(`/admin/coupon-view?message=${encodeURIComponent(message)}`)
    }
  }

  async edit(req, res){
    let { _id, coupon, discount, user } = req.body;
    if (!_id | !coupon | !discount | !user) {
      return res.json({ error: "All fields are required" });
    } else {
      try {
        let coupon123 = couponModel.findOne({coupon:coupon});
        if(coupon123){
          const message = "❌Coupon has been used before.";
          return res.redirect(`/admin/coupon-view?message=${encodeURIComponent(message)}`)
        }
        let del = await couponModel.findByIdAndUpdate(_id, {coupon: coupon, discount: discount,user:user});
        if (del) {
          const message = "✅Successfully Edited the coupon!";
          return res.redirect(`/admin/coupon-view?message=${encodeURIComponent(message)}`)
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
      let deleteCategory = await couponModel.findByIdAndUpdate(_id,{status:0});
      if (deleteCategory) {
        // Assuming you have a message variable with the message you want to pass
        const message = "✅Successfully deleted the coupon!";
        return res.redirect(`/admin/coupon-view?message=${encodeURIComponent(message)}`)
      }
    } catch (err) { 
      const message = "❌Deleted the coupon!";
      return res.redirect(`/admin/coupon-view?message=${encodeURIComponent(message)}`)
    }
  }
}

}


const couponController = new coupon();
module.exports = couponController;
