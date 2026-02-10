(function () {
  const currentDomain = window.location.hostname;

  chrome.storage.local.get(["fabHiddenDomains", "fabPosition"], (result) => {
    const hidden = result.fabHiddenDomains || [];
    if (hidden.includes(currentDomain)) return;

    const savedPos = result.fabPosition || { right: 24, bottom: 24 };
    createFab(savedPos);
  });

  function createFab(position) {
    const host = document.createElement("div");
    host.id = "clutch-creator-host";
    const shadow = host.attachShadow({ mode: "closed" });

    const style = document.createElement("style");
    style.textContent = `
      :host {
        all: initial;
        position: fixed;
        z-index: 2147483647;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }

      .fab-container {
        position: fixed;
        right: ${position.right}px;
        bottom: ${position.bottom}px;
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 6px;
      }

      .fab {
        width: 52px;
        height: 52px;
        background: linear-gradient(135deg, #6366f1, #8b5cf6);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        border: none;
        outline: none;
        user-select: none;
        -webkit-user-select: none;
      }

      .fab:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 28px rgba(99, 102, 241, 0.5), 0 4px 12px rgba(0, 0, 0, 0.2);
      }

      .fab:active {
        cursor: grabbing;
      }

      .fab.dragging {
        transform: scale(1.12);
        cursor: grabbing;
        transition: box-shadow 0.2s ease;
      }

      .hide-btn {
        display: none;
        padding: 4px 10px;
        background: rgba(0, 0, 0, 0.75);
        color: #e4e4e7;
        border: none;
        border-radius: 8px;
        font-size: 11px;
        cursor: pointer;
        white-space: nowrap;
        font-weight: 500;
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
      }

      .fab-container:hover .hide-btn {
        display: block;
      }

      .hide-btn:hover {
        background: rgba(0, 0, 0, 0.9);
      }
    `;

    const container = document.createElement("div");
    container.className = "fab-container";

    const hideBtn = document.createElement("button");
    hideBtn.className = "hide-btn";
    hideBtn.textContent = "Hide on this site";
    hideBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      chrome.storage.local.get(["fabHiddenDomains"], (result) => {
        const domains = result.fabHiddenDomains || [];
        if (!domains.includes(currentDomain)) {
          domains.push(currentDomain);
          chrome.storage.local.set({ fabHiddenDomains: domains });
        }
      });
      host.remove();
    });

    const fab = document.createElement("div");
    fab.className = "fab";
    fab.title = "Clutch Creator";
    fab.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

    // Drag state
    let isDragging = false;
    let dragStarted = false;
    let startX, startY, startRight, startBottom;

    fab.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      dragStarted = false;
      startX = e.clientX;
      startY = e.clientY;
      const rect = container.getBoundingClientRect();
      startRight = window.innerWidth - rect.right;
      startBottom = window.innerHeight - rect.bottom;
      e.preventDefault();
    });

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragStarted = true;
        fab.classList.add("dragging");
      }
      if (dragStarted) {
        const newRight = Math.max(0, Math.min(window.innerWidth - 60, startRight - dx));
        const newBottom = Math.max(0, Math.min(window.innerHeight - 60, startBottom - dy));
        container.style.right = newRight + "px";
        container.style.bottom = newBottom + "px";
      }
    });

    document.addEventListener("mouseup", () => {
      if (isDragging) {
        if (!dragStarted) {
          // It was a click, not a drag
          chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
        } else {
          // Save position
          const right = parseInt(container.style.right) || 24;
          const bottom = parseInt(container.style.bottom) || 24;
          chrome.storage.local.set({ fabPosition: { right, bottom } });
        }
        isDragging = false;
        dragStarted = false;
        fab.classList.remove("dragging");
      }
    });

    container.appendChild(hideBtn);
    container.appendChild(fab);
    shadow.appendChild(style);
    shadow.appendChild(container);
    document.body.appendChild(host);
  }
})();
