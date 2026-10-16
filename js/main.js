/* ============================================
   MAIN.JS — Application Controller
   Coordinates state, API requests, event listeners,
   bookmarks, search, and navigation.
   ============================================ */

const appState = {
  currentCategory: "top",
  currentQuery: "",
  activeView: "discover", // 'discover' | 'bookmarks'
  currentSort: "latest",   // 'latest' | 'oldest'
  articles: [],
  isLoading: false,
  isFallbackPreview: false
};

document.addEventListener("DOMContentLoaded", function () {
  // 1. Initialize bookmark badge counter
  updateBookmarkBadgeCount();

  // 2. Setup all UI controls and event listeners
  initNavigation();
  initSearch();
  initCategoryFilters();
  initTrendingTopics();
  initSortControl();
  initApiKeyModal();
  initShareModal();
  initReaderModal();
  initScrollProgressBar();
  initPwaServiceWorker();
  initGlobalDelegation();
  initKeyboardShortcuts();

  // 3. Load initial top stories
  loadCategory("top");
});

/**
 * Loads articles for a category with optional forced cache bypass.
 */
async function loadCategory(category, forceRefresh = false) {
  if (appState.isLoading) return;
  appState.isLoading = true;
  appState.currentCategory = category || "top";
  appState.currentQuery = "";
  appState.activeView = "discover";

  // Update navigation visual state
  updateNavViewState("discover");

  // Show skeleton animation
  showEditorialLoading();

  try {
    const result = await fetchTopHeadlines(appState.currentCategory, forceRefresh);

    if (result.success) {
      appState.isFallbackPreview = Boolean(result.isFallbackPreview);
      appState.articles = applySort(result.articles, appState.currentSort);
      renderEditorialLayout(appState.articles, {
        isSearch: false,
        category: appState.currentCategory,
        view: "discover",
        isFallbackPreview: appState.isFallbackPreview
      });
    } else {
      showErrorState(result.error, () => loadCategory(appState.currentCategory, true));
    }
  } catch (err) {
    console.error("Load category error:", err);
    showErrorState("Unable to retrieve stories at this time.", () => loadCategory(appState.currentCategory, true));
  } finally {
    appState.isLoading = false;
  }
}

/**
 * Searches articles across sources by keyword.
 */
async function executeSearch(query, forceRefresh = false) {
  const trimmed = (query || "").trim();
  if (!trimmed) return;

  if (appState.isLoading) return;
  appState.isLoading = true;
  appState.currentQuery = trimmed;
  appState.activeView = "discover";

  updateNavViewState("discover");
  clearCategoryActiveStates();
  showEditorialLoading();

  try {
    const result = await searchNews(trimmed, forceRefresh);

    if (result.success) {
      addRecentSearch(trimmed);
      appState.isFallbackPreview = Boolean(result.isFallbackPreview);
      appState.articles = applySort(result.articles, appState.currentSort);
      renderEditorialLayout(appState.articles, {
        isSearch: true,
        query: trimmed,
        category: appState.currentCategory,
        view: "discover",
        isFallbackPreview: appState.isFallbackPreview
      });
    } else {
      showErrorState(result.error, () => executeSearch(trimmed, true));
    }
  } catch (err) {
    console.error("Search error:", err);
    showErrorState("Search request failed. Please check your network.", () => executeSearch(trimmed, true));
  } finally {
    appState.isLoading = false;

  }
}

/**
 * Displays the saved articles / bookmarks view.
 */
function showBookmarksView() {
  appState.activeView = "bookmarks";
  updateNavViewState("bookmarks");
  clearCategoryActiveStates();

  const saved = getSavedArticles();
  appState.articles = applySort(saved, appState.currentSort);

  renderEditorialLayout(appState.articles, {
    view: "bookmarks",
    category: "saved"
  });
}

/**
 * Sorts articles array by publication timestamp.
 */
function applySort(articles, sortMode) {
  if (!Array.isArray(articles)) return [];
  const list = [...articles];

  return list.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;

    if (sortMode === "oldest") {
      return dateA - dateB;
    }
    // Default 'latest'
    return dateB - dateA;
  });
}

