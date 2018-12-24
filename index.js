const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const CREDS = require("./creds");

const scraper = require("./scraper");
const propertypalParser = require("./parsers/propertypal");

async function run() {
  //   const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({
    headless: false
  });

  if (mongoose.connection.readyState == 0) {
    mongoose.connect(CREDS.database);
  } else {
    return console.log(" mongoose connection wasnt ready");
  }
  await scraper.scrapeIndividualPageUrls(page, propertypalParser);

  browser.close();
}

run();
