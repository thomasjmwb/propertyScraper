const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  address: String,
  price: Number,
  Rates: Number,
  Bedrooms: Number,
  Bathrooms: Number,
  Heating: String,
  url: { type: String, required: true },
  dateCrawled: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  },
  pictures: [
    {
      type: String
    }
  ]
});

const Property = mongoose.model("Property", propertySchema);

module.exports = Property;
