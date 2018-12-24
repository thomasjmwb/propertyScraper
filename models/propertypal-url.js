const mongoose = require("mongoose");

const propertyUrlSchema = new mongoose.Schema({
  url: { type: String, unique: true, required: true, dropDups: true },
  // urlType: "propertypal" for now, but this field will be used to support other websites to scrape in the future
  urlType: String,
  dateCrawled: {
    type: Date,
    // `Date.now()` returns the current unix timestamp as a number
    default: Date.now
  }
});

const Property = mongoose.model("PropertyUrl", propertyUrlSchema);

module.exports = Property;
