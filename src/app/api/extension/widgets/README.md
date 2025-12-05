# Poynts Extension Widgets API

This directory contains the server-side logic for the Poynts Chrome extension. The extension is a thin client that asks the server "what widgets should I show?" based on the current domain and page path.

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  User's Browser (Partner Site)                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  Chrome Extension (content.js)                                         │ │
│  │                                                                        │ │
│  │  1. Detects current domain + path                                      │ │
│  │  2. Calls GET /api/extension/widgets?domain=...&path=...               │ │
│  │  3. Receives widget configs with JavaScript code                       │ │
│  │  4. Injects each widget's code into the page                           │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Poynts Server (/api/extension/widgets)                                     │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │  route.ts                                                              │ │
│  │    └── Receives domain + path                                          │ │
│  │    └── Looks up client config by domain                                │ │
│  │    └── Returns matching widgets                                        │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │  clients/                                                              │ │
│  │    ├── index.ts              # Client registry                         │ │
│  │    ├── types.ts              # Shared TypeScript types                 │ │
│  │    ├── _template/            # Template for new clients                │ │
│  │    └── twinprotocol/         # Twin Protocol demo                      │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Structure

```text
src/app/api/extension/widgets/
├── route.ts                     # API endpoint handler
├── README.md                    # This file
└── clients/
    ├── index.ts                 # Client registry
    ├── types.ts                 # Shared types (Widget, ClientConfig, etc.)
    │
    ├── _template/               # TEMPLATE - Copy to create new clients
    │   ├── config.ts            # Client settings (org ID, theme, etc.)
    │   ├── index.ts             # Main config (domains, widget routing)
    │   └── widgets/
    │       └── example-widget.ts
    │
    └── twinprotocol/            # Example: Twin Protocol
        ├── config.ts            # Twin Protocol settings
        ├── index.ts             # Widget routing
        └── widgets/
            ├── nav-badge.ts     # Points badge in navbar
            └── setup-tracker.ts # Profile completion tracker
```

---

## How to Add a New Client

### Step 1: Copy the Template Directory

```bash
cp -r src/app/api/extension/widgets/clients/_template \
      src/app/api/extension/widgets/clients/my-client
```

### Step 2: Configure the Client

Edit `my-client/config.ts`:

```typescript
export const config = {
  name: "My Client",
  domains: ["myclient.com", "www.myclient.com"],

  // Organization ID from Poynts database
  // This links the demo to campaigns and user data
  organizationId: "org_xxxxxxxxxxxxxxxx",

  // Optional: Specific program or campaigns
  programId: undefined,
  featuredCampaignIds: undefined,

  // Theme colors for widgets
  theme: {
    primaryColor: "#6366f1",
    accentColor: "#8b5cf6",
  },
};
```

### Step 3: Create Your Widgets

Create widget files in `my-client/widgets/`. Each widget needs:

| Property | Required | Description |
|----------|----------|-------------|
| `id` | Yes | Unique identifier (prefix with client name) |
| `waitForSelector` | No | CSS selector to wait for before injecting |
| `code` | Yes | JavaScript code to inject into the page |

**Example widget:**

```typescript
const myWidget: Widget = {
  id: "myclient-rewards-badge",
  waitForSelector: "nav",  // Wait for nav element to exist
  code: `
(function() {
  // Your widget code here
  // This runs in the context of the partner's website

  const badge = document.createElement('div');
  badge.id = 'poynts-rewards-badge';
  badge.innerHTML = '<div style="...">100 Points</div>';
  document.body.appendChild(badge);
})();
  `.trim(),
};
```

### Step 4: Configure Widget Routing

Edit `my-client/index.ts` to import widgets and configure routing:

```typescript
import { ClientConfig, Widget } from "../types";
import { config } from "./config";
import { navBadgeWidget } from "./widgets/nav-badge";
import { welcomeModalWidget } from "./widgets/welcome-modal";

export const myClientConfig: ClientConfig = {
  name: config.name,
  domains: config.domains,
  config,

  getWidgets(path: string): Widget[] {
    const widgets: Widget[] = [];

    // Show on ALL pages
    widgets.push(navBadgeWidget);

    // Show only on specific pages
    if (path === "/" || path === "/home") {
      widgets.push(welcomeModalWidget);
    }

    if (path.startsWith("/dashboard")) {
      widgets.push(dashboardTrackerWidget);
    }

    return widgets;
  },
};
```

### Step 5: Register the Client

In `clients/index.ts`, import and add your config:

```typescript
import { myClientConfig } from "./my-client";

const CLIENTS: ClientConfig[] = [
  twinProtocolConfig,
  myClientConfig,  // Add your client here
];
```

### Step 6: Update the Chrome Extension Manifest

Edit `chrome-extension/manifest.json` to include your domain:

