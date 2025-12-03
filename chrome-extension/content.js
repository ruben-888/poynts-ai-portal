/**
 * Poynts Campaign Widget Injector
 *
 * This content script detects the current page and loads the appropriate
 * campaign widget from the Poynts API server.
 */

(function() {
  'use strict';

  // Configuration - loaded from config.js or defaults to production
  const API_BASE_URL = window.POYNTS_CONFIG?.API_BASE_URL || 'https://poynts-ai-portal.vercel.app/api/campaign-widget';
  const WIDGET_ID_PREFIX = 'poynts-widget-';

  // Global widgets: load on ALL pages
  const GLOBAL_WIDGETS = [
    {
      widgetType: 'nav-badge',
      waitForSelector: 'nav.fixed'
    }
  ];

  // Page-specific configuration: maps URL patterns to widget types
  const PAGE_CONFIG = [
    {
      // Profile Vault page - inject the setup tracker
      pattern: /\/profile\/?(\?tab=vault)?$/,
      widgetType: 'setup-tracker',
      waitForSelector: '[aria-labelledby*="vault"]'
    },
    // Add more page configurations here as needed:
    // {
    //   pattern: /\/marketplace/,
    //   widgetType: 'rewards-banner',
    //   waitForSelector: '.marketplace-container'
    // },
  ];

  // Track which widgets have been loaded to avoid duplicates
  const loadedWidgets = new Set();

  /**
   * Detect which page we're on and return the matching config
   */
  function detectPage() {
    const path = window.location.pathname + window.location.search;

    for (const config of PAGE_CONFIG) {
      if (config.pattern.test(path)) {
        return config;
      }
    }
    return null;
  }

  /**
   * Wait for an element to appear in the DOM
   */
  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      // Check if already exists
      const existing = document.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }

      // Set up observer
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

      // Timeout fallback
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for ${selector}`));
      }, timeout);
    });
  }

  /**
   * Load and inject a widget script from the API
   */
  async function loadWidget(config) {
    const widgetId = WIDGET_ID_PREFIX + config.widgetType;

    // Don't load if already loaded
    if (loadedWidgets.has(config.widgetType)) {
      console.log(`[Poynts] Widget ${config.widgetType} already loaded`);
      return;
    }

    // Don't load if widget element already exists
    if (document.getElementById(widgetId)) {
      console.log(`[Poynts] Widget ${config.widgetType} already in DOM`);
      return;
    }

    try {
      console.log(`[Poynts] Loading widget: ${config.widgetType}`);

      // Wait for the target element to be present
      if (config.waitForSelector) {
        await waitForElement(config.waitForSelector);
      }

      // Create and inject the script
      const script = document.createElement('script');
      script.id = widgetId + '-script';
      script.src = `${API_BASE_URL}?widget=${config.widgetType}&t=${Date.now()}`;
      script.async = true;

      script.onload = () => {
        console.log(`[Poynts] Widget ${config.widgetType} loaded successfully`);
        loadedWidgets.add(config.widgetType);
      };

      script.onerror = (e) => {
        console.error(`[Poynts] Failed to load widget ${config.widgetType}:`, e);
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error(`[Poynts] Error loading widget:`, error);
    }
  }

  /**
   * Initialize the widget loader
   */
  function init() {
    console.log('[Poynts] Campaign widget injector initialized');

    // Load global widgets (appear on all pages)
    GLOBAL_WIDGETS.forEach(config => {
      console.log(`[Poynts] Loading global widget: ${config.widgetType}`);
      loadWidget(config);
    });

    // Load page-specific widgets
    const pageConfig = detectPage();

    if (pageConfig) {
      console.log(`[Poynts] Detected page type: ${pageConfig.widgetType}`);
      loadWidget(pageConfig);
    } else {
      console.log('[Poynts] No page-specific widget for this page');
    }

    // Watch for SPA navigation (URL changes without full page reload)
    let lastUrl = window.location.href;

    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        console.log('[Poynts] URL changed, checking for widgets');

        // Re-check global widgets (in case nav was re-rendered)
        GLOBAL_WIDGETS.forEach(config => {
          loadWidget(config);
        });

        // Check for page-specific widgets
        const newPageConfig = detectPage();
        if (newPageConfig) {
          // Small delay to let the new page content render
          setTimeout(() => loadWidget(newPageConfig), 500);
        }
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