/**
 * Setup navigation items (Discover, Bookmarks, Portfolio).
 */
function initNavigation() {
  const navDiscover = document.getElementById("nav-discover");
  const navBookmarks = document.getElementById("nav-bookmarks");
  const mobileNavDiscover = document.getElementById("mobile-nav-discover");
  const mobileNavBookmarks = document.getElementById("mobile-nav-bookmarks");

  if (navDiscover) {
    navDiscover.addEventListener("click", (e) => {
      e.preventDefault();
      if (appState.activeView !== "discover") {
        loadCategory(appState.currentCategory);
      }
    });
  }

  if (navBookmarks) {
    navBookmarks.addEventListener("click", (e) => {
      e.preventDefault();
      showBookmarksView();
    });
  }

  if (mobileNavDiscover) {
    mobileNavDiscover.addEventListener("click", (e) => {
      e.preventDefault();
      closeMobileMenu();
      if (appState.activeView !== "discover") {
        loadCategory(appState.currentCategory);
      }
    });
  }

  if (mobileNavBookmarks) {
    mobileNavBookmarks.addEventListener("click", (e) => {
      e.preventDefault();
      closeMobileMenu();
      showBookmarksView();
    });
  }
}

/**
 * Updates navbar active indicator between Discover and Bookmarks.
 */
function updateNavViewState(activeView) {
  const navDiscover = document.getElementById("nav-discover");
  const navBookmarks = document.getElementById("nav-bookmarks");
  const mobileNavDiscover = document.getElementById("mobile-nav-discover");
  const mobileNavBookmarks = document.getElementById("mobile-nav-bookmarks");

  if (navDiscover) navDiscover.classList.toggle("active", activeView === "discover");
  if (navBookmarks) navBookmarks.classList.toggle("active", activeView === "bookmarks");
  if (mobileNavDiscover) mobileNavDiscover.classList.toggle("active", activeView === "discover");
  if (mobileNavBookmarks) mobileNavBookmarks.classList.toggle("active", activeView === "bookmarks");
}

/**
// Storage key for search history
const RECENT_SEARCHES_KEY = "dev_agency_recent_searches";

/**
 * Retrieves past search queries from localStorage.
 */
function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Persists a new query into recent searches history.
 */
function addRecentSearch(query) {
  const trimmed = (query || "").trim();
  if (!trimmed) return;
  let list = getRecentSearches().filter(q => q.toLowerCase() !== trimmed.toLowerCase());
  list.unshift(trimmed);
  if (list.length > 5) list = list.slice(0, 5);
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
  } catch (e) {}
  renderRecentSearches();
}

/**
 * Clears search history.
 */
function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
  renderRecentSearches();
}

/**
 * Renders clickable recent search chips.
 */
function renderRecentSearches() {
  const container = document.getElementById("recent-searches-container");
  const chipsContainer = document.getElementById("recent-chips");
  if (!container || !chipsContainer) return;

  const list = getRecentSearches();
  if (list.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "flex";
  chipsContainer.innerHTML = list.map(q => `
    <button type="button" class="recent-chip" data-query="${escapeHtml(q)}">${escapeHtml(q)}</button>
  `).join("");
}

/**
 * Sets up Search form, clear button, and input handlers.
 */
function initSearch() {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchClearBtn = document.getElementById("search-clear-btn");
  const recentContainer = document.getElementById("recent-searches-container");
  const clearRecentBtn = document.getElementById("clear-recent-btn");

  renderRecentSearches();

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const q = searchInput.value.trim();
      if (q) {
        executeSearch(q);
      }
    });

    searchInput.addEventListener("input", function () {
      if (searchClearBtn) {
        searchClearBtn.style.display = searchInput.value.length > 0 ? "flex" : "none";
      }
    });

    if (searchClearBtn) {
      searchClearBtn.addEventListener("click", function () {
        searchInput.value = "";
        searchClearBtn.style.display = "none";
        searchInput.focus();
        if (appState.currentQuery) {
          loadCategory(appState.currentCategory);
        }
      });
    }
  }

  if (recentContainer) {
    recentContainer.addEventListener("click", function (e) {
      const chip = e.target.closest(".recent-chip");
      if (chip && searchInput) {
        const query = chip.getAttribute("data-query");
        if (query) {
          searchInput.value = query;
          if (searchClearBtn) searchClearBtn.style.display = "flex";
          executeSearch(query);
        }
      }
    });
  }

  if (clearRecentBtn) {
    clearRecentBtn.addEventListener("click", function () {
      clearRecentSearches();
    });
  }
}