```json
{
  "host_permissions": [
    "https://twinprotocol.ai/*",
    "https://myclient.com/*",
    "https://www.myclient.com/*"
  ],
  "content_scripts": [
    {
      "matches": [
        "https://twinprotocol.ai/*",
        "https://myclient.com/*",
        "https://www.myclient.com/*"
      ],
      "js": ["config.js", "content.js"],
      "run_at": "document_idle"
    }
  ]
}
```

### Step 6: Rebuild the Extension (only needed for new domains)

```bash
pnpm build:extension
```

Users will need to re-download the extension if you add new domains.

---

## Widget Code Guidelines

### Basic Structure

All widget code should be wrapped in an IIFE to avoid polluting the global scope:

```typescript
const myWidget: Widget = {
  id: "client-widget-name",
  code: `
(function() {
  'use strict';

  // Your code here

})();
  `.trim(),
};
```

### Styling Widgets

Use inline styles to avoid CSS conflicts with the host site:

```javascript
const element = document.createElement('div');
element.style.cssText = \`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  z-index: 10000;
  font-family: system-ui, -apple-system, sans-serif;
\`;
```

### Finding Injection Points

Use `waitForSelector` to wait for specific elements:

```typescript
const widget: Widget = {
  id: "client-nav-badge",
  waitForSelector: "nav .user-menu",  // Wait for this element
  code: `
(function() {
  const target = document.querySelector('nav .user-menu');
  if (!target) return;

  // Inject next to the target
  const badge = document.createElement('div');
  target.parentNode.insertBefore(badge, target);
})();
  `.trim(),
};
```

### Common Injection Patterns

**Fixed position overlay (bottom-right corner):**
```javascript
element.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 10000;';
document.body.appendChild(element);
```

**Insert into navigation:**
```javascript
const nav = document.querySelector('nav');
nav.appendChild(element);
```

**Insert before/after existing element:**
```javascript
const target = document.querySelector('.some-element');
target.parentNode.insertBefore(element, target.nextSibling);
```

**Replace element content:**
```javascript
const target = document.querySelector('.points-display');
target.innerHTML = '<span>250 Poynts</span>';
```

### Handling SPA Navigation

The extension automatically re-fetches widgets when the URL changes. Your widget code should:

1. Check if the widget already exists before creating it
2. Use unique IDs prefixed with `poynts-`

```javascript
(function() {
  // Prevent duplicate injection
  if (document.getElementById('poynts-my-widget')) return;

  const widget = document.createElement('div');
  widget.id = 'poynts-my-widget';
  // ...
})();
```

---

## API Response Format

The API returns JSON in this format:

```json
{
  "client": "Twin Protocol",
  "widgets": [
    {
      "id": "twinprotocol-nav-badge",
      "waitForSelector": "nav",
      "code": "(function() { ... })();"
    },
    {
      "id": "twinprotocol-setup-tracker",
      "waitForSelector": "main",
      "code": "(function() { ... })();"
    }
  ]
}
```

---

## Testing Your Widgets

### Local Development

1. Update `chrome-extension/config.js` to point to localhost:
   ```javascript
   window.POYNTS_CONFIG = {
     API_BASE_URL: 'http://localhost:3000/api/extension/widgets',
   };
   ```

2. Run the dev server:
   ```bash
   pnpm dev
   ```

3. Load the unpacked extension in Chrome (`chrome://extensions`)

4. Visit the partner site and open DevTools console to see logs:
   ```
   [Poynts] Initialized on twinprotocol.ai/profile
   [Poynts] Loading 2 widget(s)
   [Poynts] Widget twinprotocol-nav-badge loaded successfully
   [Poynts] Widget twinprotocol-setup-tracker loaded successfully
   ```

### Testing the API Directly

```bash
curl "http://localhost:3000/api/extension/widgets?domain=twinprotocol.ai&path=/profile"
```

---

## Troubleshooting

### Widget not appearing

1. Check the browser console for `[Poynts]` logs
2. Verify the domain is in `manifest.json`
3. Check `waitForSelector` - the element might not exist
4. Ensure the widget ID is unique

### Widget appears multiple times

Add a check at the start of your widget code:
```javascript
if (document.getElementById('poynts-my-widget')) return;
```

### Styles conflict with host site

Use more specific inline styles and high `z-index` values (10000+).

### CORS errors

The extension fetches from the API using the site's origin. Ensure the API allows requests from the partner domains.

---

## Quick Reference

| Task | File to Edit |
|------|--------------|
| Add new client | Create `clients/[name].ts`, register in `clients/index.ts` |
| Add new widget | Edit client's `.ts` file, add to `getWidgets()` |
| Change widget appearance | Edit the `code` property in widget definition |
| Change injection point | Update `waitForSelector` or DOM insertion logic |
| Add new domain | Update `chrome-extension/manifest.json` |
| Test locally | Update `chrome-extension/config.js` to localhost |
