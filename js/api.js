/* ============================================
   API.JS — Resilient News Discovery Service
   Handles fetching, caching, deduplication, and error recovery
   ============================================ */

// In-memory cache for fast tab switching
const API_CACHE = new Map();

/**
 * Normalizes an article object to ensure consistent field names across sources.
 */
function normalizeArticle(item) {
  if (!item) return null;

  // Resolve title
  const title = (item.title || "").trim();
  if (!title || title === "[Removed]") return null;

  // Resolve link / destination
  const link = item.link || item.url || "#";

  // Resolve description
  let description = item.description || item.content || "";
  if (typeof description === "string") {
    // Strip "ONLY AVAILABLE IN PAID PLANS" or HTML tags if present
    description = description.replace(/ONLY AVAILABLE IN PAID PLANS/gi, "").trim();
    description = description.replace(/<[^>]*>?/gm, "").trim();
  }

  // Resolve publisher / source name
  const sourceName = item.source_name || (item.source && item.source.name) || item.source_id || "Global News";

  // Resolve publisher icon
  const sourceIcon = item.source_icon || null;

  // Resolve publication date
  const pubDate = item.pubDate || item.publishedAt || item.fetched_at || null;

  // Resolve image URL
  let imageUrl = item.image_url || item.urlToImage || null;
  if (typeof imageUrl === "string" && !imageUrl.startsWith("http")) {
    imageUrl = null;
  }

  // Resolve categories
  let categories = [];
  if (Array.isArray(item.category)) {
    categories = item.category.filter(c => c && typeof c === "string" && c !== "top");
  } else if (typeof item.category === "string") {
    categories = [item.category];
  }

  // Unique ID for bookmarks & deduplication
  const id = item.article_id || encodeURIComponent(link) || Math.random().toString(36).substring(2);

  return {
    id,
    title,
    description: description || "Read the complete report and detailed coverage directly at the publisher.",
    link,
    sourceName,
    sourceIcon,
    pubDate,
    imageUrl,
    categories,
    raw: item
  };
}

/**
 * Deduplicates articles based on link, title, or id.
 */
function deduplicateArticles(articles) {
  const seen = new Set();
  const result = [];

  for (const article of articles) {
    if (!article) continue;
    // Normalize comparison keys
    const titleKey = article.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    const linkKey = article.link.toLowerCase();

    if (seen.has(titleKey) || seen.has(linkKey) || seen.has(article.id)) {
      continue;
    }

    seen.add(titleKey);
    seen.add(linkKey);
    seen.add(article.id);
    result.push(article);
  }

  return result;
}

/**
 * Retrieves cached response from memory or sessionStorage.
 */
function getCachedData(cacheKey) {
  const now = Date.now();
  const ttl = NEWS_API_CONFIG.cacheTTL || 10 * 60 * 1000;

  // 1. Check in-memory Map
  if (API_CACHE.has(cacheKey)) {
    const entry = API_CACHE.get(cacheKey);
    if (now - entry.timestamp < ttl) {
      return entry.data;
    }
    API_CACHE.delete(cacheKey);
  }

  // 2. Check sessionStorage
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const entry = JSON.parse(raw);
      if (now - entry.timestamp < ttl) {
        API_CACHE.set(cacheKey, entry);
        return entry.data;
      }
      sessionStorage.removeItem(cacheKey);
    }
  } catch (e) {
    // Ignore storage quota/security errors
  }

  return null;
}

/**
 * Stores data into cache.
 */
function setCachedData(cacheKey, data) {
  const entry = {
    timestamp: Date.now(),
    data
  };
  API_CACHE.set(cacheKey, entry);
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify(entry));
  } catch (e) {
    // Handle storage quota exceed gracefully
  }
}

/**
 * Fetch top headlines by category with caching and error handling.
 */
async function fetchTopHeadlines(category, forceRefresh = false) {
  const resolvedCategory = (!category || category === "all" || category === "general") 
    ? (NEWS_API_CONFIG.defaultCategory || "top") 
    : category.toLowerCase();

  const cacheKey = `news_feed_cat_${resolvedCategory}`;

  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      return { success: true, articles: cached, isCached: true, error: null };
    }
  }

  let url = `${NEWS_API_CONFIG.baseUrl}?`;
  url += `country=${NEWS_API_CONFIG.defaultCountry || "us"}`;
  url += `&language=${NEWS_API_CONFIG.defaultLang || "en"}`;
  url += `&apikey=${NEWS_API_CONFIG.apiKey}`;

  if (resolvedCategory) {
    url += `&category=${resolvedCategory}`;
  }

  return await makeApiRequest(url, cacheKey);
}

/**
 * Search news articles by query keyword.
 */
async function searchNews(query, forceRefresh = false) {
  const trimmed = (query || "").trim();
  if (!trimmed) {
    return { success: true, articles: [], error: null };
  }

  const cacheKey = `news_feed_q_${encodeURIComponent(trimmed.toLowerCase())}`;

  if (!forceRefresh) {
    const cached = getCachedData(cacheKey);
    if (cached) {
      return { success: true, articles: cached, isCached: true, error: null };
    }
  }

  let url = `${NEWS_API_CONFIG.baseUrl}?`;
  url += `language=${NEWS_API_CONFIG.defaultLang || "en"}`;
  url += `&apikey=${NEWS_API_CONFIG.apiKey}`;
  url += `&q=${encodeURIComponent(trimmed)}`;

  return await makeApiRequest(url, cacheKey);
}

/**
 * Executes API request with fallback handling and parsing.
 */
async function makeApiRequest(url, cacheKey) {
  try {
    if (!NEWS_API_CONFIG.apiKey || NEWS_API_CONFIG.apiKey === "YOUR_API_KEY_HERE") {
      return {
        success: false,
        articles: [],
        error: "API key is not configured. Please supply a valid NewsData.io API key in js/config.js."
      };
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        return { success: false, articles: [], error: "Invalid API key credentials. Verify your key in config.js." };
      }
      if (response.status === 403 || response.status === 429) {
        return { success: false, articles: [], error: "API daily request quota reached. Please try again later." };
      }
      const apiMsg = data.results?.message || data.errors?.[0] || data.message || `Server responded with HTTP ${response.status}`;
      return { success: false, articles: [], error: apiMsg };
    }

    if (data.status !== "success" && !Array.isArray(data.results)) {
      const errDetail = data.results?.message || data.message || "Failed to retrieve articles.";
      return { success: false, articles: [], error: errDetail };
    }

    const rawList = Array.isArray(data.results) ? data.results : [];
    const normalized = rawList.map(normalizeArticle).filter(Boolean);
    const uniqueList = deduplicateArticles(normalized);

    // Save into cache
    if (cacheKey && uniqueList.length > 0) {
      setCachedData(cacheKey, uniqueList);
    }

    return {
      success: true,
      articles: uniqueList,
      totalResults: data.totalResults || uniqueList.length,
      error: null
    };

  } catch (error) {
    console.error("News Feed API Request failed:", error);

    // Attempt to recover stale cache if available
    if (cacheKey) {
      const stale = getCachedData(cacheKey);
      if (stale && stale.length > 0) {
        return {
          success: true,
          articles: stale,
          isStale: true,
          error: "Connection lost. Serving cached offline dispatch."
        };
      }
    }

    return {
      success: false,
      articles: [],
      error: "Unable to connect to the news feed service. Please check your internet connection."
    };
  }
}
