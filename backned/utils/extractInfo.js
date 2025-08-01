const axios = require('axios');
const cheerio = require('cheerio');
const read = require('node-readability');

async function getOgImage(url) {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const ogImage = $('meta[property="og:image"]').attr('content');
    return ogImage;
  } catch (error) {
    console.error('Error fetching or parsing URL:', error);
    return null;
  }
}

async function getFirstImageUrl(websiteUrl) {
  try {
    const imageUrl = await getOgImage(websiteUrl);
    if (imageUrl) {
      console.log('Open Graph Image URL:', imageUrl);
      return imageUrl;
    } else {
      console.log('No Open Graph Image found or error occurred.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching or parsing:', error.message);
    return null;
  }
}

async function getTitle(websiteUrl) {
  try {
    // Promisify the read function
    const title = await new Promise((resolve, reject) => {
      read(websiteUrl, function (err, article, meta) {
        if (err) {
          reject(err);
          return;
        }
        // Close article to clean up jsdom and prevent leaks
        const result = article.title;
        article.close();
        resolve(result);
      });
    });

    return title;
  } catch (error) {
    console.error('Error fetching or parsing:', error.message);
    return null;
  }
}

module.exports = {
  getFirstImageUrl,
  getTitle,
};