/**
 * Sets up horizontal category filter tabs.
 */
function initCategoryFilters() {
  const categoryContainer = document.querySelector(".category-pills");
  if (!categoryContainer) return;

  categoryContainer.addEventListener("click", function (e) {
    const btn = e.target.closest(".category-pill");
    if (!btn) return;

    const cat = btn.getAttribute("data-category");
    if (!cat) return;

    // Set active class
    document.querySelectorAll(".category-pill").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Clear search input
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.value = "";
    const searchClear = document.getElementById("search-clear-btn");
    if (searchClear) searchClear.style.display = "none";

    loadCategory(cat);
  });
}

/**
 * Removes active highlighting from category pills.
 */
function clearCategoryActiveStates() {
  document.querySelectorAll(".category-pill").forEach(b => b.classList.remove("active"));
}

/**
 * Sets up clickable Trending Topic chips.
 */
function initTrendingTopics() {
  const trendingContainer = document.getElementById("trending-topics-container");
  if (!trendingContainer) return;

  trendingContainer.addEventListener("click", function (e) {
    const chip = e.target.closest(".trend-chip");
    if (!chip) return;

    const query = chip.getAttribute("data-topic");
    if (!query) return;

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = query;
      const searchClear = document.getElementById("search-clear-btn");
      if (searchClear) searchClear.style.display = "flex";
      searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    executeSearch(query);
  });
}

/**
 * Sets up Sorting dropdown, Regional Edition selector, and Refresh button.
 */
function initSortControl() {
  const sortSelect = document.getElementById("sort-select");
  const editionSelect = document.getElementById("edition-select");
  const refreshBtn = document.getElementById("refresh-btn");

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      appState.currentSort = sortSelect.value;
      appState.articles = applySort(appState.articles, appState.currentSort);

      renderEditorialLayout(appState.articles, {
        isSearch: Boolean(appState.currentQuery),
        query: appState.currentQuery,
        category: appState.currentCategory,
        view: appState.activeView,
        isFallbackPreview: appState.isFallbackPreview
      });
    });
  }

  if (editionSelect) {
    const savedEdition = localStorage.getItem("dev_agency_country") || "us";
    editionSelect.value = savedEdition;
    if (typeof NEWS_API_CONFIG !== "undefined") {
      NEWS_API_CONFIG.defaultCountry = savedEdition;
    }

    editionSelect.addEventListener("change", function () {
      const newEdition = editionSelect.value;
      if (typeof NEWS_API_CONFIG !== "undefined") {
        NEWS_API_CONFIG.defaultCountry = newEdition;
      }
      localStorage.setItem("dev_agency_country", newEdition);
      showToast(`Switched region edition to ${newEdition.toUpperCase()}`);
      loadCategory(appState.currentCategory, true);
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", function () {
      refreshBtn.classList.add("spinning");
      setTimeout(() => refreshBtn.classList.remove("spinning"), 1000);

      if (appState.activeView === "bookmarks") {
        showBookmarksView();
      } else if (appState.currentQuery) {
        executeSearch(appState.currentQuery, true);
      } else {
        loadCategory(appState.currentCategory, true);
      }
    });
  }
}

/**
 * Global event delegation for bookmarks, banner actions, and retry triggers.
 */
