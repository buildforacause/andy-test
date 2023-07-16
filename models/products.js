const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    company: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 0,
    },
    category: {
      type: ObjectId,
      ref: "categories",
    },
    image: {
      type: Array,
      required: true,
    },
    SKU: {
      type: String,
      required: true
    },
    offer: {
      type: String,
      default: null,
    },
    shipping: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    },
    ratings: [
      {
        review: String,
        image: Array,
        user: { type: ObjectId, ref: "users" },
        rating: String,
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("products", productSchema);
module.exports = productModel;
