const puppeteer = require("puppeteer");
const mongoose = require("mongoose");
const CREDS = require("./creds");

const User = require("./models/user");
const scraper = require("./scraper");

async function run() {
  //   const browser = await puppeteer.launch();
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();

  const USERNAME_SELECTOR = "#login_field";
  const PASSWORD_SELECTOR = "#password";
  const BUTTON_SELECTOR = "#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block";

  await page.goto("https://github.com/login");

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(CREDS.username);

  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(CREDS.password);

  await page.click(BUTTON_SELECTOR);

  await page.waitForNavigation();

  let username = await page.evaluate(sel => {
    return document
      .querySelector(sel)
      .getAttribute("href")
      .replace("/", "");
  }, usernameSelector);

  await page.screenshot({ path: "github.png" });

  scraper.start(page);

  upsertUser({
    username: "test",
    email: "tesasdadst",
    dateCrawled: new Date()
  });

  browser.close();
}

function upsertUser(userObj) {
  if (mongoose.connection.readyState == 0) {
    mongoose.connect(CREDS.database);
  }

  // if this email exists, update the entry, don't insert
  let conditions = { email: userObj.email };
  let options = { upsert: true, new: true, setDefaultsOnInsert: true };

  User.findOneAndUpdate(conditions, userObj, options, (err, result) => {
    if (err) throw err;
  });
}

run();
