const PropertyUrl = require("../models/propertypal-url");
const Property = require("../models/property");

const baseUrl = `https://www.propertypal.com`;
const houseTypes = ["property-for-sale", "new-developments"];
/**
 * Parser for property pal
 */
function getListUrlByPage(pageNumber, houseType, zipcode) {
  const url = `${baseUrl}/${houseType}/${zipcode}/`;
  if (pageNumber === 1) {
    return url;
  }
  return `${baseUrl}/${houseType}/${zipcode}/page-${pageNumber}`;
}
// All functions used in the browser context must be copypasted into their evaluation block
/*
function textTrimmer(text) {
  return text
    .trim()
    .replace(/\n/g, " ")
    .replace(/[^\S\r\n]{2,}/g, " ");
}
*/

/**
 *
 * @param {Object} page
 * @return {Object} models/property.js
 */
async function parsePage(page) {
  const model = {
    parseSuccessful: true,
    parseFailFields: [],
    url: page.url()
  };
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  model["scrapedHTML"] = bodyHTML;
  const onParseFailure = parseField => {
    model.parseSuccessful = false;
    model.parseFailFields.push(parseField);
  };

  // sold: Boolean
  const sold = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => !!document.querySelector(".unavailable-listing-details"),
    parseField: "sold"
  });
  if (sold) {
    console.log(`Property was already sold, short circuiting parse.`);
    return model;
  }

  // address: String,
  const address = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => {
      function textTrimmer(text) {
        return text.trim().replace(/[^\S\r\n]{2,}/g, " ");
      }
      return textTrimmer(document.querySelector(".prop-summary-row h1").textContent);
    },
    parseField: "address"
  });
  // price: Number,
  const price = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => {
      function textTrimmer(text) {
        return text.trim().replace(/[^\S\r\n]{2,}/g, " ");
      }
      return parseInt(
        textTrimmer(document.querySelector(".price-value").textContent)
          .match(/\d/g)
          .join("")
      );
    },
    parseField: "price"
  });
  // rates: Number,
  const rates = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => {
      const tableHeaders = [...document.querySelectorAll("#key-info-table tr th")];
      const tableData = tableHeaders.filter(n => n.textContent.toLowerCase().indexOf("rates") > -1)[0];
      function textTrimmer(text) {
        return text.trim().replace(/[^\S\r\n]{2,}/g, " ");
      }
      return parseInt(
        textTrimmer(tableData.parentElement.children[1].textContent)
          .split(".")[0]
          .match(/\d/g)
          .join("")
      );
    },
    parseField: "rates"
  });
  // bedrooms: Number,
  const bedrooms = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => {
      const tableHeaders = [...document.querySelectorAll("#key-info-table tr th")];
      const tableData = tableHeaders.filter(n => n.textContent.toLowerCase().indexOf("bedrooms") > -1)[0];
      function textTrimmer(text) {
        return text.trim().replace(/[^\S\r\n]{2,}/g, " ");
      }
      return parseInt(
        textTrimmer(tableData.parentElement.children[1].textContent)
          .match(/\d/g)
          .join("")
      );
    },
    parseField: "bedrooms"
  });
  // bathrooms: Number,
  const bathrooms = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => {
      const tableHeaders = [...document.querySelectorAll("#key-info-table tr th")];
      const tableData = tableHeaders.filter(n => n.textContent.toLowerCase().indexOf("bathrooms") > -1)[0];
      function textTrimmer(text) {
        return text.trim().replace(/[^\S\r\n]{2,}/g, " ");
      }
      return parseInt(
        textTrimmer(tableData.parentElement.children[1].textContent)
          .match(/\d/g)
          .join("")
      );
    },
    parseField: "bathrooms"
  });
  // heating: String,
  const heating = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => {
      const tableHeaders = [...document.querySelectorAll("#key-info-table tr th")];
      const tableData = tableHeaders.filter(n => n.textContent.toLowerCase().indexOf("heating") > -1)[0];
      function textTrimmer(text) {
        return text.trim().replace(/[^\S\r\n]{2,}/g, " ");
      }
      return textTrimmer(tableData.parentElement.children[1].textContent);
    },
    parseField: "heating"
  });
  // pictures: [String]
  const pictures = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => [...document.querySelectorAll(".Slideshow-slide img")].map(n => n.getAttribute("src")),
    parseField: "pictures"
  });
  // style: String
  const style = await parseProfileValue(page, {
    model,
    onParseFailure,
    pageExecution: () => {
      const tableHeaders = [...document.querySelectorAll("#key-info-table tr th")];
      const tableData = tableHeaders.filter(n => n.textContent.toLowerCase().indexOf("style") > -1)[0];
      function textTrimmer(text) {
        return text.trim().replace(/[^\S\r\n]{2,}/g, " ");
      }
      return textTrimmer(tableData.parentElement.children[1].textContent);
    },
    parseField: "style"
  });

  return model;
}

/**
 *
 * @param {pupeteer page object} page
 * @param {Object} options
 * @param {Function} pageExecution - function puppeteer will execute to parse a value from the page
 * @param {Function} onParseFailure - function to execute with parseField on failure
 * @param {String} parseField - parsed field
 * @param {Object} model - parsed object, mongodb moodel
 */
async function parseProfileValue(page, options) {
  const { pageExecution, onParseFailure, parseField, model } = options;
  let parsedValue = "";
  try {
    parsedValue = await page.evaluate(pageExecution);
  } catch (e) {
    onParseFailure(parseField);
    console.log(`Unable to parseProfileValue: ${parseField}. Error: ${e.stack}`);
  }
  model[parseField] = parsedValue;
  return parsedValue;
}

/**
 *
 * @param {Object} page
 * @return {Number} total page numbers for a given search
 */
async function parseSearchPageNumbers(page) {
  const selector = ".paging-page.paging-last a";
  let maxPageNumber = 1;
  try {
    maxPageNumber = await page.evaluate(sel => {
      return document.querySelector(sel).text;
    }, selector);
  } catch (e) {
    console.log(`Couldnt parse maxPageNumber on ${page.url()}. Error: ${e.stack}`);
    return maxPageNumber;
  }
  return parseInt(maxPageNumber);
}

/**
 *
 * @param {Object} page
 * @return {Array[String]} list of urls to scrape
 */
async function parseSearchPageLinks(page) {
  const selector = ".box.propbox.propbox--forsale a:nth-child(2)";
  // href includes a `/` at the start, so the string template looks a little messy
  let linkUrls = await page.evaluate(
    (sel, baseUrl) => {
      return [...document.querySelectorAll(sel)].map(n => `${baseUrl}${n.getAttribute("href")}`);
    },
    selector,
    baseUrl
  );
  return linkUrls;
}

function getPageModel() {
  return Property;
}

function getPageUrlModel() {
  return PropertyUrl;
}
module.exports = {
  houseTypes,
  parseSearchPageLinks,
  getListUrlByPage,
  parsePage,
  parseSearchPageNumbers,
  getPageModel,
  getPageUrlModel,
  urlType: "propertypal"
};
