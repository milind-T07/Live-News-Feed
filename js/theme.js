/* ============================================
   THEME.JS — Dark/Light Mode Toggle & Mobile Menu
   ============================================ */
document.addEventListener("DOMContentLoaded", function () {
  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) {
    // Check local storage for theme
    const currentTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);
    toggleBtn.textContent = currentTheme === "light" ? "Dark" : "Light";

    toggleBtn.addEventListener("click", function () {
      const newTheme = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      toggleBtn.textContent = newTheme === "light" ? "Dark" : "Light";
    });
  }

  // Hamburger menu logic
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("nav-links");
  
  if (hamburger && navLinks) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("active");
    });
  }
});
