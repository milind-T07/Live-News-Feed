# Dev Agency Dispatch — Live News Feed

A premium, production-grade digital editorial news discovery platform engineered with modern web standards, resilient API caching, zero-config preview fallback, PWA offline capabilities, and dark-first aesthetics. Part of the **Dev Agency Engineering Suite**.

[![License: MIT](https://img.shields.io/badge/License-MIT-violet.svg)](LICENSE)
[![Validate & Lint](https://github.com/milind-T07/Live-News-Feed/actions/workflows/validate.yml/badge.svg)](https://github.com/milind-T07/Live-News-Feed/actions/workflows/validate.yml)

---

## 🌟 Highlights & Key Features

### 1. Digital Editorial Experience
- **Dark-First Visual Architecture**: Obsidian navy palettes (`#07090e`), electric-violet primary accents (`#8b5cf6`), and subtle cyan highlights (`#38bdf8`).
- **Typography & Hierarchy**: Powered by Google's *Plus Jakarta Sans* and *Inter* for crisp editorial readability.
- **Dynamic Reading Progress Bar**: Real-time reading depth indicator across the top of the viewport tracking your scroll position.
- **Two-Column Editorial Showcase**:
  - **Featured Lead Story**: Cinematic 16:9 lead presentation, source attribution, relative timestamp, read-time estimate, quick reader, and share action.
  - **Top Headlines Column**: Compact live stream of priority dispatches with thumbnails, quick view, and timestamps.
- **Responsive Stories Grid**: 3-column desktop layout, 2-column tablet view, and single-column mobile view with line-clamped headlines and summaries.
- **In-App Quick Reader Modal**: Preview full article content and lead excerpt within an editorial modal without navigating away from your feed.

### 2. Search & Discovery
- **Keyword & Topic Search**: Search across millions of global articles with instantaneous query response.
- **Recent Search History**: Remembers your recent searches as interactive chips with 1-click re-query and clear action.
- **Regional Edition Selector**: Switch between US, UK, India, Canada, and Australia editions on the fly.
- **Keyboard Shortcuts**:
  - Press `/` anywhere to instantly focus the search bar.
  - Press `Escape` to close any open modal or clear search focus.
- **Trending Topics Strip**: Live, clickable topic pills (AI, Global Markets, Climate, Cybersecurity, Space, etc.) that immediately launch targeted queries.
- **Dynamic Category Filter**: Scrollable category pill bar supporting Top Stories, Technology, Business, World, Science, Health, Sports, and Entertainment.

### 3. Sharing & Social Integration
- **Web Share API**: Seamless native OS share sheet on supported mobile and desktop browsers.
- **Interactive Share Dialog**: Rich fallback modal offering 1-click clipboard link copying, and direct sharing to X (Twitter), LinkedIn, WhatsApp, and Reddit.

### 4. Data Resilience & Zero-Config Architecture
- **In-App API Key Configuration**: Configure your NewsData.io API key directly through the UI modal with live validation status dots—no file editing required.
- **Curated Zero-Config Preview Mode**: Instant out-of-the-box demonstration dataset featuring rich multi-category editorial stories, HD imagery, and category tags when no API key is supplied or quotas are reached.
- **Normalized Data Pipeline**: Accurately maps publisher, title, description, article links, publication timestamps, and source icons.
- **Zero Broken Images**: Integrated SVG editorial gradient fallbacks with category watermarks for articles missing media.
- **Accurate Relative Timestamps**: Converts publication dates into clean relative times (`2h ago`, `Yesterday`, `Oct 11`).
- **Deduplication Engine**: Automatically detects and filters duplicate stories across sources.
- **In-Memory & Session Storage Caching**: 10-minute cache TTL prevents rate-limit depletion when navigating between categories.
- **Skeleton Shimmer Loaders**: Layout-matched CSS shimmer placeholders eliminating Cumulative Layout Shift (CLS).

### 5. Bookmarks & Data Portability
- **Persistent Bookmarks**: Save stories to `localStorage` with a single tap.
- **Bookmarks Management Toolbar**:
  - **JSON Export**: Backup your saved stories library with one click.
  - **JSON Import**: Restore or merge saved bookmarks from any JSON export file.
  - **Bulk Clear**: Wipe your saved reading list cleanly when desired.

### 6. PWA Offline Capabilities & Performance
- **Progressive Web App**: Complete with `manifest.webmanifest` and service worker (`sw.js`) caching core UI assets for fast, offline-resilient access.
- **Dark/Light Mode**: Smooth contrast toggle with user preference persistence.
- **Fluid Navigation**: Responsive mobile navigation drawer with touch-friendly targets.
- **Accessibility**: Visible focus rings (`:focus-visible`), WCAG-compliant color contrast, and strict `prefers-reduced-motion` compliance.

---

## 📂 Project Structure

```text
Live-News-Feed/
├── .github/
│   └── workflows/
│       └── validate.yml    # CI automated syntax & integrity validation
├── index.html              # Semantic HTML5 layout, modals & SEO meta tags
├── manifest.webmanifest    # Progressive Web App manifest
├── sw.js                   # Service worker for offline asset caching
├── config.example.js       # Configuration template
├── favicon.svg             # Branded vector favicon
├── css/
│   └── style.css           # Complete design system, dialogs & responsive styling
├── js/
│   ├── config.js           # API configuration (gitignored, optional)
│   ├── mock-data.js        # Curated editorial fallback dataset
│   ├── api.js              # Resilient API service, normalization & caching
│   ├── ui.js               # DOM rendering, dialogs, relative time & fallbacks
│   ├── main.js             # Application controller, search, bookmarks & PWA
│   └── theme.js            # Dark/Light theme controller & mobile drawer
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start

### Option A: Zero-Config Instant Preview (No Setup Required)
Open `index.html` directly in your browser or run:
```bash
npx serve .
```
The application will automatically initialize in **Curated Editorial Preview Mode**, letting you test all search, filtering, bookmarking, and reader capabilities immediately.

### Option B: Connect Live NewsData.io Feed
1. Obtain a free API key from [NewsData.io](https://newsdata.io/).
2. Open the application and click the **API Key** button in the top navigation bar, paste your key, and click **Save Key**.
3. *Alternatively*, create `js/config.js` from the example template:
   ```bash
   cp config.example.js js/config.js
   ```
   Add your API key inside `js/config.js`.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` | Focus search bar immediately |
| `Escape` | Dismiss active dialog / clear search focus |

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
