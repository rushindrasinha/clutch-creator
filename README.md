# Clutch Creator

**Turn any webpage into a content idea. One click. Three insights.**

Clutch Creator is a Chrome extension that analyzes any webpage you're on and gives you three things:

1. **Content Angle** — A specific content idea you could create from this page
2. **Hook** — A ready to use opening line that stops the scroll
3. **Why It Works** — The psychology behind why this idea would resonate with an audience

Works on articles, tweets, YouTube videos, Reddit threads, product pages, landing pages — basically anything with text on the internet.

Powered by Claude (Anthropic). You bring your own API key. Each analysis costs a fraction of a cent.

**Current version: 1.1.0** (February 2026)

---

## Features

### Core
- **One-click analysis** — hit Analyze This Page and get three structured insights
- **Works on any webpage** — articles, tweets, product pages, Reddit threads, YouTube descriptions
- **Copy individual insights** — each card has its own Copy button
- **Copy All Insights** — one button to copy all three insights as a formatted block

### Smart Content Extraction
- Intelligent page reading with 16 semantic HTML selectors (article, main, .post-content, etc.)
- Sentence-boundary truncation at 6,000 characters (with UI indicator when content is trimmed)
- Minimum content guard — skips the API call and tells you when a page has too little text
- Restricted page detection — graceful handling of chrome://, about:blank, and extension pages

### Analysis History
- Every analysis is saved locally (last 50 results)
- History panel accessible from the header clock icon
- Click any past analysis to restore it instantly
- Relative timestamps (just now, 5m ago, 2h ago, 3d ago)

### Floating Action Button (FAB)
- Appears on every page for quick access to the side panel
- **Draggable** — move it anywhere, position is remembered across pages
- **Per-site hide** — hover to reveal "Hide on this site", stored per domain
- **Shadow DOM isolated** — won't be affected by or interfere with any website's styles

### UI / UX
- **Light and dark theme** — toggle in the header, auto-detects system preference
- **Keyboard shortcut** — `Alt+Shift+C` to trigger analysis
- **Two-phase loading** — "Extracting page content..." then "Generating insights..."
- **New page detection** — banner appears when you navigate to a new page with results still showing
- **API key validation** — verifies your key with Anthropic before saving
- **Show/hide key toggle** — eye icon to reveal or mask your API key during entry
- **Specific error messages** — friendly messages for invalid keys, rate limits, timeouts, network errors, and more
- **Truncation badge** — shows when page content was trimmed before analysis
- **URL tooltip** — hover the truncated URL to see the full path

### Privacy & Security
- API key stored locally only (Chrome storage, never sent anywhere except Anthropic)
- No servers, no tracking, no telemetry, no analytics
- Direct browser-to-API communication
- Zero external dependencies

---

## How It Works

1. **Navigate to any webpage** — article, tweet, YouTube video, Reddit thread, product page, anything
2. **Click the Clutch Creator icon** in your Chrome toolbar, the floating button, or press `Alt+Shift+C`
3. **Hit "Analyze This Page"** — Clutch Creator reads the page and sends it to Claude for analysis
4. **Get three instant insights** — Content Angle, Hook, and Why It Works appear in the side panel
5. **Copy what you need** — use individual Copy buttons or Copy All Insights

---

## Example Output

> **Content Angle**
> Short form reel breaking down how this startup raised $2M by building a Chrome extension. Frame: "The $2M Chrome Extension."

> **Hook**
> "This Chrome extension made $2M and it only has 5 files."

> **Why It Works**
> The contrast between simplicity (5 files) and outcome ($2M) creates a curiosity gap that makes people want to learn how.

---

## What You Need

| Requirement | Details |
|---|---|
| **Google Chrome** | Or any Chromium browser (Edge, Brave, Arc, Opera) |
| **Anthropic API Key** | Free to create, pay per use (fractions of a cent per analysis) |
| **2 Minutes** | That's all the setup takes |

---

## Installation

### Step 1: Download

Clone this repo or download the ZIP:

```
git clone https://github.com/rushindrasinha/clutch-creator.git
```

### Step 2: Load into Chrome

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `extension` folder from this repo

