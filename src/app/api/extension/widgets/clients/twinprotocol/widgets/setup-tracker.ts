/**
 * Setup Tracker Widget
 *
 * Displays a floating card showing profile completion progress.
 * Appears on profile and vault pages.
 */

import { Widget } from "../../types";

export const setupTrackerWidget: Widget = {
  id: "twinprotocol-setup-tracker",
  waitForSelector: "main",
  code: `
(function() {
  'use strict';

  // Prevent duplicate injection
  if (document.getElementById('poynts-setup-tracker')) return;

  console.log('[Poynts Widget] Setup tracker loading...');

  // Create the setup tracker card
  const tracker = document.createElement('div');
  tracker.id = 'poynts-setup-tracker';
  tracker.innerHTML = \`
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
      padding: 20px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 10000;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Complete Your Profile</h3>
        <span style="font-size: 20px;">🎯</span>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 13px; color: #666;">Progress</span>
          <span style="font-size: 13px; font-weight: 600; color: #6366f1;">2/4 complete</span>
        </div>
        <div style="height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden;">
          <div style="width: 50%; height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 4px;"></div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f0fdf4; border-radius: 8px;">
          <span style="color: #22c55e;">✓</span>
          <span style="font-size: 14px; color: #166534;">Create account</span>
          <span style="margin-left: auto; font-size: 12px; color: #22c55e;">+50 pts</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f0fdf4; border-radius: 8px;">
          <span style="color: #22c55e;">✓</span>
          <span style="font-size: 14px; color: #166534;">Connect wallet</span>
          <span style="margin-left: auto; font-size: 12px; color: #22c55e;">+100 pts</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #fefce8; border-radius: 8px; cursor: pointer;">
          <span style="color: #eab308;">○</span>
          <span style="font-size: 14px; color: #854d0e;">Train your twin</span>
          <span style="margin-left: auto; font-size: 12px; color: #eab308;">+200 pts</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f9fafb; border-radius: 8px;">
          <span style="color: #9ca3af;">○</span>
          <span style="font-size: 14px; color: #6b7280;">First conversation</span>
          <span style="margin-left: auto; font-size: 12px; color: #9ca3af;">+150 pts</span>
        </div>
      </div>

      <button id="poynts-tracker-close" style="
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #9ca3af;
        padding: 4px;
      ">×</button>
    </div>
  \`;

  document.body.appendChild(tracker);

  // Close button handler
  document.getElementById('poynts-tracker-close').addEventListener('click', function() {
    tracker.style.display = 'none';
  });

  console.log('[Poynts Widget] Setup tracker injected');
})();
  `.trim(),
};
