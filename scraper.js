/**
 * This file should contain functions pertaining to querying through a website
 * and requesting individual pages to be scraped
 */
const propertypalParser = require("./parsers/propertypal");
const creds = require("./creds");
/**
  houseTypes,
  parseSearchPageLinks,
  getListUrlByPage,
  parsePage,
  parseSearchPageNumbers
 */
function start(page) {
  // get list of search terms, zipcodes etc
  const searches = creds.searches;
  const houseTypes = propertypalParser.houseTypes;
  const firstPageLinks = [];
  const allListPages = firstPageLinks.slice();

  searches.forEach(searchString => {
    houseTypes.forEach(houseTypeString => {
      // do getListUrlByPage and get list page
      firstPageLinks.push(propertypalParser.getListUrlByPage(1, houseTypeString, searchString));
    });
  });

  // go to individual page and parsePage
  firstPageLinks.forEach(listPageString => {
    await page.goto(listPageString);
    let maxPageNumbers = await propertypalParser.parseSearchPageNumbers(page);
    for (var i = 2; i < maxPageNumbers; i++) {
      // todo: figure out how to get the correct houseType
      allListPages.push(propertypalParser.getListUrlByPage(i));
    }
  });
  // upload to mongo
}
module.exports = {
  start
};
