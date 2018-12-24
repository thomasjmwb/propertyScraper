/**
 * Parser for property pal
 */
function getListUrlByPage(pageNumber, zipcode) {
  const url = `https://www.propertypal.com/property-for-sale/${zipcode}/`;
  if (pageNumber === 1) {
    return url;
  }
  return `https://www.propertypal.com/property-for-sale/${zipcode}/page-${pageNumber}`;
}

/**
 *
 * @param {Object} page
 * @return {Object} models/property.js
 */
function parsePage(page) {}

/**
 *
 * @param {Object} page
 * @return {Number} total page numbers for a given search
 */
function parseSearchPageNumbers(page) {}

module.exports = {
  getListUrlByPage,
  parsePage,
  parseSearchPageNumbers
};
