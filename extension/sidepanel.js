const analyzeBtn = document.getElementById("analyzeBtn");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const retryBtn = document.getElementById("retryBtn");
const resetKeyBtn = document.getElementById("resetKeyBtn");
const footer = document.getElementById("footer");
const toggleKeyVis = document.getElementById("toggleKeyVis");
const eyeIcon = document.getElementById("eyeIcon");
const eyeOffIcon = document.getElementById("eyeOffIcon");
const keyErrorMsg = document.getElementById("keyErrorMsg");
const copyAllBtn = document.getElementById("copyAllBtn");
const themeToggle = document.getElementById("themeToggle");
const themeIconDark = document.getElementById("themeIconDark");
const themeIconLight = document.getElementById("themeIconLight");
const historyBtn = document.getElementById("historyBtn");
const historyPanel = document.getElementById("historyPanel");
const historyClose = document.getElementById("historyClose");
const historyList = document.getElementById("historyList");
const newPageBanner = document.getElementById("newPageBanner");
const truncatedBadge = document.getElementById("truncatedBadge");
const loadingText = document.getElementById("loadingText");

const setupState = document.getElementById("setupState");
const keySuccessState = document.getElementById("keySuccessState");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const resultsState = document.getElementById("resultsState");
const errorState = document.getElementById("errorState");

const resultAngle = document.getElementById("resultAngle");
const resultHook = document.getElementById("resultHook");
const resultWhy = document.getElementById("resultWhy");
const pageInfo = document.getElementById("pageInfo");
const pageUrl = document.getElementById("pageUrl");

let lastAnalyzedUrl = null;
let historyVisible = false;

const ALL_STATES = [setupState, keySuccessState, emptyState, loadingState, resultsState, errorState];

function showState(state) {
  ALL_STATES.forEach((s) => s.classList.remove("active"));
  state.classList.add("active");
  if (historyVisible) closeHistory();
}

// --- Theme ---
function initTheme() {
  const stored = localStorage.getItem("clutchTheme");
  if (stored) {
    applyTheme(stored);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    applyTheme("light");
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("clutchTheme", theme);
  if (theme === "light") {
    themeIconDark.style.display = "none";
    themeIconLight.style.display = "block";
  } else {
    themeIconDark.style.display = "block";
    themeIconLight.style.display = "none";
  }
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  applyTheme(current === "light" ? "dark" : "light");
});

initTheme();

// --- API Key Visibility Toggle ---
toggleKeyVis.addEventListener("click", () => {
  const isPassword = apiKeyInput.type === "password";
  apiKeyInput.type = isPassword ? "text" : "password";
  eyeIcon.style.display = isPassword ? "none" : "block";
  eyeOffIcon.style.display = isPassword ? "block" : "none";
});

// --- Init: check for existing key ---
chrome.storage.local.get(["anthropicApiKey"], (result) => {
  if (result.anthropicApiKey) {
    showState(emptyState);
    analyzeBtn.style.display = "block";
    footer.style.display = "flex";
  } else {
    showState(setupState);
  }
});

// --- Save API key with validation ---
saveKeyBtn.addEventListener("click", async () => {
  const key = apiKeyInput.value.trim();
  keyErrorMsg.classList.remove("visible");

  if (!key) return;
  if (!key.startsWith("sk-ant-")) {
    keyErrorMsg.textContent = "Key must start with sk-ant-";
    keyErrorMsg.classList.add("visible");
    apiKeyInput.style.borderColor = "rgba(248,113,113,0.5)";
    return;
  }

  saveKeyBtn.disabled = true;
  saveKeyBtn.textContent = "Validating...";

  try {
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "VALIDATE_API_KEY", apiKey: key }, (resp) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(resp);
        }
      });
    });

    if (response.valid) {
      chrome.storage.local.set({ anthropicApiKey: key }, () => {
        showState(keySuccessState);
        setTimeout(() => {
          showState(emptyState);
          analyzeBtn.style.display = "block";
          footer.style.display = "flex";
        }, 1500);
      });
    } else {
      const errMsg = response.error === "TIMEOUT"
        ? "Validation timed out. Check your connection and try again."
        : response.error === "NETWORK_ERROR"
        ? "Network error. Check your connection."
        : "Invalid API key. Please double-check and try again.";
      keyErrorMsg.textContent = errMsg;
      keyErrorMsg.classList.add("visible");
    }
  } catch {
    keyErrorMsg.textContent = "Could not validate key. Try again.";
    keyErrorMsg.classList.add("visible");
  } finally {
    saveKeyBtn.disabled = false;
    saveKeyBtn.textContent = "Save and Get Started";
  }
});

