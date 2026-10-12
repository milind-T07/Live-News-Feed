/* ============================================
   MAIN.JS — News Feed Entry Point
   ============================================
*/

document.addEventListener("DOMContentLoaded", function () {
  // Load initial news (top headlines)
  loadNews("general");

  // Set up search functionality
  initSearch();

  // Set up category filter buttons
  initCategoryFilters();
});

// loadNews() - Fetches and displays news by category
async function loadNews(category) {
  // Show loading spinner while fetching
  showLoading();

  // Fetch headlines from GNews (async function from api.js)
  const result = await fetchTopHeadlines(category);

  // Check if the request was successful
  if (result.success) {
    renderArticles(result.articles);
  } else {
    showNewsError(result.error);
  }
}

// initSearch() - Sets up the news search form
function initSearch() {
  const searchForm = document.getElementById("search-form");

  searchForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const searchInput = document.getElementById("search-input");
    const query = searchInput.value.trim();

    // Don't search if input is empty
    if (query === "") {
      return;
    }

    // Show loading and fetch search results
    showLoading();
    const result = await searchNews(query);

    if (result.success) {
      renderArticles(result.articles);
    } else {
      showNewsError(result.error);
    }

    // Remove active state from category buttons
    const allCategoryButtons = document.querySelectorAll(".category-btn");
    allCategoryButtons.forEach(function (btn) {
      btn.classList.remove("active");
    });
  });
}

// initCategoryFilters() - Sets up click handlers for category filter buttons
function initCategoryFilters() {
  const categoryButtons = document.querySelectorAll(".category-btn");

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      // Get the category from the button's data attribute
      const category = button.getAttribute("data-category");

      // Highlight the active button
      setActiveCategory(button);

      // Clear the search input
      document.getElementById("search-input").value = "";

      // Fetch news for the selected category
      loadNews(category);
    });
  });
}
