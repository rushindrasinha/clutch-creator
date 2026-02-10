const RESTRICTED_PATTERNS = [
  /^chrome:\/\//,
  /^chrome-extension:\/\//,
  /^about:/,
  /^edge:\/\//,
  /^brave:\/\//,
  /^devtools:\/\//,
  /^chrome-search:\/\//,
  /^https:\/\/chrome\.google\.com\/webstore/,
  /^https:\/\/chromewebstore\.google\.com/,
];

const API_TIMEOUT_MS = 30000;
const MAX_CONTENT_LENGTH = 6000;
const MIN_CONTENT_LENGTH = 80;

function isRestrictedUrl(url) {
  if (!url) return true;
  return RESTRICTED_PATTERNS.some((p) => p.test(url));
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.storage.local.set({ clutchHistory: [], fabHiddenDomains: [] });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDE_PANEL") {
    if (sender.tab) {
      chrome.sidePanel.open({ tabId: sender.tab.id });
    }
    return false;
  }

  if (message.type === "GET_PAGE_CONTENT") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ error: "NO_ACTIVE_TAB" });
        return;
      }

      if (isRestrictedUrl(tabs[0].url)) {
        sendResponse({ error: "RESTRICTED_PAGE" });
        return;
      }

      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: extractPageContent,
        });
        const content = results[0].result;

        if (content.text.length < MIN_CONTENT_LENGTH) {
          sendResponse({ error: "INSUFFICIENT_CONTENT" });
          return;
        }

        sendResponse({
          content,
          url: tabs[0].url,
          title: tabs[0].title,
        });
      } catch (err) {
        sendResponse({ error: "SCRIPT_INJECTION_FAILED", detail: err.message });
      }
    });
    return true;
  }

  if (message.type === "ANALYZE_PAGE") {
    analyzeWithRetry(message.data)
      .then((result) => sendResponse({ result }))
      .catch((err) => sendResponse({ error: err.message, errorCode: err.code }));
    return true;
  }

  if (message.type === "VALIDATE_API_KEY") {
    validateApiKey(message.apiKey)
      .then((valid) => sendResponse({ valid }))
      .catch((err) => sendResponse({ valid: false, error: err.message }));
    return true;
  }
});

function extractPageContent() {
  const selectors = [
    "article",
    "main",
    '[role="main"]',
    '[role="article"]',
    ".post-content",
    ".article-body",
    ".entry-content",
    ".post-body",
    ".story-body",
    ".article-content",
    "#content",
    "#main",
    "#main-content",
    ".content",
    ".post",
    ".blog-post",
  ];

  let content = "";

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim().length > 100) {
      content = el.innerText.trim();
      break;
    }
  }

  if (!content) {
    content = document.body.innerText.trim();
  }

  const metaDesc =
    document.querySelector('meta[name="description"]')?.content || "";
  const ogDesc =
    document.querySelector('meta[property="og:description"]')?.content || "";

  let truncated = false;
  if (content.length > 6000) {
    const cutoff = content.lastIndexOf(".", 6000);
    if (cutoff > 4000) {
      content = content.substring(0, cutoff + 1);
    } else {
      content = content.substring(0, 6000);
    }
    truncated = true;
  }

  return {
    text: content,
    truncated,
    metaDescription: metaDesc || ogDesc,
    h1: document.querySelector("h1")?.innerText || "",
    domain: window.location.hostname,
  };
}

async function validateApiKey(apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1,
        messages: [{ role: "user", content: "hi" }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response.ok || response.status === 400;
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("TIMEOUT");
    }
    throw new Error("NETWORK_ERROR");
  }
}

async function analyzeWithRetry(data, attempt = 0) {
  try {
    return await analyzePage(data);
  } catch (err) {
    if (err.code === "RATE_LIMITED" && attempt < 1) {
      await new Promise((r) => setTimeout(r, 4000));
      return analyzeWithRetry(data, attempt + 1);
    }
    throw err;
  }
}

async function analyzePage(data) {
  const { apiKey, content, url, title } = data;

  const systemPrompt = `You are Clutch Creator, a creator's content intelligence tool. You analyze webpages and extract content opportunities.

You always respond in valid JSON with exactly three fields:
{
  "content_angle": "A specific content idea the creator could make from this page. Be concrete: what format (reel, thread, video, post), what the piece is about, and what makes it unique. One idea, not five. Make it actionable.",
  "hook": "A punchy, scroll-stopping opening line for that content piece. Write it ready to use. No generic filler. This should be the first sentence someone reads or the first 3 seconds of a video.",
  "why_it_works": "One sentence explaining the psychological tension, curiosity gap, or audience desire that makes this idea compelling. The 'why people would care' layer."
}

Rules:
- Be specific to the actual page content, never generic
- Write like a creator, not a consultant
- The hook should be conversational and punchy, not clickbait
- If the page has very little content, do your best with what you have
- Always return valid JSON, nothing else`;

  const userPrompt = `Analyze this webpage for content opportunities.

URL: ${url}
Title: ${title}
Domain: ${content.domain}
Page Headline: ${content.h1}
Meta Description: ${content.metaDescription}

Page Content:
${content.text}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      const e = new Error("Request timed out. Try again.");
      e.code = "TIMEOUT";
      throw e;
    }
    const e = new Error("Network error. Check your internet connection.");
    e.code = "NETWORK_ERROR";
    throw e;
  }
  clearTimeout(timeout);

  if (!response.ok) {
    const status = response.status;
    if (status === 401) {
      const e = new Error("Invalid API key. Please update your key and try again.");
      e.code = "INVALID_KEY";
      throw e;
    }
    if (status === 429) {
      const e = new Error("Rate limited. Retrying shortly...");
      e.code = "RATE_LIMITED";
      throw e;
    }
    if (status === 400) {
      const e = new Error("Bad request. The page content may be malformed.");
      e.code = "BAD_REQUEST";
      throw e;
    }
    if (status >= 500) {
      const e = new Error("Anthropic API is temporarily unavailable. Try again later.");
      e.code = "SERVER_ERROR";
      throw e;
    }
    const e = new Error(`Unexpected API error (${status}). Try again.`);
    e.code = "UNKNOWN_API_ERROR";
    throw e;
  }

  const result = await response.json();
  const text = result.content[0].text;

  return parseJsonResponse(text);
}

function parseJsonResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract the first complete JSON object
    let depth = 0;
    let start = -1;
    for (let i = 0; i < cleaned.length; i++) {
      if (cleaned[i] === "{") {
        if (depth === 0) start = i;
        depth++;
      } else if (cleaned[i] === "}") {
        depth--;
        if (depth === 0 && start !== -1) {
          try {
            return JSON.parse(cleaned.substring(start, i + 1));
          } catch {
            // continue scanning
          }
        }
      }
    }
    throw new Error("Failed to parse AI response. Try again.");
  }
}