// --- Reset API key ---
resetKeyBtn.addEventListener("click", () => {
  chrome.storage.local.remove("anthropicApiKey", () => {
    apiKeyInput.value = "";
    apiKeyInput.type = "password";
    eyeIcon.style.display = "block";
    eyeOffIcon.style.display = "none";
    footer.style.display = "none";
    pageInfo.style.display = "none";
    analyzeBtn.style.display = "none";
    newPageBanner.classList.remove("visible");
    keyErrorMsg.classList.remove("visible");
    lastAnalyzedUrl = null;
    showState(setupState);
  });
});

// --- Analyze ---
analyzeBtn.addEventListener("click", runAnalysis);
retryBtn.addEventListener("click", runAnalysis);
newPageBanner.addEventListener("click", () => {
  newPageBanner.classList.remove("visible");
  runAnalysis();
});

async function runAnalysis() {
  const stored = await chrome.storage.local.get(["anthropicApiKey"]);
  const apiKey = stored.anthropicApiKey;

  if (!apiKey) {
    showState(setupState);
    analyzeBtn.style.display = "none";
    return;
  }

  showState(loadingState);
  loadingText.textContent = "Extracting page content...";
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";
  newPageBanner.classList.remove("visible");
  truncatedBadge.style.display = "none";

  try {
    const pageContent = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type: "GET_PAGE_CONTENT" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });

    pageInfo.style.display = "block";
    pageUrl.textContent = pageContent.url;
    pageUrl.title = pageContent.url;
    lastAnalyzedUrl = pageContent.url;

    if (pageContent.content.truncated) {
      truncatedBadge.style.display = "inline-block";
    }

    loadingText.textContent = "Generating insights...";

    const analysis = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "ANALYZE_PAGE",
          data: {
            apiKey,
            content: pageContent.content,
            url: pageContent.url,
            title: pageContent.title,
          },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result);
          }
        }
      );
    });

    resultAngle.textContent = analysis.content_angle;
    resultHook.textContent = analysis.hook;
    resultWhy.textContent = analysis.why_it_works;
    showState(resultsState);

    saveToHistory(pageContent.url, pageContent.title, analysis);
  } catch (err) {
    console.error("Clutch Creator error:", err);
    const msg = getErrorMessage(err.message);
    document.getElementById("errorText").textContent = msg;
    showState(errorState);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze This Page";
  }
}

function getErrorMessage(raw) {
  if (raw === "RESTRICTED_PAGE") return "This page can't be analyzed (browser internal page).";
  if (raw === "INSUFFICIENT_CONTENT") return "Not enough text content on this page to analyze.";
  if (raw === "NO_ACTIVE_TAB") return "No page detected. Try refreshing the tab.";
  if (raw === "SCRIPT_INJECTION_FAILED") return "Can't read this page. It may be restricted or protected.";
  if (raw.includes("401") || raw.includes("Invalid API key")) return "Invalid API key. Please update your key and try again.";
  if (raw.includes("429") || raw.includes("Rate limited")) return "Rate limited by Anthropic. Wait a moment and try again.";
  if (raw.includes("timed out") || raw.includes("TIMEOUT")) return "Request timed out. Check your connection and try again.";
  if (raw.includes("Network error") || raw.includes("Failed to fetch")) return "Network error. Check your internet connection.";
  if (raw.includes("500") || raw.includes("unavailable")) return "Anthropic API is temporarily unavailable. Try again later.";
  if (raw.includes("parse")) return "Got an unexpected response from Claude. Try again.";
  return `Error: ${raw}`;
}

