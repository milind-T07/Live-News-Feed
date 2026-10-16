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
 * Sets up Search form, clear button, and input handlers.
 */
function initSearch() {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const searchClearBtn = document.getElementById("search-clear-btn");

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
 * Sets up Sorting dropdown and Refresh button.
 */
function initSortControl() {
  const sortSelect = document.getElementById("sort-select");
  const refreshBtn = document.getElementById("refresh-btn");

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      appState.currentSort = sortSelect.value;
      appState.articles = applySort(appState.articles, appState.currentSort);

      renderEditorialLayout(appState.articles, {
        isSearch: Boolean(appState.currentQuery),
        query: appState.currentQuery,
        category: appState.currentCategory,
        view: appState.activeView
      });
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
  });
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
