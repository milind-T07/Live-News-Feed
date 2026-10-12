/* ============================================
   UI.JS — News Feed DOM Rendering
   ============================================
*/

// showLoading() - Shows a loading spinner while news is being fetched
function showLoading() {
  const newsContainer = document.getElementById("news-container");
  newsContainer.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading news...</p>
    </div>
  `;
}

// renderArticles() - Renders news article cards to the page
function renderArticles(articles) {
  const newsContainer = document.getElementById("news-container");

  // If no articles found, show empty state
  if (articles.length === 0) {
    newsContainer.innerHTML = `
      <div class="empty-state">
        <p>No articles found. Try a different search or category.</p>
      </div>
    `;
    return;
  }

  // Build HTML for each article card
  let cardsHTML = "";
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    // Use a placeholder if the article has no image
    const imageHTML = article.image_url
      ? `<img src="${article.image_url}" alt="${article.title}" class="article-image" onerror="this.style.display='none'" />`
      : `<div class="article-image-placeholder">No Image</div>`;

    // Format the date (or show "Unknown date" if missing)
    const dateText = article.publishedAt
      ? formatDate(article.publishedAt)
      : "Unknown date";

    // Get the source name (or "Unknown source")
    const sourceName = article.source && article.source.name
      ? article.source.name
      : "Unknown source";

    // Truncate description if too long
    const description = article.description
      ? truncateText(article.description, 120)
      : "No description available.";

    cardsHTML += `
      <div class="card article-card">
        ${imageHTML}
        <div class="article-content">
          <div class="article-meta">
            <span class="article-source">${sourceName}</span>
            <span class="article-date">${dateText}</span>
          </div>
          <h3 class="article-title">${article.title}</h3>
          <p class="article-description">${description}</p>
          <a href="${article.url}" target="_blank" rel="noopener" class="btn btn-small btn-primary">
            Read Full Article →
          </a>
        </div>
      </div>
    `;
  }

  newsContainer.innerHTML = `<div class="news-grid">${cardsHTML}</div>`;
}

// showError() - Displays an error message in the news container
function showNewsError(message) {
  const newsContainer = document.getElementById("news-container");
  newsContainer.innerHTML = `
    <div class="alert alert-error">
      <strong>Error:</strong> ${message}
    </div>
  `;
}

// setActiveCategory() - Highlights the active category button
function setActiveCategory(activeButton) {
  // Remove active class from all category buttons
  const allButtons = document.querySelectorAll(".category-btn");
  allButtons.forEach(function (btn) {
    btn.classList.remove("active");
  });

  // Add active class to the clicked button
  activeButton.classList.add("active");
}

// formatDate() - Formats an ISO date string to a readable format
function formatDate(isoString) {
  const date = new Date(isoString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// truncateText() - Shortens text to a maximum length and adds "..."
function truncateText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
}
