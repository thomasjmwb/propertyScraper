/**
 * This file should contain functions pertaining to querying through a website
 * and requesting individual pages to be scraped
 */
const creds = require("./creds");
/**
  houseTypes,
  parseSearchPageLinks,
  getListUrlByPage,
  parsePage,
  parseSearchPageNumbers
 */
async function scrapeIndividualPageUrls(page, parser) {
  // get list of search terms, zipcodes etc
  const searches = creds.searches;
  const houseTypes = parser.houseTypes;
  const firstPageLinks = [];
  const processFirstPage = async listPageString => {
    const stringParts = listPageString.split("/");
    const houseType = stringParts[3];
    const zipCode = stringParts[4];
    await page.goto(listPageString);
    const maxPageNumbers = await parser.parseSearchPageNumbers(page);
    for (var i = 2; i < maxPageNumbers; i++) {
      const pageLink = await parser.getListUrlByPage(i, houseType, zipCode);
      pagedPageLinks.push(pageLink);
    }

    const parsedPropertyPageUrls = await parser.parseSearchPageLinks(page);
    propertyPageUrls = propertyPageUrls.concat(parsedPropertyPageUrls);
  };
  const pagedPageLinks = [];
  let propertyPageUrls = [];

  searches.forEach(searchString => {
    houseTypes.forEach(houseTypeString => {
      // do getListUrlByPage and get list page
      firstPageLinks.push(parser.getListUrlByPage(1, houseTypeString, searchString));
    });
  });

  // go to the first page of each list search, and get all the rest of the page numbers
  for (const i in firstPageLinks) {
    await processFirstPage(firstPageLinks[i]);
  }

  const propertyPageUrlModels = propertyPageUrls.map(url => {
    return {
      url: url,
      urlType: parser.getUrlType()
    };
  });
  // todo: upload to mongo
  parser
    .getPageModel()
    .insertMany(propertyPageUrlModels)
    .then(console.log)
    .catch(console.log);
}

async function scrapeIndividualPages(page, parser) {
  // todo: get page links from mongo
  const profilePropertyLinks = [];
  profilePropertyLinks.forEach(async linkString => {
    await page.goto(linkString);
    // go to individual page and parsePage
    const profile = await parser.parsePage(page);
  });
}

module.exports = {
  scrapeIndividualPageUrls,
  scrapeIndividualPages
};
