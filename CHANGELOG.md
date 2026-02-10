# Changelog

All notable changes to Clutch Creator will be documented in this file.

## [1.1.0] - 2026-02-10

### Critical Fixes
- **Fixed**: Floating action button now actually opens the side panel (was sending a message that was never handled)
- **Fixed**: JSON response parsing uses balanced-brace extraction instead of greedy regex, plus markdown fence stripping
- **Fixed**: API key is validated with a real probe call to Anthropic before being saved (previously only checked the prefix)

### New Features
- **Analysis history** — last 50 analyses stored locally with relative timestamps, accessible from the header clock icon
- **Copy All Insights** — single button to copy all three insights as a formatted block
- **Light/dark theme** — toggle in the header, auto-detects system `prefers-color-scheme` on first use
- **Keyboard shortcut** — `Alt+Shift+C` to trigger analysis (customizable in Chrome settings)
- **New page detection** — banner appears when you navigate away from the analyzed page, click to re-analyze
- **Draggable FAB** — floating button can be dragged anywhere on screen, position persisted across pages
- **Per-site FAB hide** — hover the FAB to reveal "Hide on this site", stores excluded domains

### Improvements
- **Restricted page handling** — graceful error for chrome://, about:blank, Chrome Web Store, and extension pages
- **Auto-retry on rate limits** — retries once after 4 seconds on HTTP 429
- **Expanded content extraction** — 16 semantic selectors (up from 6), covering more site layouts
- **Minimum content guard** — skips the API call and shows a message when a page has less than 80 characters of text
- **Smart truncation** — content limit raised to 6,000 characters with sentence-boundary truncation and a "Truncated" badge in the UI
- **Specific error messages** — distinct messages for invalid key (401), rate limited (429), timeout, network error, server error (500+), script injection failure, and restricted pages
- **Two-phase loading** — loading text updates from "Extracting page content..." to "Generating insights..."
- **API key show/hide toggle** — eye icon next to the input field
- **Key save feedback** — checkmark animation confirms the key was verified and saved
- **Copy button flash** — green highlight on copy confirmation instead of just text change
- **URL tooltip** — hover truncated URL to see the full path
- **Analyze button hidden in setup** — no longer shows before an API key is saved
- **Sticky footer** — replaced fixed positioning to prevent overlap with content on short panels
- **Shadow DOM isolation** — FAB is rendered inside a closed Shadow DOM so host page styles can't affect it
- **30-second fetch timeout** — API calls abort after 30s with a clear timeout message
- **Service worker initialization** — `onInstalled` handler initializes storage on first install

### Technical Changes
- Added `tabs` permission for new-page detection polling
- Added `commands` section to manifest for keyboard shortcut
- Version bumped to 1.1.0
- `content.css` reduced to minimal host styles (FAB styles moved into Shadow DOM)
- Full CSS variable system for theming (`--bg`, `--text-primary`, `--border`, etc.)

## [1.0.0] - 2025

### Initial Release
- Chrome Extension (Manifest V3) with side panel UI
- One-click page analysis powered by Claude Sonnet
- Three insights: Content Angle, Hook, Why It Works
- Copy-to-clipboard per insight
- Floating action button on all pages
- API key stored locally in Chrome storage
- Dark theme UI
- Works on any Chromium-based browser
