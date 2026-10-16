/* ============================================
   UI.JS — Premium Digital Editorial DOM Renderer
   Handles layout generation, image fallbacks, relative time, 
   bookmarks, and accessible states.
   ============================================ */

// Storage key for bookmarked articles
const BOOKMARKS_STORAGE_KEY = "dev_agency_saved_articles_v1";

/**
 * Returns saved articles from localStorage.
 */
function getSavedArticles() {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load bookmarks:", e);
    return [];
  }
}

/**
 * Checks if an article is already bookmarked.
 */
function isArticleSaved(articleId) {
  const list = getSavedArticles();
  return list.some(item => item.id === articleId);
}

/**
 * Toggles an article's bookmark state.
 */
function toggleBookmark(article) {
  try {
    let list = getSavedArticles();
    const exists = list.some(item => item.id === article.id);
    let isSaved = false;

    if (exists) {
      list = list.filter(item => item.id !== article.id);
      isSaved = false;
      showToast("Removed from saved bookmarks");
    } else {
      list.unshift(article);
      isSaved = true;
      showToast("Article saved to bookmarks");
    }

    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(list));
    updateBookmarkBadgeCount();
    return isSaved;
  } catch (e) {
    console.error("Failed to update bookmark:", e);
    return false;
  }
}

/**
 * Updates the navbar bookmark counter badge.
 */
function updateBookmarkBadgeCount() {
  const badge = document.getElementById("bookmark-count-badge");
  if (badge) {
    const count = getSavedArticles().length;
    badge.textContent = count;
    badge.setAttribute("data-count", count);
    if (count > 0) {
      badge.classList.add("has-items");
    } else {
      badge.classList.remove("has-items");
    }
  }
}

/**
 * Displays a non-intrusive toast notification.
 */
let toastTimeout = null;
function showToast(message) {
  let toast = document.getElementById("ui-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ui-toast";
    toast.className = "ui-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("visible");

  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2600);
}

/**
 * Calculates human-readable relative time (e.g., '2h ago').
 */
function formatRelativeTime(dateStr) {
  if (!dateStr) return "Recent dispatch";

  try {
    // Handle formats like '2026-10-11 16:25:00' or ISO strings
    const cleanStr = dateStr.includes(" ") && !dateStr.includes("T") 
      ? dateStr.replace(" ", "T") + "Z" 
      : dateStr;
    const date = new Date(cleanStr);

    if (isNaN(date.getTime())) {
      return "Recent dispatch";
    }

    const now = Date.now();
    const diffMs = now - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
    });
  } catch (e) {
    return "Recent dispatch";
  }
}

/**
 * Estimates reading time from article text.
 */
function estimateReadTime(text) {
  if (!text) return "2 min read";
  const words = text.trim().split(/\s+/).length;
  const time = Math.max(2, Math.min(8, Math.ceil((words + 200) / 100)));
  return `${time} min read`;
}

/**
 * Returns an inline SVG fallback illustration for missing or broken images.
 * Base64-encoded to guarantee self-contained gradient IDs without HTTP 404 requests.
 */
