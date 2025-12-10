/**
 * Poynts Extension Configuration
 * Auto-detects development vs production environment
 */

(function() {
  // Production URLs
  const PROD_BASE = 'https://poynts-ai-portal.vercel.app';

  // Development URLs
  const DEV_BASE = 'http://localhost:3000';

  // Detect if extension is unpacked (no update_url = unpacked/dev mode)
  const isDev = !chrome.runtime.getManifest().update_url;

  const BASE_URL = isDev ? DEV_BASE : PROD_BASE;

  window.POYNTS_CONFIG = {
    API_BASE_URL: `${BASE_URL}/api/extension/widgets`,
    VERSION_CHECK_URL: `${BASE_URL}/api/extension/version`,
    INSTALL_PAGE_URL: `${BASE_URL}/extension`,
    IS_DEV: isDev
  };

  if (isDev) {
    console.log('[Poynts] Running in development mode:', BASE_URL);
  }
})();