function initGlobalDelegation() {
  document.addEventListener("click", function (e) {
    // 1. Bookmark button click
    const bookmarkBtn = e.target.closest('[data-action="bookmark"]');
    if (bookmarkBtn) {
      e.preventDefault();
      e.stopPropagation();

      const articleId = bookmarkBtn.getAttribute("data-article-id");
      // Find article object in current memory or saved list
      let article = appState.articles.find(a => a.id === articleId);
      if (!article) {
        article = getSavedArticles().find(a => a.id === articleId);
      }

      if (article) {
        const isNowSaved = toggleBookmark(article);
        bookmarkBtn.classList.toggle("active", isNowSaved);

        const svg = bookmarkBtn.querySelector("svg");
        if (svg) {
          svg.setAttribute("fill", isNowSaved ? "currentColor" : "none");
        }

        // Update reader modal bookmark label if active
        const readerBtnText = document.getElementById("reader-bookmark-text");
        if (readerBtnText && bookmarkBtn.id === "reader-bookmark-btn") {
          readerBtnText.textContent = isNowSaved ? "Saved" : "Save";
        }

        // If currently viewing bookmarks and article was removed, re-render bookmarks
        if (appState.activeView === "bookmarks") {
          showBookmarksView();
        }
      }
      return;
    }

    // 2. Clear Search Banner button
    const clearSearchBtn = e.target.closest("#clear-search-btn");
    if (clearSearchBtn) {
      e.preventDefault();
      const searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.value = "";
      const searchClear = document.getElementById("search-clear-btn");
      if (searchClear) searchClear.style.display = "none";
      loadCategory(appState.currentCategory);
      return;
    }

    // 3. Empty State Action button
    const emptyActionBtn = e.target.closest("#empty-state-action-btn");
    if (emptyActionBtn) {
      e.preventDefault();
      const searchInput = document.getElementById("search-input");
      if (searchInput) searchInput.value = "";
      const searchClear = document.getElementById("search-clear-btn");
      if (searchClear) searchClear.style.display = "none";
      loadCategory("top");
      return;
    }

    // 4. Fallback browse button
    const fallbackBrowseBtn = e.target.closest("#fallback-browse-btn");
    if (fallbackBrowseBtn) {
      e.preventDefault();
      showBookmarksView();
      return;
    }

    // 5. Error state Configure API Key button
    const errorConfigKeyBtn = e.target.closest("#error-config-key-btn");
    if (errorConfigKeyBtn) {
      e.preventDefault();
      const dialog = document.getElementById("api-key-dialog");
      if (dialog) {
        const keyInput = document.getElementById("api-key-input");
        if (keyInput) keyInput.value = getEffectiveApiKey();
        dialog.showModal();
      }
      return;
    }

    // 6. Preview banner Configure API Key button
    const bannerConfigKeyBtn = e.target.closest("#banner-config-key-btn");
    if (bannerConfigKeyBtn) {
      e.preventDefault();
      const dialog = document.getElementById("api-key-dialog");
      if (dialog) {
        const keyInput = document.getElementById("api-key-input");
        if (keyInput) keyInput.value = getEffectiveApiKey();
        dialog.showModal();
      }
      return;
    }

    // 7. Share button click
    const shareBtn = e.target.closest('[data-action="share"]');
    if (shareBtn) {
      e.preventDefault();
      e.stopPropagation();
      const articleId = shareBtn.getAttribute("data-article-id");
      let article = appState.articles.find(a => a.id === articleId);
      if (!article) {
        article = getSavedArticles().find(a => a.id === articleId);
      }
      if (article) {
        handleArticleShare(article);
      }
      return;
    }

    // 8. Quick read preview button click
    const quickReadBtn = e.target.closest('[data-action="quick-read"]');
    if (quickReadBtn) {
      e.preventDefault();
      e.stopPropagation();
      const articleId = quickReadBtn.getAttribute("data-article-id");
      let article = appState.articles.find(a => a.id === articleId);
      if (!article) {
        article = getSavedArticles().find(a => a.id === articleId);
      }
      if (article) {
        openReaderModal(article);
      }
      return;
    }

    // 9. Export Bookmarks JSON
    const exportBtn = e.target.closest("#export-bookmarks-btn");
    if (exportBtn) {
      e.preventDefault();
      exportBookmarksToJson();
      return;
    }

    // 10. Clear All Bookmarks
    const clearAllBtn = e.target.closest("#clear-all-bookmarks-btn");
    if (clearAllBtn) {
      e.preventDefault();
      if (confirm("Are you sure you want to remove all saved bookmarks?")) {
        localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
        updateBookmarkBadgeCount();
        showToast("All bookmarks cleared");
        showBookmarksView();
      }
      return;
    }
  });

  // Handle bookmarks JSON file upload input
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "import-bookmarks-input") {
      const file = e.target.files && e.target.files[0];
      if (file) {
        importBookmarksFromJson(file);
      }
      e.target.value = "";
    }
  });
}

