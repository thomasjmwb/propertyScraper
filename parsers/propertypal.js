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

/**
 *
 * @param {Object} page
 * @return {Object} models/property.js
 */
function parsePage(page) {
  const model = {};
}

/**
 *
 * @param {Object} page
 * @return {Number} total page numbers for a given search
 */
async function parseSearchPageNumbers(page) {
  const selector = ".paging-page.paging-last a";
  let maxPageNumber = await page.evaluate(sel => {
    return document.querySelector(sel).text;
  }, selector);
  const pageNum = parseInt(maxPageNumber);
  if (isNaN(pageNum)) {
    console.log(`Couldnt parse maxPageNumber: ${maxPageNumber}`);
    return 0;
  }
  return pageNum;
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
