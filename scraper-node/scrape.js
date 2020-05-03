'use strict';

const fs = require('fs');
const xml = require('xml2js');

const request = require('superagent');

const site = 'https://www.fashionnova.com';

async function scrape(url) {
  if (!(await isShopify(url))) return;
  const sitemap = await getSitemap(url);
  const productsLinks = getSitemapProductsLinks(sitemap);
  const filename =
    __dirname + '/' + encodeURIComponent(site) + '_' + Date.now();
  for (const link of productsLinks) {
    const linkProducts = await getProducts(link);
    writeProducts(filename, linkProducts);
  }
}

function writeProducts(filename, products) {
  fs.appendFileSync(
    filename,
    products.map(p => JSON.stringify(p) + '\n').join(''),
  );
}

async function getProducts(link) {
  const { body } = await request
    .get(link)
    .set(
      'User-Agent',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
    );

  return xml
    .parseStringPromise(body, { explicitArray: false })
    .then(({ urlset }) => {
      return urlset.url
        .filter(u => u.loc.includes('/products'))
        .map(p => ({
          ...p,
          title: p.loc
            .split('/')
            .pop()
            .replace(/-/g, ' '),
        }));
    });
}

function getSitemapProductsLinks(sitemap) {
  return sitemap.sitemapindex.sitemap
    .filter(l => l.loc.includes('sitemap_products'))
    .map(l => l.loc);
}

async function isShopify(url) {
  const { text } = await request
    .get(url)
    .set(
      'User-Agent',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
    );

  return text.includes('//cdn.shopify.com');
}

async function getSitemap(url) {
  const res = await request
    .get(url + '/sitemap.xml')
    .set(
      'User-Agent',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.88 Safari/537.36',
    )
    .catch(e => {
      console.loge(e);
    });

  return xml.parseStringPromise(res.body, { explicitArray: false });
}

scrape(site).catch(e => {
  console.error(e);
});
