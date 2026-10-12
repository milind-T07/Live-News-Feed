/* ============================================
   THEME.JS — Dark-First Theme Controller & Mobile Navigation
   ============================================ */

document.addEventListener("DOMContentLoaded", function () {
  initThemeToggle();
  initMobileMenu();
});

/**
 * Initializes theme controller with dark-first default.
 */
function initThemeToggle() {
  const toggleBtn = document.getElementById("theme-toggle");
  
  // Dark-first default
  const savedTheme = localStorage.getItem("dev_agency_theme") || "dark";
  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("dev_agency_theme", next);
    });
  }
}

/**
 * Applies theme to DOM and updates toggle button state.
 */
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  const toggleBtn = document.getElementById("theme-toggle");
  if (!toggleBtn) return;

  const isDark = theme === "dark";
  toggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  toggleBtn.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");

  // Render sun / moon icon
  toggleBtn.innerHTML = isDark
    ? `
      <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <span class="theme-label">Light</span>
    `
    : `
      <svg class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
      <span class="theme-label">Dark</span>
    `;
}

/**
 * Handles mobile hamburger toggle and drawer interactions.
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-toggle");
  const drawer = document.getElementById("mobile-drawer");

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    const isOpen = drawer.classList.contains("open");
    if (isOpen) {
      drawer.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    } else {
      drawer.classList.add("open");
      toggleBtn.setAttribute("aria-expanded", "true");
    }
  });

  // Close when clicking outside drawer
  document.addEventListener("click", function (e) {
    if (drawer.classList.contains("open") && !drawer.contains(e.target) && !toggleBtn.contains(e.target)) {
      drawer.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });

  // Close on window resize to desktop
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860 && drawer.classList.contains("open")) {
      drawer.classList.remove("open");
      toggleBtn.setAttribute("aria-expanded", "false");
    }
  });
}