/**
 * Exports saved bookmarks as a downloadable JSON file.
 */
function exportBookmarksToJson() {
  const bookmarks = getSavedArticles();
  if (bookmarks.length === 0) {
    showToast("No bookmarks to export");
    return;
  }

  const dataStr = JSON.stringify(bookmarks, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `dev-agency-dispatch-bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${bookmarks.length} saved articles to JSON`);
}

/**
 * Imports bookmarks from an uploaded JSON file, deduplicating with existing bookmarks.
 */
function importBookmarksFromJson(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) {
        showToast("Invalid bookmarks file format (expected JSON array)");
        return;
      }

      let current = getSavedArticles();
      let addedCount = 0;

      for (const item of imported) {
        if (!item || !item.id || !item.title) continue;
        const exists = current.some(existing => existing.id === item.id || (existing.link && existing.link === item.link));
        if (!exists) {
          current.unshift(item);
          addedCount++;
        }
      }

      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(current));
      updateBookmarkBadgeCount();
      showToast(`Imported ${addedCount} new stories to bookmarks`);
      showBookmarksView();
    } catch (err) {
      showToast("Error parsing bookmarks JSON file");
    }
  };
  reader.readAsText(file);
}

/**
 * Registers PWA service worker for offline asset caching.
 */
function initPwaServiceWorker() {
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

/**
 * Updates dynamic scroll reading progress indicator at page top.
 */
function initScrollProgressBar() {
  const bar = document.getElementById("scroll-progress-bar");
  if (!bar) return;

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, scrollPercent))}%`;
  }, { passive: true });
}

/**
 * Populates and displays the Reader Preview Modal.
 */
function openReaderModal(article) {
  const dialog = document.getElementById("reader-modal");
  if (!dialog) return;

  const img = document.getElementById("reader-modal-img");
  const categoryPill = document.getElementById("reader-category-pill");
  const sourceName = document.getElementById("reader-source-name");
  const pubTime = document.getElementById("reader-pub-time");
  const readTime = document.getElementById("reader-read-time");
  const title = document.getElementById("reader-modal-title");
  const summary = document.getElementById("reader-modal-summary");
  const openExternal = document.getElementById("reader-open-external");
  const bookmarkBtn = document.getElementById("reader-bookmark-btn");
  const shareBtn = document.getElementById("reader-share-btn");
  const bookmarkText = document.getElementById("reader-bookmark-text");

  const category = getPrimaryCategory(article);
  const fallbackSvg = getCategoryFallbackSvg(category);

  if (img) {
    img.src = article.imageUrl || fallbackSvg;
    img.alt = article.title;
    img.onerror = () => { img.src = fallbackSvg; };
  }

  if (categoryPill) categoryPill.textContent = category;
  if (sourceName) sourceName.textContent = article.sourceName;
  if (pubTime) pubTime.textContent = formatRelativeTime(article.pubDate);
  if (readTime) readTime.textContent = estimateReadTime(article.title + " " + article.description);
  if (title) title.textContent = article.title;
  if (summary) summary.textContent = article.description;
  if (openExternal) openExternal.href = article.link;

  if (bookmarkBtn) {
    bookmarkBtn.setAttribute("data-article-id", article.id);
    const isSaved = isArticleSaved(article.id);
    bookmarkBtn.classList.toggle("active", isSaved);
    if (bookmarkText) bookmarkText.textContent = isSaved ? "Saved" : "Save";
    const svg = bookmarkBtn.querySelector("svg");
    if (svg) svg.setAttribute("fill", isSaved ? "currentColor" : "none");
  }

  if (shareBtn) {
    shareBtn.setAttribute("data-article-id", article.id);
  }

  dialog.showModal();
}

/**
 * Sets up Quick Reader modal event listeners.
 */
function initReaderModal() {
  const dialog = document.getElementById("reader-modal");
  const closeBtn = document.getElementById("close-reader-modal");

  if (closeBtn && dialog) {
    closeBtn.addEventListener("click", () => dialog.close());
  }

  if (dialog) {
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  }
}

/**
 * Handles sharing via Web Share API or falls back to Share Dialog.
 */
async function handleArticleShare(article) {
  if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
    try {
      await navigator.share({
        title: article.title,
        text: article.description,
        url: article.link
      });
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }

  openShareModal(article);
}

/**
 * Populates and opens the Share Dialog.
 */
function openShareModal(article) {
  const dialog = document.getElementById("share-dialog");
  if (!dialog) return;

  const titleEl = document.getElementById("share-preview-title");
  const sourceEl = document.getElementById("share-preview-source");
  const timeEl = document.getElementById("share-preview-time");
  const linkInput = document.getElementById("share-link-input");

  if (titleEl) titleEl.textContent = article.title;
  if (sourceEl) sourceEl.textContent = article.sourceName;
  if (timeEl) timeEl.textContent = formatRelativeTime(article.pubDate);
  if (linkInput) linkInput.value = article.link;

  const encodedUrl = encodeURIComponent(article.link);
  const encodedTitle = encodeURIComponent(article.title);

  const xBtn = document.getElementById("share-x-btn");
  const linkedInBtn = document.getElementById("share-linkedin-btn");
  const whatsAppBtn = document.getElementById("share-whatsapp-btn");
  const redditBtn = document.getElementById("share-reddit-btn");

  if (xBtn) xBtn.href = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  if (linkedInBtn) linkedInBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  if (whatsAppBtn) whatsAppBtn.href = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  if (redditBtn) redditBtn.href = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;

  dialog.showModal();
}

/**
 * Sets up Share modal event listeners.
 */
function initShareModal() {
  const dialog = document.getElementById("share-dialog");
  const closeBtn = document.getElementById("close-share-dialog");
  const copyBtn = document.getElementById("copy-share-link-btn");
  const linkInput = document.getElementById("share-link-input");

  if (closeBtn && dialog) {
    closeBtn.addEventListener("click", () => dialog.close());
  }

  if (dialog) {
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  }

  if (copyBtn && linkInput) {
    copyBtn.addEventListener("click", async () => {
      const url = linkInput.value;
      if (!url) return;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
        } else {
          linkInput.select();
          document.execCommand("copy");
        }
        showToast("Story link copied to clipboard!");
      } catch (err) {
        linkInput.select();
        showToast("Link selected. Press Ctrl+C/Cmd+C to copy");
      }
    });
  }
}

/**
 * Sets up API Key Configuration Modal and status indicators.
 */
function initApiKeyModal() {
  const dialog = document.getElementById("api-key-dialog");
  const openBtn = document.getElementById("api-settings-btn");
  const mobileOpenBtn = document.getElementById("mobile-api-settings-btn");
  const closeBtn = document.getElementById("close-api-dialog");
  const saveBtn = document.getElementById("save-api-key-btn");
  const testBtn = document.getElementById("test-api-key-btn");
  const clearBtn = document.getElementById("clear-api-key-btn");
  const keyInput = document.getElementById("api-key-input");
  const toggleVisibilityBtn = document.getElementById("toggle-key-visibility");
  const statusBanner = document.getElementById("api-status-banner");
  const statusText = document.getElementById("api-status-text");
  const statusDot = document.getElementById("api-status-dot");

  function updateStatusDisplay() {
    const key = getEffectiveApiKey();
    const hasKey = Boolean(key && key.length > 5);

    if (statusDot) {
      statusDot.classList.toggle("active", hasKey);
      statusDot.setAttribute("title", hasKey ? "API Key Configured" : "No API Key Configured");
    }

    if (statusBanner && statusText) {
      if (hasKey) {
        const masked = key.slice(0, 6) + "..." + key.slice(-4);
        statusBanner.className = "api-status-banner connected";
        statusText.innerHTML = `Active API Key configured: <code>${escapeHtml(masked)}</code>`;
      } else {
        statusBanner.className = "api-status-banner";
        statusText.textContent = "No personal API key configured. Provide a key to access live news dispatches.";
      }
    }
  }

  function openDialog() {
    if (!dialog) return;
    const currentKey = getEffectiveApiKey();
    if (keyInput) {
      keyInput.value = currentKey;
    }
    updateStatusDisplay();
    dialog.showModal();
  }

  function closeDialog() {
    if (!dialog) return;
    dialog.close();
  }

  if (openBtn) openBtn.addEventListener("click", openDialog);
  if (mobileOpenBtn) {
    mobileOpenBtn.addEventListener("click", () => {
      closeMobileMenu();
      openDialog();
    });
  }
  if (closeBtn) closeBtn.addEventListener("click", closeDialog);

  // Close when clicking dialog backdrop
  if (dialog) {
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeDialog();
      }
    });
  }

  // Toggle password visibility
  if (toggleVisibilityBtn && keyInput) {
    toggleVisibilityBtn.addEventListener("click", () => {
      const isPass = keyInput.type === "password";
      keyInput.type = isPass ? "text" : "password";
      toggleVisibilityBtn.setAttribute("aria-label", isPass ? "Hide API key" : "Show API key");
    });
  }

  // Save Key
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const newKey = keyInput ? keyInput.value.trim() : "";
      if (!newKey) {
        showToast("Please enter an API key or click Clear");
        return;
      }
      setCustomApiKey(newKey);
      updateStatusDisplay();
      showToast("API Key saved successfully");
      closeDialog();
      loadCategory(appState.currentCategory, true);
    });
  }

  // Test Key Connection
  if (testBtn) {
    testBtn.addEventListener("click", async () => {
      const candidateKey = keyInput ? keyInput.value.trim() : "";
      if (!candidateKey) {
        showToast("Enter a key to test");
        return;
      }
      testBtn.disabled = true;
      testBtn.textContent = "Testing...";
      try {
        const testUrl = `${NEWS_API_CONFIG.baseUrl}?apikey=${candidateKey}&country=us&language=en&category=top`;
        const res = await fetch(testUrl);
        const data = await res.json();
        if (res.ok && data.status === "success") {
          statusBanner.className = "api-status-banner connected";
          statusText.innerHTML = `<strong>Connected!</strong> API key valid (${data.totalResults || "dispatches"} available).`;
          showToast("Connection successful! Key is valid.");
        } else {
          statusBanner.className = "api-status-banner";
          const err = data.results?.message || data.message || "Invalid API key";
          statusText.innerHTML = `<span style="color:#ef4444;">Connection failed:</span> ${escapeHtml(err)}`;
          showToast("Test failed: " + err);
        }
      } catch (err) {
        statusBanner.className = "api-status-banner";
        statusText.innerHTML = `<span style="color:#ef4444;">Network error:</span> Unable to reach NewsData.io.`;
        showToast("Network test failed.");
      } finally {
        testBtn.disabled = false;
        testBtn.textContent = "Test Connection";
      }
    });
  }

  // Clear Key
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      setCustomApiKey("");
      if (keyInput) keyInput.value = "";
      updateStatusDisplay();
      showToast("Custom API key removed");
    });
  }

  // Initial status check
  updateStatusDisplay();
}

/**
 * Keyboard shortcuts ('/' to focus search, 'Escape' to blur/clear).
 */
function initKeyboardShortcuts() {
  document.addEventListener("keydown", function (e) {
    const searchInput = document.getElementById("search-input");
    if (!searchInput) return;

    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === "Escape" && document.activeElement === searchInput) {
      searchInput.blur();
    }
  });
}

/**
 * Closes mobile drawer if open.
 */
function closeMobileMenu() {
  const drawer = document.getElementById("mobile-drawer");
  const toggle = document.getElementById("mobile-menu-toggle");
  if (drawer) drawer.classList.remove("open");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}
