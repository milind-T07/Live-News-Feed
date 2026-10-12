// fetchTopHeadlines() - Fetches top headlines from GNews
async function fetchTopHeadlines(category) {
  let url = `${NEWS_API_CONFIG.baseUrl}?`;
  url += `country=${NEWS_API_CONFIG.defaultCountry}`;
  url += `&apikey=${NEWS_API_CONFIG.apiKey}`;

  if (category && category !== "general") {
    url += `&category=${category}`;
  }

  return await makeApiRequest(url);
}

// searchNews() - Searches for news articles by keyword
async function searchNews(query) {
  let url = `${NEWS_API_CONFIG.baseUrl}?`;
  url += `q=${encodeURIComponent(query)}`;
  url += `&apikey=${NEWS_API_CONFIG.apiKey}`;

  return await makeApiRequest(url);
}

// makeApiRequest() - Makes a fetch request and handles errors
async function makeApiRequest(url) {
  try {
    if (NEWS_API_CONFIG.apiKey === "YOUR_API_KEY_HERE") {
      return { success: false, articles: [], error: "API key not configured." };
    }

    const response = await fetch(url);
    const data = await response.json();

    // Handle HTTP errors
    if (!response.ok) {
      if (response.status === 401) return { success: false, articles: [], error: "Invalid API key." };
      if (response.status === 403) return { success: false, articles: [], error: "API limit reached." };
      if (response.status === 429) return { success: false, articles: [], error: "Too many requests. Please wait." };
      return { success: false, articles: [], error: data.errors?.[0] || "An error occurred fetching news." };
    }

    if (!data.results || data.results.length === 0) {
      return { success: true, articles: [], error: null };
    }

    return { success: true, articles: data.results, error: null };

  } catch (error) {
    console.error("Network error:", error);
    return { success: false, articles: [], error: "Network error. Please check your connection." };
  }
}
