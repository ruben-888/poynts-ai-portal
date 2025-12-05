/**
 * Example Widget
 *
 * TEMPLATE - Copy and modify this file to create new widgets.
 *
 * Each widget file exports a Widget object with:
 * - id: Unique identifier (prefix with client name)
 * - waitForSelector: CSS selector to wait for (optional)
 * - code: JavaScript to inject into the page
 */

import { Widget } from "../../types";
// Import config if you need organization data:
// import { config } from "../config";

export const exampleWidget: Widget = {
  id: "template-example-widget",
  waitForSelector: "body", // Wait for body to exist
  code: `
(function() {
  'use strict';

  // ============================================
  // PREVENT DUPLICATE INJECTION
  // ============================================
  // Always check if widget already exists
  if (document.getElementById('poynts-example-widget')) return;

  console.log('[Poynts Widget] Example widget loading...');

  // ============================================
  // CREATE WIDGET ELEMENT
  // ============================================
  const widget = document.createElement('div');
  widget.id = 'poynts-example-widget';

  // Use inline styles to avoid CSS conflicts
  widget.innerHTML = \`
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 20px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border-radius: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 24px rgba(99, 102, 241, 0.3);
      cursor: pointer;
      z-index: 10000;
      transition: transform 0.2s, box-shadow 0.2s;
    ">
      ✨ Earn Poynts
    </div>
  \`;

  // ============================================
  // ADD INTERACTIVITY
  // ============================================
  const inner = widget.querySelector('div');

  inner.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05)';
    this.style.boxShadow = '0 6px 28px rgba(99, 102, 241, 0.4)';
  });

  inner.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.boxShadow = '0 4px 24px rgba(99, 102, 241, 0.3)';
  });

  inner.addEventListener('click', function() {
    alert('Poynts widget clicked!');
    // In a real widget, you might:
    // - Open a modal
    // - Navigate to a page
    // - Call an API
  });

  // ============================================
  // INJECT INTO PAGE
  // ============================================
  document.body.appendChild(widget);

  console.log('[Poynts Widget] Example widget injected');
})();
  `.trim(),
};
