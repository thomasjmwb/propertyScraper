const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  url: { type: String, required: true },
  sold: Boolean,
  //property fields
  address: String,
  price: Number,
  Rates: Number,
  Bedrooms: Number,
  Bathrooms: Number,
  Heating: String,
  pictures: [
    {
      type: String // urls
    }
  ],

  dateCrawled: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  }
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
