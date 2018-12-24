const mongoose = require("mongoose");

let propertySchema = new mongoose.Schema({
  address: String,
  price: Number,
  Rates: Number,
  Bedrooms: Number,
  Bathrooms: Number,
  Heating: String,
  url: { type: String, unique: true, required: true, dropDups: true },
  pictures: [
    {
      type: String
    }
  ]
});

let Property = mongoose.model("Property", propertySchema);

module.exports = Property;
