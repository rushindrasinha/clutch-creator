const analyzeBtn = document.getElementById("analyzeBtn");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const retryBtn = document.getElementById("retryBtn");
const resetKeyBtn = document.getElementById("resetKeyBtn");
const footer = document.getElementById("footer");

const setupState = document.getElementById("setupState");
const emptyState = document.getElementById("emptyState");
const loadingState = document.getElementById("loadingState");
const resultsState = document.getElementById("resultsState");
const errorState = document.getElementById("errorState");

const resultAngle = document.getElementById("resultAngle");
const resultHook = document.getElementById("resultHook");
const resultWhy = document.getElementById("resultWhy");
const pageInfo = document.getElementById("pageInfo");
const pageUrl = document.getElementById("pageUrl");

function showState(state) {
  [setupState, emptyState, loadingState, resultsState, errorState].forEach(
    (s) => s.classList.remove("active")
  );
  state.classList.add("active");
}

// Check if API key exists on load
chrome.storage.local.get(["anthropicApiKey"], (result) => {
  if (result.anthropicApiKey) {
    showState(emptyState);
    footer.style.display = "flex";
  } else {
    showState(setupState);
  }
});

// Save API key
saveKeyBtn.addEventListener("click", () => {
  const key = apiKeyInput.value.trim();
  if (!key) return;
  if (!key.startsWith("sk-ant-")) {
    apiKeyInput.style.borderColor = "rgba(248,113,113,0.5)";
    return;
  }
  chrome.storage.local.set({ anthropicApiKey: key }, () => {
    showState(emptyState);
    footer.style.display = "flex";
  });
});

// Reset API key
resetKeyBtn.addEventListener("click", () => {
  chrome.storage.local.remove("anthropicApiKey", () => {
    apiKeyInput.value = "";
    footer.style.display = "none";
    pageInfo.style.display = "none";
    showState(setupState);
  });
});

// Analyze
analyzeBtn.addEventListener("click", runAnalysis);
retryBtn.addEventListener("click", runAnalysis);

async function runAnalysis() {
  const stored = await chrome.storage.local.get(["anthropicApiKey"]);
  const apiKey = stored.anthropicApiKey;

  if (!apiKey) {
    showState(setupState);
    return;
  }

  showState(loadingState);
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

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
  } catch (err) {
    console.error("Clutch Creator error:", err);
    const errorMsg = err.message.includes("401")
      ? "Invalid API key. Please check and try again."
      : err.message.includes("429")
      ? "Rate limited. Wait a moment and try again."
      : `Error: ${err.message}`;
    document.getElementById("errorText").textContent = errorMsg;
    showState(errorState);
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze This Page";
  }
}

// Copy buttons
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.target);
    navigator.clipboard.writeText(target.textContent).then(() => {
      const original = btn.textContent;
      btn.textContent = "Copied!";
      setTimeout(() => (btn.textContent = original), 1500);
    });
  });
});
