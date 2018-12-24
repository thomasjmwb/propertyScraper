const PropertyUrl = require("../models/propertypal-url");
const Property = require("../models/property");

const baseUrl = `https://www.propertypal.com`;
const houseTypes = ["property-for-sale", "new-homes"];
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
function parseSearchPageNumbers(page) {
  const selector = ".paging-page.paging-last";
  let maxPageNumber = await page.evaluate((sel) => {
    return document.querySelector(sel).getAttribute('href');
  }, selector);
  // document.querySelector(".paging-page.paging-last").textContent

  return maxPageNumber;
}

/**
 *
 * @param {Object} page
 * @return {Array[String]} list of urls to scrape
 */
function parseSearchPageLinks(page) {
  const selector = ".paging-page.paging-last";
  let linkUrls = await page.evaluate((sel) => {
    return [...document.querySelectorAll(".box.propbox.propbox--forsale a:nth-child(2)")].map(n=>`${baseUrl}${n.getAttribute('href')}`);
  }, selector);
  return linkUrls;
}

function getPageModel(){
  return Property;
}

function getPageUrlModel(){
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