// --- Copy buttons ---
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    navigator.clipboard.writeText(target.textContent).then(() => {
      const original = btn.textContent;
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1500);
    });
  });
});

// --- Copy All ---
copyAllBtn.addEventListener("click", () => {
  const angle = resultAngle.textContent;
  const hook = resultHook.textContent;
  const why = resultWhy.textContent;
  const text = `CONTENT ANGLE\n${angle}\n\nHOOK\n${hook}\n\nWHY IT WORKS\n${why}`;
  navigator.clipboard.writeText(text).then(() => {
    const original = copyAllBtn.textContent;
    copyAllBtn.textContent = "Copied all insights!";
    copyAllBtn.classList.add("copied");
    setTimeout(() => {
      copyAllBtn.textContent = original;
      copyAllBtn.classList.remove("copied");
    }, 1500);
  });
});

// --- History ---
function saveToHistory(url, title, analysis) {
  chrome.storage.local.get(["clutchHistory"], (result) => {
    const history = result.clutchHistory || [];
    history.unshift({
      url,
      title,
      analysis,
      timestamp: Date.now(),
    });
    // Keep last 50
    if (history.length > 50) history.length = 50;
    chrome.storage.local.set({ clutchHistory: history });
  });
}

historyBtn.addEventListener("click", () => {
  if (historyVisible) {
    closeHistory();
  } else {
    openHistory();
  }
});

historyClose.addEventListener("click", closeHistory);

function openHistory() {
  chrome.storage.local.get(["clutchHistory"], (result) => {
    const history = result.clutchHistory || [];
    historyList.innerHTML = "";

    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-empty">No analyses yet.</div>';
    } else {
      history.forEach((item, index) => {
        const el = document.createElement("div");
        el.className = "history-item";
        el.innerHTML = `
          <div class="history-item-url" title="${escapeHtml(item.url)}">${escapeHtml(item.url)}</div>
          <div class="history-item-angle">${escapeHtml(item.analysis.content_angle)}</div>
          <div class="history-item-time">${formatTime(item.timestamp)}</div>
        `;
        el.addEventListener("click", () => {
          resultAngle.textContent = item.analysis.content_angle;
          resultHook.textContent = item.analysis.hook;
          resultWhy.textContent = item.analysis.why_it_works;
          pageInfo.style.display = "block";
          pageUrl.textContent = item.url;
          pageUrl.title = item.url;
          showState(resultsState);
        });
        historyList.appendChild(el);
      });
    }

    ALL_STATES.forEach((s) => s.classList.remove("active"));
    historyPanel.classList.add("active");
    historyVisible = true;
  });
}

function closeHistory() {
  historyPanel.classList.remove("active");
  historyVisible = false;
  // Restore last visible state
  if (resultAngle.textContent) {
    resultsState.classList.add("active");
  } else {
    emptyState.classList.add("active");
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
  return d.toLocaleDateString();
}

// --- New page detection ---
let tabCheckInterval = setInterval(checkForNewPage, 2000);

async function checkForNewPage() {
  if (!lastAnalyzedUrl) return;

  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url !== lastAnalyzedUrl) {
      newPageBanner.classList.add("visible");
    } else {
      newPageBanner.classList.remove("visible");
    }
  } catch {
    // Side panel may not have tabs permission in some states
  }
}

// --- Keyboard shortcut handler ---
chrome.commands?.onCommand?.addListener((command) => {
  if (command === "analyze-page") {
    runAnalysis();
  }
});
