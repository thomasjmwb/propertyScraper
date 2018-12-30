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
  const firstLength = firstPageLinks.length;
  for (const i in firstPageLinks) {
    console.log(`processing first page links: ${i}/${firstLength}`);
    await processFirstPage(firstPageLinks[i]);
  }
  // process pagedPageLinks now that they have been populated from the firstPageLinks
  const pagedLength = pagedPageLinks.length;
  for (const i in pagedPageLinks) {
    console.log(`processing paged page links: ${i}/${pagedLength}`);
    await processFirstPage(pagedPageLinks[i]);
  }

  const propertyPageUrlModels = propertyPageUrls.map(url => {
    return {
      url: url,
      urlType: parser.urlType
    };
  });
  // insert the models, ordered:false so the rest will finish inserting even if there is a duplicate
  // http://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#insertMany
  parser
    .getPageUrlModel()
    .insertMany(propertyPageUrlModels, {
      ordered: false
    })
    .then(console.log)
    .catch(console.log);
}

async function scrapeIndividualPages(page, parser) {
  // todo: get page links from mongo

  const profilePropertyLinks = await parser.getPageUrlModel().find();
  const profileModels = [];
  const linksLength = profilePropertyLinks.length;
  for (const i in profilePropertyLinks) {
    console.log(`processing property page ${i}/${linksLength}`);
    await page.goto(profilePropertyLinks[i].url);
    const profile = await parser.parsePage(page);
    profileModels.push(profile);
  }

  parser
    .getPageModel()
    .insertMany(profileModels, {})
    .then(console.log)
    .catch(console.log);
}

module.exports = {
  scrapeIndividualPageUrls,
  scrapeIndividualPages
};
