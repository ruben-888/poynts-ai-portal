/**
 * Poynts Campaign Widget Injector
 *
 * This content script sends the current page context to the Poynts API,
 * which returns the appropriate widgets to display based on the client domain.
 */

(function() {
  'use strict';

  // Configuration - loaded from config.js or defaults to production
  const API_BASE_URL = window.POYNTS_CONFIG?.API_BASE_URL || 'https://poynts-ai-portal.vercel.app/api/extension/widgets';
  const WIDGET_ID_PREFIX = 'poynts-widget-';

  // Track loaded widgets to avoid duplicates
  const loadedWidgets = new Set();

  // Current page context
  function getPageContext() {
    return {
      domain: window.location.hostname,
      path: window.location.pathname,
      search: window.location.search,
      url: window.location.href
    };
  }

  /**
   * Wait for an element to appear in the DOM
   */
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  }

  /**
   * Fetch widget configuration from the server
   */
  async function fetchWidgetConfig() {
    const context = getPageContext();
    const params = new URLSearchParams({
      domain: context.domain,
      path: context.path,
      url: context.url
    });

    try {
      const response = await fetch(`${API_BASE_URL}?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('[Poynts] Failed to fetch widget config:', error);
      return { widgets: [] };
    }
  }

  /**
   * Load and inject a widget script
   */
  async function loadWidget(widget) {
    const widgetId = WIDGET_ID_PREFIX + widget.id;

    // Don't load if already loaded
    if (loadedWidgets.has(widget.id)) {
      console.log(`[Poynts] Widget ${widget.id} already loaded`);
      return;
    }

    // Don't load if widget element already exists
    if (document.getElementById(widgetId)) {
      console.log(`[Poynts] Widget ${widget.id} already in DOM`);
      return;
    }

    try {
      console.log(`[Poynts] Loading widget: ${widget.id}`);

      // Wait for target element if specified
      if (widget.waitForSelector) {
        await waitForElement(widget.waitForSelector);
      }

      // Inject the widget script
      const script = document.createElement('script');
      script.id = widgetId + '-script';
      script.textContent = widget.code;

      script.onerror = (e) => {
        console.error(`[Poynts] Failed to load widget ${widget.id}:`, e);
      };

      document.head.appendChild(script);
      loadedWidgets.add(widget.id);
      console.log(`[Poynts] Widget ${widget.id} loaded successfully`);

    } catch (error) {
      console.error(`[Poynts] Error loading widget ${widget.id}:`, error);
    }
  }

  /**
   * Load all widgets for the current page
   */
  async function loadWidgets() {
    const config = await fetchWidgetConfig();

    if (!config.widgets || config.widgets.length === 0) {
      console.log('[Poynts] No widgets configured for this page');
      return;
    }

    console.log(`[Poynts] Loading ${config.widgets.length} widget(s)`);

    for (const widget of config.widgets) {
      await loadWidget(widget);
    }
  }

  /**
   * Initialize the widget loader
   */
  async function init() {
    const context = getPageContext();
    console.log(`[Poynts] Initialized on ${context.domain}${context.path}`);

    await loadWidgets();

    // Watch for SPA navigation
    let lastUrl = window.location.href;

    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.log('[Poynts] URL changed, reloading widgets');

        // Small delay to let new page content render
        setTimeout(loadWidgets, 500);
      }
    });

    urlObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
