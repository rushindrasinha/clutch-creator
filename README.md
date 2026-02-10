# Clutch Creator

**Turn any webpage into a content idea. One click. Three insights.**

Clutch Creator is a Chrome extension that analyzes any webpage you're on and gives you three things:

1. **Content Angle** — A specific content idea you could create from this page
2. **Hook** — A ready to use opening line that stops the scroll
3. **Why It Works** — The psychology behind why this idea would resonate with an audience

Works on articles, tweets, YouTube videos, Reddit threads, product pages, landing pages — basically anything with text on the internet.

Powered by Claude (Anthropic). You bring your own API key. Each analysis costs a fraction of a cent.

---

## How It Works

1. **Navigate to any webpage** — article, tweet, YouTube video, Reddit thread, product page, anything
2. **Click the Clutch Creator icon** in your Chrome toolbar (top right) — the side panel opens
3. **Hit "Analyze This Page"** — Clutch Creator reads the page and sends it to Claude for analysis
4. **Get three instant insights** — Content Angle, Hook, and Why It Works appear in the side panel
5. **Copy what you need** — each card has a Copy button, paste straight into your content workflow

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
4. Click **Save and Get Started**

That's it. You're ready to analyze pages.

---

## What's in This Repo

```
clutch-creator/
├── extension/                  # The Chrome extension (load this folder)
│   ├── manifest.json           # Extension config (Manifest V3)
│   ├── background.js           # Brain of the extension (handles AI analysis)
│   ├── sidepanel.html          # Side panel UI
│   ├── sidepanel.js            # Side panel interactions
│   ├── content.js              # Floating button injection on every page
│   ├── content.css             # Floating button styles
│   └── icons/                  # Extension icons (16px, 48px, 128px)
├── clutch-creator-guide.pdf    # Visual setup guide (shareable)
├── LICENSE                     # MIT License
└── README.md
```

---

## Cost

Clutch Creator uses Claude Sonnet via the Anthropic API. Each page analysis costs approximately **$0.003 to $0.01** depending on page length. You could analyze hundreds of pages for under a dollar.

You pay Anthropic directly. No subscription, no middleman, no hidden fees.

---

## Privacy and Security

Your API key is stored locally in Chrome's storage on your device only. It is never sent anywhere except directly to Anthropic's API. No servers, no tracking, no telemetry.

Page content is sent directly to Anthropic's API for analysis and is not stored anywhere. No data passes through any third party server. The extension only reads page content when you explicitly click Analyze.

---

## FAQ

**How much does it cost to use?**
Each analysis costs a fraction of a cent through your Anthropic API key. You could analyze hundreds of pages for under $1. You only pay Anthropic directly for what you use.

**Does it work on every website?**
Yes. It reads the text content of any webpage. Works best on articles, tweets, videos with descriptions, product pages, and blog posts. Pages with very little text content will produce simpler results.

**Can I change my API key?**
Yes. Click "Change API Key" in the footer of the side panel to enter a new key at any time.

**It says "Invalid API key"?**
Make sure you copied the full key from console.anthropic.com. It should start with `sk-ant-api03` and be quite long. Also make sure your Anthropic account has billing set up.

**The floating button covers something on a page?**
The floating button in the bottom right is part of the content script. You can also access Clutch Creator by clicking the extension icon in Chrome's toolbar instead.

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