function getCategoryFallbackSvg(category) {
  const cat = (category || "News").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
    <defs>
      <linearGradient id="fallbackBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#111827"/>
        <stop offset="50%" stop-color="#1e1b4b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <linearGradient id="fallbackAccent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#8b5cf6"/>
        <stop offset="100%" stop-color="#38bdf8"/>
      </linearGradient>
    </defs>
    <rect width="800" height="450" fill="url(#fallbackBg)"/>
    <circle cx="700" cy="80" r="140" fill="#8b5cf6" fill-opacity="0.12"/>
    <circle cx="100" cy="380" r="180" fill="#38bdf8" fill-opacity="0.08"/>
    <g transform="translate(60, 200)">
      <rect x="0" y="0" width="84" height="26" rx="6" fill="url(#fallbackAccent)"/>
      <text x="42" y="17" fill="#ffffff" font-family="system-ui, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">${cat}</text>
      <text x="0" y="70" fill="#f8fafc" font-family="system-ui, sans-serif" font-size="28" font-weight="700">Live Editorial Dispatch</text>
      <text x="0" y="105" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="15">Verified Reporting &amp; Analysis</text>
    </g>
  </svg>`;
  try {
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  } catch (e) {
    return "favicon.svg";
  }
}

/**
 * Escapes HTML characters safely.
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Returns primary category name or fallback.
 */
function getPrimaryCategory(article) {
  if (article.categories && article.categories.length > 0) {
    const raw = article.categories[0];
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return "Dispatch";
}

/**
 * Shows comprehensive skeleton loaders matching the editorial layout.
 */
function showEditorialLoading() {
  const editorialShowcase = document.getElementById("editorial-showcase");
  const newsContainer = document.getElementById("news-container");
  const storiesTitle = document.getElementById("stories-section-title");

  if (storiesTitle) storiesTitle.textContent = "Latest Stories";

  // Showcase Skeletons (Featured + Top Headlines)
  if (editorialShowcase) {
    editorialShowcase.style.display = "grid";
    editorialShowcase.innerHTML = `
      <div class="featured-card skeleton-card">
        <div class="skeleton-image"></div>
        <div class="featured-content">
          <div class="skeleton-pill"></div>
          <div class="skeleton-line" style="width: 90%; height: 28px; margin: 14px 0 8px;"></div>
          <div class="skeleton-line" style="width: 75%; height: 28px; margin-bottom: 14px;"></div>
          <div class="skeleton-line" style="width: 100%; height: 16px;"></div>
          <div class="skeleton-line" style="width: 85%; height: 16px; margin-top: 6px;"></div>
          <div class="skeleton-meta" style="margin-top: 24px;"></div>
        </div>
      </div>
      <div class="top-headlines-panel">
        <div class="panel-header">
          <div class="skeleton-line" style="width: 120px; height: 18px;"></div>
        </div>
        <div class="headlines-list">
          ${[1, 2, 3, 4].map(() => `
            <div class="headline-skeleton-item">
              <div class="skeleton-thumb"></div>
              <div class="headline-skeleton-body">
                <div class="skeleton-line" style="width: 40%; height: 12px; margin-bottom: 6px;"></div>
                <div class="skeleton-line" style="width: 95%; height: 16px; margin-bottom: 4px;"></div>
                <div class="skeleton-line" style="width: 60%; height: 12px;"></div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // Grid Skeletons (6 Cards)
  if (newsContainer) {
    newsContainer.innerHTML = `
      <div class="news-grid">
        ${[1, 2, 3, 4, 5, 6].map(() => `
          <div class="article-card skeleton-card">
            <div class="skeleton-image" style="aspect-ratio: 16/9; height: auto;"></div>
            <div class="article-content">
              <div class="skeleton-line" style="width: 35%; height: 12px; margin-bottom: 10px;"></div>
              <div class="skeleton-line" style="width: 90%; height: 20px; margin-bottom: 8px;"></div>
              <div class="skeleton-line" style="width: 70%; height: 20px; margin-bottom: 12px;"></div>
              <div class="skeleton-line" style="width: 100%; height: 14px; margin-bottom: 6px;"></div>
              <div class="skeleton-line" style="width: 80%; height: 14px; margin-bottom: 18px;"></div>
              <div class="skeleton-meta"></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
}

/**
 * Renders the Featured Lead Story card.
 */
function renderFeaturedStory(article) {
  const category = getPrimaryCategory(article);
  const fallbackSvg = getCategoryFallbackSvg(category);
  const timeAgo = formatRelativeTime(article.pubDate);
  const readTime = estimateReadTime(article.title + " " + article.description);
  const isSaved = isArticleSaved(article.id);
  const sourceIconHtml = article.sourceIcon 
    ? `<img src="${article.sourceIcon}" class="source-favicon" alt="" onerror="this.style.display='none'" />` 
    : `<span class="source-dot"></span>`;

  return `
    <article class="featured-card" data-article-id="${escapeHtml(article.id)}">
      <div class="featured-media">
        <img 
          src="${article.imageUrl ? escapeHtml(article.imageUrl) : fallbackSvg}" 
          alt="${escapeHtml(article.title)}" 
          class="featured-image"
          loading="eager"
          onerror="this.onerror=null; this.src='${fallbackSvg}';"
        />
        <div class="featured-overlay"></div>
        <div class="featured-badge-group">
          <span class="category-badge featured-badge">${escapeHtml(category)}</span>
          <span class="lead-tag">Featured Lead</span>
        </div>
        <button 
          type="button" 
          class="bookmark-btn ${isSaved ? "active" : ""}" 
          data-action="bookmark"
          data-article-id="${escapeHtml(article.id)}"
          aria-label="${isSaved ? "Remove from bookmarks" : "Save article"}"
          title="${isSaved ? "Remove bookmark" : "Save for later"}"
        >
          <svg class="bookmark-icon" viewBox="0 0 24 24" fill="${isSaved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

      <div class="featured-content">
        <div class="featured-meta-top">
          <div class="source-pill">
            ${sourceIconHtml}
            <span class="source-name">${escapeHtml(article.sourceName)}</span>
          </div>
          <span class="meta-separator">•</span>
          <time class="pub-time" datetime="${escapeHtml(article.pubDate || "")}">${escapeHtml(timeAgo)}</time>
          <span class="meta-separator">•</span>
          <span class="read-estimate">${escapeHtml(readTime)}</span>
        </div>

        <h2 class="featured-title">
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="story-link">
            ${escapeHtml(article.title)}
          </a>
        </h2>

        <p class="featured-summary">
          ${escapeHtml(article.description)}
        </p>

        <div class="featured-actions">
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-editorial">
            <span>Read Full Story</span>
            <svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <span class="external-domain">${new URL(article.link).hostname.replace(/^www\./, "")}</span>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders an individual compact headline item for the Top Headlines panel.
 */
function renderHeadlineItem(article) {
  const category = getPrimaryCategory(article);
  const fallbackSvg = getCategoryFallbackSvg(category);
  const timeAgo = formatRelativeTime(article.pubDate);
  const isSaved = isArticleSaved(article.id);

  return `
    <article class="headline-item" data-article-id="${escapeHtml(article.id)}">
      <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="headline-thumb-link" tabindex="-1" aria-hidden="true">
        <img 
          src="${article.imageUrl ? escapeHtml(article.imageUrl) : fallbackSvg}" 
          alt="" 
          class="headline-thumb" 
          loading="lazy"
          onerror="this.onerror=null; this.src='${fallbackSvg}';"
        />
      </a>
      <div class="headline-body">
        <div class="headline-meta">
          <span class="headline-category">${escapeHtml(category)}</span>
          <span class="meta-separator">•</span>
          <time class="pub-time">${escapeHtml(timeAgo)}</time>
        </div>
        <h3 class="headline-title">
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="story-link">
            ${escapeHtml(article.title)}
          </a>
        </h3>
        <div class="headline-source-row">
          <span class="source-name">${escapeHtml(article.sourceName)}</span>
          <button 
            type="button" 
            class="mini-bookmark-btn ${isSaved ? "active" : ""}" 
            data-action="bookmark"
            data-article-id="${escapeHtml(article.id)}"
            aria-label="${isSaved ? "Remove from bookmarks" : "Save article"}"
          >
            <svg viewBox="0 0 24 24" fill="${isSaved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Renders standard grid article card.
 */
function renderArticleCard(article) {
  const category = getPrimaryCategory(article);
  const fallbackSvg = getCategoryFallbackSvg(category);
  const timeAgo = formatRelativeTime(article.pubDate);
  const readTime = estimateReadTime(article.title + " " + article.description);
  const isSaved = isArticleSaved(article.id);
  const sourceIconHtml = article.sourceIcon 
    ? `<img src="${article.sourceIcon}" class="source-favicon" alt="" onerror="this.style.display='none'" />` 
    : `<span class="source-dot"></span>`;

  return `
    <article class="article-card" data-article-id="${escapeHtml(article.id)}">
      <div class="card-media">
        <img 
          src="${article.imageUrl ? escapeHtml(article.imageUrl) : fallbackSvg}" 
          alt="${escapeHtml(article.title)}" 
          class="article-image" 
          loading="lazy"
          onerror="this.onerror=null; this.src='${fallbackSvg}';"
        />
        <div class="card-badge-wrap">
          <span class="category-badge">${escapeHtml(category)}</span>
        </div>
        <button 
          type="button" 
          class="bookmark-btn ${isSaved ? "active" : ""}" 
          data-action="bookmark"
          data-article-id="${escapeHtml(article.id)}"
          aria-label="${isSaved ? "Remove from bookmarks" : "Save article"}"
          title="${isSaved ? "Remove bookmark" : "Save for later"}"
        >
          <svg class="bookmark-icon" viewBox="0 0 24 24" fill="${isSaved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      </div>

      <div class="article-content">
        <div class="article-meta">
          <div class="source-pill">
            ${sourceIconHtml}
            <span class="source-name">${escapeHtml(article.sourceName)}</span>
          </div>
          <time class="pub-time">${escapeHtml(timeAgo)}</time>
        </div>

        <h3 class="article-title">
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="story-link">
            ${escapeHtml(article.title)}
          </a>
        </h3>

        <p class="article-description">
          ${escapeHtml(article.description)}
        </p>

        <div class="card-footer">
          <span class="read-estimate">${escapeHtml(readTime)}</span>
          <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="read-link">
            <span>Read Story</span>
            <svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M7 17L17 7M17 7H7M17 7V17"/>
            </svg>
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Main DOM rendering function. Handles Featured, Headlines, and Grid layout.
 */
function renderEditorialLayout(articles, options = {}) {
  const editorialShowcase = document.getElementById("editorial-showcase");
  const newsContainer = document.getElementById("news-container");
  const storiesTitle = document.getElementById("stories-section-title");
  const activeSearchIndicator = document.getElementById("active-search-indicator");

  // Handle Search indicator banner
  if (activeSearchIndicator) {
    if (options.isSearch && options.query) {
      activeSearchIndicator.style.display = "flex";
      activeSearchIndicator.innerHTML = `
        <div class="search-result-info">
          <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
          </svg>
          <span>Showing results for "<strong>${escapeHtml(options.query)}</strong>" (${articles.length} found)</span>
        </div>
        <button type="button" id="clear-search-btn" class="btn-clear-filter">
          <span>Clear Search</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      `;
    } else {
      activeSearchIndicator.style.display = "none";
    }
  }

  // Handle Curated Preview indicator banner
  const previewModeBanner = document.getElementById("preview-mode-banner");
  if (previewModeBanner) {
    if (options.isFallbackPreview && options.view !== "bookmarks") {
      previewModeBanner.style.display = "flex";
      previewModeBanner.innerHTML = `
        <div class="preview-banner-left">
          <span class="preview-badge-pill">Curated Preview</span>
          <span>Displaying editorial sample dispatches. Connect your personal NewsData.io key for live streaming.</span>
        </div>
        <button type="button" class="btn-preview-config" id="banner-config-key-btn">
          <span>Configure API Key</span>
        </button>
      `;
    } else {
      previewModeBanner.style.display = "none";
    }
  }

  // 1. If no articles exist, show tailored empty state
  if (!articles || articles.length === 0) {
    if (editorialShowcase) editorialShowcase.style.display = "none";
    if (storiesTitle) storiesTitle.textContent = options.view === "bookmarks" ? "Saved Articles" : "No Articles";

    const emptyMsg = options.view === "bookmarks"
      ? "You haven't bookmarked any articles yet. Browse stories and tap the bookmark icon on any card to save it."
      : options.isSearch
        ? `No reports matched your query "${options.query}". Try searching broader terms like AI, tech, energy, or markets.`
        : "No articles are available in this category at this moment. Please check back shortly.";

    showEmptyState(emptyMsg, options.view === "bookmarks" ? "Browse News" : "Reset Filter");
    return;
  }

  // 2. BOOKMARKS VIEW: Hide featured showcase, show all saved in grid
  if (options.view === "bookmarks") {
    if (editorialShowcase) editorialShowcase.style.display = "none";
    if (storiesTitle) storiesTitle.textContent = `Saved Articles (${articles.length})`;

    let cardsHtml = articles.map(renderArticleCard).join("");
    newsContainer.innerHTML = `<div class="news-grid">${cardsHtml}</div>`;
    return;
  }

  // 3. SEARCH VIEW: If searching with >= 3 articles, show top result featured, otherwise clean grid
  if (options.isSearch) {
    if (articles.length >= 4 && editorialShowcase) {
      editorialShowcase.style.display = "grid";
      const featured = articles[0];
      const headlines = articles.slice(1, 4);
      const remaining = articles.slice(4);

      editorialShowcase.innerHTML = `
        <div id="featured-story-container">
          ${renderFeaturedStory(featured)}
        </div>
        <div id="top-headlines-container" class="top-headlines-panel">
          <div class="panel-header">
            <h3 class="panel-title">Top Match Headlines</h3>
            <span class="live-dot" title="Live stream"></span>
          </div>
          <div class="headlines-list">
            ${headlines.map(renderHeadlineItem).join("")}
          </div>
        </div>
      `;

      if (storiesTitle) storiesTitle.textContent = `Related Stories (${remaining.length})`;
      newsContainer.innerHTML = remaining.length > 0 
        ? `<div class="news-grid">${remaining.map(renderArticleCard).join("")}</div>`
        : `<div class="notice-box"><p>Explore more articles by selecting a topic above.</p></div>`;
    } else {
      if (editorialShowcase) editorialShowcase.style.display = "none";
      if (storiesTitle) storiesTitle.textContent = `Search Results (${articles.length})`;
      newsContainer.innerHTML = `<div class="news-grid">${articles.map(renderArticleCard).join("")}</div>`;
    }
    return;
  }

  // 4. STANDARD DISCOVER / CATEGORY VIEW: Full Editorial Layout
  const categoryLabel = options.category && options.category !== "top"
    ? options.category.charAt(0).toUpperCase() + options.category.slice(1)
    : "Top Stories";

  if (editorialShowcase && articles.length >= 3) {
    editorialShowcase.style.display = "grid";

    const featured = articles[0];
    const headlinesCount = Math.min(4, Math.max(2, articles.length - 2));
    const headlines = articles.slice(1, 1 + headlinesCount);
    const gridArticles = articles.slice(1 + headlinesCount);

    editorialShowcase.innerHTML = `
      <div id="featured-story-container">
        ${renderFeaturedStory(featured)}
      </div>
      <div id="top-headlines-container" class="top-headlines-panel">
        <div class="panel-header">
          <div class="panel-header-left">
            <span class="panel-indicator"></span>
            <h3 class="panel-title">Top Headlines</h3>
          </div>
          <span class="panel-badge">Live</span>
        </div>
        <div class="headlines-list">
          ${headlines.map(renderHeadlineItem).join("")}
        </div>
      </div>
    `;

    if (storiesTitle) storiesTitle.textContent = `Latest Stories — ${categoryLabel}`;
    newsContainer.innerHTML = gridArticles.length > 0
      ? `<div class="news-grid">${gridArticles.map(renderArticleCard).join("")}</div>`
      : `<div class="notice-box"><p>Showing top priority dispatches for ${escapeHtml(categoryLabel)}.</p></div>`;
  } else {
    if (editorialShowcase) editorialShowcase.style.display = "none";
    if (storiesTitle) storiesTitle.textContent = `Latest Stories — ${categoryLabel}`;
    newsContainer.innerHTML = `<div class="news-grid">${articles.map(renderArticleCard).join("")}</div>`;
  }
}

/**
 * Renders an empty state view with call-to-action button.
 */
function showEmptyState(message, actionLabel = "Reset Filter") {
  const newsContainer = document.getElementById("news-container");
  if (!newsContainer) return;

  newsContainer.innerHTML = `
    <div class="editorial-empty-state">
      <div class="empty-icon-wrap">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M19 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v1m2 13a2 2 0 0 1-2-2V7m2 13a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m-4-3H9M7 16h6M7 8h6m-6 4h10"/>
        </svg>
      </div>
      <h3 class="empty-title">No Articles Discovered</h3>
      <p class="empty-desc">${escapeHtml(message)}</p>
      <button type="button" id="empty-state-action-btn" class="btn btn-secondary btn-action">
        ${escapeHtml(actionLabel)}
      </button>
    </div>
  `;
}

/**
 * Displays user-friendly error state with retry option.
 */
function showErrorState(message, onRetry) {
  const editorialShowcase = document.getElementById("editorial-showcase");
  const newsContainer = document.getElementById("news-container");
  if (editorialShowcase) editorialShowcase.style.display = "none";

  if (newsContainer) {
    newsContainer.innerHTML = `
      <div class="editorial-error-state">
        <div class="error-icon-wrap">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 class="error-title">Feed Unavailable</h3>
        <p class="error-desc">${escapeHtml(message || "An unexpected issue occurred while fetching the news feed.")}</p>
        <div class="error-actions">
          <button type="button" id="retry-feed-btn" class="btn btn-primary">
            <svg class="retry-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
            </svg>
            <span>Retry Connection</span>
          </button>
          <button type="button" id="error-config-key-btn" class="btn btn-secondary">
            <span>Configure API Key</span>
          </button>
          <button type="button" id="fallback-browse-btn" class="btn btn-secondary">
            <span>Explore Saved Bookmarks</span>
          </button>
        </div>
      </div>
    `;

    const retryBtn = document.getElementById("retry-feed-btn");
    if (retryBtn && typeof onRetry === "function") {
      retryBtn.addEventListener("click", onRetry);
    }
  }
}
