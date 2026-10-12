# Live News Feed

A live news feed application that fetches and displays real-time news articles using the [NewsAPI](https://newsapi.org/). Built as part of the **OJT Capstone Project — Track A (Dev Agency)**.

## Features

- **NewsAPI Integration** — Fetches top headlines using `fetch()` and `async/await`
- **Category Filtering** — Browse news by General, Business, Technology, Sports, Health, Entertainment, and Science
- **Keyword Search** — Search for articles across all sources
- **Loading States** — Visual spinner while articles are being fetched
- **Error Handling** — User-friendly messages for API errors, network issues, and rate limits
- **Empty State** — Clear messaging when no articles match the query
- **Responsive Design** — Mobile-first card layout that adapts to all screen sizes

## Tech Stack

- HTML5 (semantic markup)
- CSS3 (custom properties, grid, flexbox)
- JavaScript ES6+ (async/await, fetch API, DOM manipulation)
- [NewsAPI](https://newsapi.org/) — RESTful news data

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/sauryamanbisen-art/live-news-feed.git
   cd live-news-feed
   ```

2. Create your API configuration:
   ```bash
   cp config.example.js js/config.js
   ```

3. Edit `js/config.js` and replace `YOUR_API_KEY_HERE` with your actual NewsAPI key.
   Get a free key at [newsapi.org](https://newsapi.org/).

4. Open `index.html` in your browser (must be on localhost for the free API tier).

> **Note:** The free NewsAPI tier only works on `localhost`. It will not work on deployed/hosted sites.

## Project Structure

```
live-news-feed/
├── index.html              # Main HTML structure
├── config.example.js       # API config template (copy to js/config.js)
├── css/
│   └── style.css           # All styles including responsive
├── js/
│   ├── config.js           # API key config (gitignored)
│   ├── api.js              # NewsAPI fetch functions
│   ├── ui.js               # DOM rendering (cards, loading, errors)
│   └── main.js             # App initialization and event handlers
├── .gitignore
└── README.md
```

## Architecture

| File | Responsibility |
|---|---|
| `config.js` | API key and endpoint configuration |
| `api.js` | `fetchTopHeadlines()`, `searchNews()`, `makeApiRequest()` with error handling |
| `ui.js` | `renderArticles()`, `showLoading()`, `showNewsError()`, `setActiveCategory()` |
| `main.js` | DOMContentLoaded init, search form handler, category filter handler |

## Error Handling Strategy

The application handles errors at multiple levels:

1. **API Key Validation** — Checks if the key is configured before making requests
2. **HTTP Status Codes** — Specific messages for 401 (invalid key) and 429 (rate limit)
3. **API Response Errors** — Handles non-"ok" status from NewsAPI
4. **Network Errors** — Catches fetch failures (no internet, server down)
5. **Empty Results** — Shows user-friendly message when no articles match

## Responsive Design

- **Desktop (>768px)** — Multi-column grid layout with `auto-fill, minmax(300px, 1fr)`
- **Tablet (≤768px)** — Single column layout, stacked search form
- **Mobile (≤480px)** — Centered category filters, optimized touch targets

## Author

Sauryaman Bisen  

## License

This project is licensed under the MIT License.

