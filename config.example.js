/* ============================================
   CONFIG.EXAMPLE.JS — News Feed Configuration Template
   Copy this file to js/config.js and add your API key.
   ============================================
*/

const NEWS_API_CONFIG = {
  // Replace with your NewsData.io API Key (https://newsdata.io/)
  apiKey: "YOUR_API_KEY_HERE",

  // Base URL for NewsData.io
  baseUrl: "https://newsdata.io/api/1/news",

  // Default parameters
  defaultCountry: "us",
  defaultLang: "en",
  defaultCategory: "top",

  // Free tier allows up to 10 articles per request
  pageSize: 10,

  // Cache duration in milliseconds (10 minutes)
  cacheTTL: 10 * 60 * 1000
};
