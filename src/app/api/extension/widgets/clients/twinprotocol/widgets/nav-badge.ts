/**
 * Nav Badge Widget
 *
 * Displays a Poynts balance badge in the navigation bar.
 * Appears on all pages.
 */

import { Widget } from "../../types";

export const navBadgeWidget: Widget = {
  id: "twinprotocol-nav-badge",
  waitForSelector: "nav",
  code: `
(function() {
  'use strict';

  // Prevent duplicate injection
  if (document.getElementById('poynts-nav-badge')) return;

  console.log('[Poynts Widget] Nav badge loading...');

  // Find the nav element
  const nav = document.querySelector('nav');
  if (!nav) {
    console.log('[Poynts Widget] Nav not found');
    return;
  }

  // Create the Poynts badge
  const badge = document.createElement('div');
  badge.id = 'poynts-nav-badge';
  badge.innerHTML = \`
    <div style="
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 20px;
      color: white;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
    ">
      <span style="font-size: 16px;">✨</span>
      <span>250 Poynts</span>
    </div>
  \`;

  // Hover effects
  const badgeInner = badge.querySelector('div');
  badgeInner.addEventListener('mouseenter', function() {
    this.style.transform = 'scale(1.05)';
    this.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
  });
  badgeInner.addEventListener('mouseleave', function() {
    this.style.transform = 'scale(1)';
    this.style.boxShadow = '0 2px 8px rgba(99, 102, 241, 0.3)';
  });

  // Insert into nav
  const navContainer = nav.querySelector('div') || nav;
  navContainer.style.display = 'flex';
  navContainer.style.alignItems = 'center';
  navContainer.appendChild(badge);

  console.log('[Poynts Widget] Nav badge injected');
})();
  `.trim(),
};
