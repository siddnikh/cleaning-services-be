const axios = require('axios');
const FormData = require('form-data');
const { logger } = require('../config/logger');

async function uploadImageToCloudflare(imageFile) {
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/images/v1`;

  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    logger.info(`Uploading image to Cloudflare: ${imageFile}`);
    const response = await axios.post(endpoint, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
      },
    });

    if (response.data.success) {
      const imageUrl = response.data.result.variants[0];
      return imageUrl;
    } else {
      throw new Error(response.data.errors);
    }
  } catch (error) {
    logger.error(`Error uploading image: ${error.message}`);
    throw error;
  }
}

module.exports = { uploadImageToCloudflare };
