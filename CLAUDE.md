# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Weatherscan Local XL is a web-based recreation of "Weatherscan Local" from The Weather Channel. It's a full-stack application with a Node.js/Express backend and HTML/CSS/JavaScript frontend that displays weather data in a broadcast-style slide presentation.

Best used with mainland United States locations. Optimized for Google Chrome. Online demo: `local.weatherscan.net`

## Commands

```bash
npm install    # Install dependencies (run from project root)
npm start      # Start Express server on port 8080
```

The application runs at `http://localhost:8080` after starting.

## Architecture

### Backend (`app.js`)
- Express server on port 8080, binds to `0.0.0.0`
- Serves static files from `webroot/`
- `GET /airports` — proxies FAA airport delay data from `nasstatus.faa.gov` (CORS workaround)
- `GET /sports` — proxies ESPN scoreboard API for NFL, NBA, MLB, NHL, EPL; filters to today's games by ET date

### Frontend (`webroot/`)

**Script load order matters** (defined in `index.html`):
1. `js/config.js` — global variables and package definitions
2. `js/extras.js` — utility functions (shuffle, formatMinutes, differenceUTC)
3. `js/location.js` — `locationSettings` / `locationConfig` objects + `locationJS()`
4. `js/settingspanel.js` — setup wizard UI
5. `js/radar.js` — radar map init
6. `js/slides.js` — `slidePrograms` object + `showSlides()` engine
7. `js/map.js` — map utility helpers
8. `js/crawl.js` — alert/ad crawl
9. `js/main.js` — window scaling on resize
10. `js/data.js` — `weatherData` object (empty schema)
11. `js/audio.js` — `AudioManager` class

### Startup Sequence
1. Page loads; if `apperanceSettings.skipSettings == false`, the settings panel wizard runs first
2. `locationJS()` fires, resolving all locations via weather.com API calls into `locationConfig`
3. After `apperanceSettings.startupTime` ms, the startup screen fades and `showSlides()` begins iterating through packages

### Slide Engine (`js/slides.js`)
- `slidePrograms` — object where each key is a slide function name (e.g. `"currentConditions"`) and value is the render function
- `showSlides()` — reads `slideSettings.order` array, iterates through packages/slides sequentially using `idx` counter
- Each slide function calls `slideCallBack()` when done, which increments `idx` and calls `showSlides()` again
- `slideLength` (default 10000ms) is the base unit; some slides use `slideLength * 2`
- `slideDivs` maps function names to their CSS selector strings — note: `extraDayDesc` and `extraExtendedForecast` entries are missing the leading `.` (existing quirk in the source)

### Slide Package Configuration (`js/config.js`)
Slide packages are arrays of `{function: "slideFunctionName"}` objects grouped under a `group` name. The `slideSettings.order` array controls which packages play and in what order. Defined packages:
- `introPackage`, `forecastPackage`, `extraLocalPackage`, `miniCorePackage`
- `spanishForecastPackage`, `golfPackage`, `healthPackage`, `airportPackage`
- `mainPackage`, `airportOnlyPackage`, `nearbyCitiesPackage` — custom interleaved variants

### Location Resolution (`js/location.js`)
`locationSettings` (user config) → `locationGrab()` → weather.com API → populates `locationConfig` (runtime resolved data).

For each sub-location category (extraCity, eightCities, airport, golf), there are `auto*` variants (geocode-based discovery) and `manual*` variants (explicit config). The `autoFind` flag in `locationSettings` selects which path runs.

URL query string (`?CityName`) triggers search-based auto-location as a fallback.

### Key Global Objects
| Object | File | Purpose |
|--------|------|---------|
| `weatherData` | `data.js` | Central store for all fetched weather (empty schema, populated at runtime) |
| `locationSettings` | `location.js` | User-configured location inputs |
| `locationConfig` | `location.js` | Runtime-resolved coordinates/names after API calls |
| `apperanceSettings` | `config.js` | UI settings — note the typo `apperance` is intentional in source |
| `slideSettings` | `config.js` | Active slide order/packages |
| `audioSettings` | `config.js` | Music shuffle/playback config |

### Required API Keys

Configure in `webroot/js/config.js` (lines 1–2):
- `api_key` — weather.com API key
- `map_key` — mapbox.com API key

### weatherscanPOP/
A secondary variant of the project (separate `app.js` + `webroot/`) with its own `package.json`. Runs independently on port 8080 — cannot run simultaneously with the main project. Shares the same architecture but is a distinct build.

### Dependencies Note
`node-fetch` is pinned to v2 (`"node-fetch": "^2.7.0"`) — v3 uses ESM and will break `require()` in `app.js`. If airport data fails, run `npm i node-fetch@2` from the project root.

### Electron Wrapper (`electron-wrapper/`)
Optional desktop wrapper. Loads `http://localhost:8080` in a frameless 1920×1080 always-on-top window. Start the Express server first, then from `electron-wrapper/`:
```bash
npm install
npm start  # electron .
```

## Development TODO

### New Modules to Develop
- **Split Airport Slides**: Create separate `airportConditionsOne` and `airportConditionsTwo` functions in `slides.js` to allow displaying airport 1 and airport 2 independently in the slide rotation
- **Individual Nearby City Slide**: Create a function to show one nearby city at a time instead of 4 at once, allowing more granular control over the slide order
- **Custom Slide Interleaving**: Build a more flexible system to interleave individual slides from different packages (e.g., Main -> Airport1 -> Extra -> Health -> Airport2 -> NearbyCity1)