### Step 3: Get Your API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/settings/keys) and sign up or log in
2. Navigate to Settings > API Keys
3. Click **Create Key** and give it a name (e.g. "Clutch Creator")
4. **Copy the key immediately** — you will not be able to see it again after closing the dialog
5. The key starts with `sk-ant-api03-...`

### Step 4: Activate the Extension

1. Click the Clutch Creator icon in your Chrome toolbar
2. The side panel opens with a welcome screen
3. Paste your Anthropic API key
4. The key is validated with Anthropic in real time
5. Click **Save and Get Started**

That's it. You're ready to analyze pages.

---

## What's in This Repo

```
clutch-creator/
├── extension/                  # The Chrome extension (load this folder)
│   ├── manifest.json           # Extension config (Manifest V3)
│   ├── background.js           # Service worker — page extraction, API calls, validation
│   ├── sidepanel.html          # Side panel UI (light/dark theme, history, all states)
│   ├── sidepanel.js            # Side panel logic — analysis, history, theme, copy
│   ├── content.js              # FAB with Shadow DOM, drag, per-site hide
│   ├── content.css             # Minimal host styles (FAB styles in Shadow DOM)
│   └── icons/                  # Extension icons (16px, 48px, 128px)
├── CHANGELOG.md                # Version history
├── clutch-creator-guide.pdf    # Visual setup guide (shareable)
├── LICENSE                     # MIT License
└── README.md
```

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Alt+Shift+C` | Analyze current page |

You can customize this in Chrome at `chrome://extensions/shortcuts`.

---

## Cost

Clutch Creator uses Claude Sonnet via the Anthropic API. Each page analysis costs approximately **$0.003 to $0.01** depending on page length. You could analyze hundreds of pages for under a dollar.

You pay Anthropic directly. No subscription, no middleman, no hidden fees.

---

## Privacy and Security

Your API key is stored locally in Chrome's storage on your device only. It is never sent anywhere except directly to Anthropic's API. No servers, no tracking, no telemetry.

Page content is sent directly to Anthropic's API for analysis and is not stored anywhere. No data passes through any third party server. The extension only reads page content when you explicitly click Analyze.

Analysis history is stored locally on your device and never leaves your browser.

---

## FAQ

**How much does it cost to use?**
Each analysis costs a fraction of a cent through your Anthropic API key. You could analyze hundreds of pages for under $1. You only pay Anthropic directly for what you use.

**Does it work on every website?**
It works on any standard webpage with text content. It gracefully handles restricted pages (chrome:// URLs, the Chrome Web Store, etc.) by showing a clear message. Pages with very little text will be detected and skipped to save your API credits.

**Can I change my API key?**
Yes. Click "Change API Key" in the footer of the side panel to enter a new key at any time.

**It says "Invalid API key"?**
Your key is now validated in real time when you save it. Make sure you copied the full key from console.anthropic.com (starts with `sk-ant-api03`) and that your Anthropic account has billing set up.

**The floating button covers something on a page?**
You can drag it anywhere on the screen — your position is remembered. You can also hover over it and click "Hide on this site" to dismiss it for that domain permanently. You can always use the toolbar icon or `Alt+Shift+C` instead.

**Can I see my past analyses?**
Yes. Click the clock icon in the header to open the history panel. Your last 50 analyses are stored locally.

**Is there a dark/light mode?**
Yes. Click the sun/moon icon in the header to toggle. It also auto-detects your system preference on first use.

---

## Browser Support

Works on any Chromium based browser:

| Browser | Supported |
|---|---|
| Google Chrome | Yes |
| Microsoft Edge | Yes |
| Brave | Yes |
| Arc | Yes |
| Opera | Yes |

---

## Built With

| Technology | Purpose |
|---|---|
| Chrome Extension Manifest V3 | Extension framework |
| Anthropic Claude API (Sonnet) | AI analysis engine |
| Vanilla JavaScript | No frameworks, no build step, no dependencies |

---

## The Story

I saw a tweet selling a Chrome extension builder for a monthly subscription. Instead of buying it, I asked Claude to build the extension for me directly. It did. In one conversation. For free.

This is the result. [Read the full story on X.](https://x.com/irushi)

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

## Author

**Dr Rushindra Sinha** — [@irushi](https://x.com/irushi)

Founder, [Global Esports](https://globalesports.gg) | Building [ClutchPass](https://clutchpass.gg)
