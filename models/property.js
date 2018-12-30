const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  url: { type: String, required: true },
  parseSuccessful: Boolean,
  scrapedHTML: String,
  //property fields
  address: String,
  price: Number,
  rates: Number,
  bedrooms: Number,
  bathrooms: Number,
  heating: String,
  style: String,
  pictures: [
    {
      type: String // urls
    }
  ],
  sold: Boolean,

  dateCrawled: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  }
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
