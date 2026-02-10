chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_PAGE_CONTENT") {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (!tabs[0]) {
        sendResponse({ error: "No active tab" });
        return;
      }
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: extractPageContent,
        });
        sendResponse({
          content: results[0].result,
          url: tabs[0].url,
          title: tabs[0].title,
        });
      } catch (err) {
        sendResponse({ error: err.message });
      }
    });
    return true;
  }

  if (message.type === "ANALYZE_PAGE") {
    analyzePage(message.data)
      .then((result) => sendResponse({ result }))
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }
});

function extractPageContent() {
  const selectors = [
    "article",
    "main",
    '[role="main"]',
    ".post-content",
    ".article-body",
    ".entry-content",
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

  if (content.length > 3000) {
    content = content.substring(0, 3000) + "...";
  }

  return {
    text: content,
    metaDescription: metaDesc || ogDesc,
    h1: document.querySelector("h1")?.innerText || "",
    domain: window.location.hostname,
  };
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
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`API error ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const text = result.content[0].text;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    throw new Error("Failed to parse AI response");
  }
}
