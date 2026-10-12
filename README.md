# Dev Agency Dispatch — Live News Feed

A premium, production-grade digital editorial news discovery platform engineered with modern web standards, resilient API caching, and dark-first aesthetics. Part of the **Dev Agency Engineering Suite**.

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)

---

## 🌟 Highlights & Key Features

### 1. Digital Editorial Experience
- **Dark-First Visual Architecture**: Obsidian navy palettes (`#07090e`), electric-violet primary accents (`#8b5cf6`), and subtle cyan highlights (`#38bdf8`).
- **Typography & Hierarchy**: Powered by Google's *Plus Jakarta Sans* and *Inter* for crisp editorial readability.
- **Two-Column Editorial Showcase**:
  - **Featured Lead Story**: Large 16:9 cinematic lead image, source attribution, relative timestamp, read-time estimate, and direct read action.
  - **Top Headlines Column**: Compact live stream of priority dispatches with thumbnails and timestamps.
- **Responsive Stories Grid**: 3-column desktop layout, 2-column tablet view, and single-column mobile view with line-clamped headlines and summaries.

### 2. Search & Discovery
- **Keyword & Topic Search**: Search across millions of articles with instantaneous query response.
- **Keyboard Shortcuts**: Press `/` anywhere to instantly focus the search bar; press `Escape` to clear.
- **Trending Topics Strip**: Live, clickable topic pills (AI, Global Markets, Climate, Cybersecurity, Space, etc.) that immediately launch targeted queries.
- **Dynamic Category Filter**: Scrollable category pill bar supporting Top Stories, Technology, Business, World, Science, Health, Sports, and Entertainment.

### 3. Data Integrity & Problem Solutions
- **Normalized Data Pipeline**: Accurately maps publisher, title, description, article links, publication timestamps, and source icons from NewsData.io.
- **Zero Broken Images**: Integrated SVG editorial gradient fallbacks with category watermarks for articles without images or with broken URLs.
- **Accurate Relative Timestamps**: Converts publication dates into clean relative times (`2h ago`, `Yesterday`, `Oct 11`).
- **Deduplication Engine**: Automatically detects and filters duplicate stories across sources.
- **In-Memory & Session Storage Caching**: 10-minute cache TTL prevents rate-limit depletion when navigating between categories.
- **Skeleton Shimmer Loaders**: Layout-matched CSS shimmer placeholders eliminating Cumulative Layout Shift (CLS).

### 4. Bookmarks (Saved Articles)
- **Persistent Bookmarks**: Save stories to `localStorage` with a single tap.
- **Live Counter & View**: Navbar badge tracks saved articles count; dedicated Bookmarks view displays all saved stories even offline.

### 5. Accessibility & Mobile Optimization
- Dark/Light mode toggle with persistence.
- Fluid responsive mobile navigation drawer.
- Visible focus rings (`:focus-visible`) and WCAG-compliant color contrast.
- Strict `prefers-reduced-motion` compliance.

---

## 📂 Project Structure

```text
live-news-feed/
├── index.html              # Semantic HTML5 layout & SEO meta tags
├── config.example.js       # Configuration template
├── favicon.svg             # Branded vector favicon
├── css/
│   └── style.css           # Complete design system & responsive styling
├── js/
│   ├── config.js           # API configuration (gitignored)
│   ├── api.js              # Resilient API service, normalization & caching
│   ├── ui.js               # DOM rendering, skeletons, relative time & fallbacks
│   ├── main.js             # Application controller, search, bookmarks & sorting
│   └── theme.js            # Dark/Light theme controller & mobile drawer
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/milind-T07/Live-News-Feed.git
   cd Live-News-Feed
   ```

2. **Configure your API Key:**
   ```bash
   cp config.example.js js/config.js
   ```
   Edit `js/config.js` with your [NewsData.io](https://newsdata.io/) API key.

3. **Launch the application:**
   Open `index.html` directly in your browser or run a lightweight local server:
   ```bash
   npx serve .
   ```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
