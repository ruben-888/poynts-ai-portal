/**
 * Setup Tracker Widget Generator
 *
 * Generates JavaScript code for the profile setup progress tracker.
 * Data is embedded at generation time from JSON files.
 */

import { ClientConfig } from "../clients/types";
import setupData from "../clients/twinprotocol/data/setup-tasks.json";

interface SetupData {
  title: string;
  subtitle: string;
  tasks: typeof setupData.tasks;
  redeemUrl: string;
}

export async function generateSetupTrackerWidget(
  clientConfig: ClientConfig
): Promise<string> {
  // For now, use the static JSON data
  // In production, this would fetch from an API
  const data: SetupData = setupData;

  // Calculate totals
  const totalPoints = data.tasks.reduce((sum, task) => sum + task.points, 0);
  const earnedPoints = data.tasks
    .filter((t) => t.completed)
    .reduce((sum, task) => sum + task.points, 0);
  const completedCount = data.tasks.filter((t) => t.completed).length;

  return `
(function() {
  'use strict';

  // Prevent duplicate injection
  if (document.getElementById('poynts-setup-tracker')) {
    console.log('[Poynts] Setup tracker already exists');
    return;
  }

  // ============================================
  // TASK DATA (Injected at build time)
  // ============================================
  const tasks = ${JSON.stringify(data.tasks)};
  const title = ${JSON.stringify(data.title)};
  const subtitle = ${JSON.stringify(data.subtitle)};
  const redeemUrl = ${JSON.stringify(data.redeemUrl)};
  const totalPoints = ${totalPoints};
  const earnedPoints = ${earnedPoints};
  const completedCount = ${completedCount};

  // ============================================
  // STYLES
  // ============================================
  const styles = \`
    .poynts-tracker {
      background: rgba(17, 24, 39, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgb(55, 65, 81);
      border-radius: 8px;
      padding: 24px;
      margin-top: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: visible;
    }

    .poynts-tracker * {
      box-sizing: border-box;
    }

    .poynts-tracker-header {
      margin-bottom: 16px;
    }

    .poynts-tracker-title {
      font-size: 20px;
      font-weight: 600;
      color: white;
      margin: 0 0 4px 0;
    }

    .poynts-tracker-subtitle {
      font-size: 14px;
      color: rgb(156, 163, 175);
      margin: 0;
    }

    .poynts-tracker-points-info {
      margin-bottom: 16px;
    }

    .poynts-tracker-points-label {
      font-size: 14px;
      color: rgb(209, 213, 219);
    }

    .poynts-tracker-points-value {
      font-size: 24px;
      font-weight: 700;
      color: rgb(96, 165, 250);
      margin: 0 8px;
    }

    .poynts-tracker-progress-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .poynts-tracker-progress-text {
      font-size: 14px;
      color: rgb(209, 213, 219);
    }

    .poynts-tracker-earned-section {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .poynts-tracker-earned-text {
      font-size: 14px;
      font-weight: 600;
      color: rgb(250, 204, 21);
    }

    .poynts-tracker-redeem-link {
      font-size: 12px;
      color: rgb(96, 165, 250);
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 2px;
      cursor: pointer;
      transition: color 0.2s;
    }

    .poynts-tracker-redeem-link:hover {
      color: rgb(147, 197, 253);
    }

    .poynts-tracker-circles {
      display: flex;
      align-items: center;
      gap: 4px;
      overflow: visible;
    }

    .poynts-tracker-task {
      display: flex;
      align-items: center;
      overflow: visible;
    }

    .poynts-tracker-circle-wrapper {
      position: relative;
      overflow: visible;
    }

    .poynts-tracker-circle {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .poynts-tracker-circle:hover {
      transform: scale(1.1);
    }

    .poynts-tracker-circle.completed {
      background: rgb(22, 163, 74);
      border: 2px solid rgb(21, 128, 61);
    }

    .poynts-tracker-circle.incomplete {
      background: rgb(55, 65, 81);
      border: 2px solid rgb(75, 85, 99);
    }

    .poynts-tracker-circle svg {
      width: 16px;
      height: 16px;
    }

    .poynts-tracker-circle.completed svg {
      stroke: white;
    }

    .poynts-tracker-circle.incomplete svg {
      stroke: rgb(156, 163, 175);
    }

    .poynts-tracker-connector {
      width: 16px;
      height: 2px;
      background: rgb(55, 65, 81);
      margin: 0 2px;
    }

    /* Hover Card - positioned above circle, offset to the right */
    .poynts-tracker-hover-card {
      position: absolute;
      bottom: 100%;
      left: -20px;
      margin-bottom: 8px;
      width: 256px;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 99999;
    }

    .poynts-tracker-circle-wrapper:hover .poynts-tracker-hover-card {
      opacity: 1;
      pointer-events: auto;
    }

    .poynts-tracker-hover-content {
      background: rgb(31, 41, 55);
      border: 1px solid rgb(55, 65, 81);
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    }

    .poynts-tracker-hover-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 8px;
    }

    .poynts-tracker-hover-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .poynts-tracker-hover-icon.completed {
      background: rgb(22, 163, 74);
    }

    .poynts-tracker-hover-icon.incomplete {
      background: rgb(55, 65, 81);
    }

    .poynts-tracker-hover-icon svg {
      width: 16px;
      height: 16px;
    }

    .poynts-tracker-hover-icon.completed svg {
      stroke: white;
    }

    .poynts-tracker-hover-icon.incomplete svg {
      stroke: rgb(156, 163, 175);
    }

    .poynts-tracker-hover-title {
      font-size: 14px;
      font-weight: 600;
      color: white;
      margin: 0 0 4px 0;
    }

    .poynts-tracker-hover-status {
      font-size: 12px;
      color: rgb(74, 222, 128);
      display: block;
      margin-bottom: 8px;
    }

    .poynts-tracker-hover-desc {
      font-size: 12px;
      color: rgb(209, 213, 219);
      line-height: 1.5;
      margin: 0 0 12px 0;
    }

    .poynts-tracker-hover-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 8px;
      border-top: 1px solid rgb(55, 65, 81);
    }

    .poynts-tracker-hover-reward-label {
      font-size: 12px;
      color: rgb(156, 163, 175);
    }

    .poynts-tracker-hover-reward-value {
      font-size: 14px;
      font-weight: 700;
      color: rgb(250, 204, 21);
    }

    .poynts-tracker-hover-arrow {
      position: absolute;
      top: 100%;
      left: 32px;
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgb(55, 65, 81);
    }
  \`;

  // ============================================
  // CREATE DOM ELEMENTS
  // ============================================

  // Inject styles
  const styleElement = document.createElement('style');
  styleElement.id = 'poynts-tracker-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);

  // Create checkmark SVG
  function createCheckSVG() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '3');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M5 13l4 4L19 7');
    svg.appendChild(path);

    return svg;
  }

  // Create hover card for a task
  function createHoverCard(task) {
    const card = document.createElement('div');
    card.className = 'poynts-tracker-hover-card';

    card.innerHTML = \`
      <div class="poynts-tracker-hover-content">
        <div class="poynts-tracker-hover-header">
          <div class="poynts-tracker-hover-icon \${task.completed ? 'completed' : 'incomplete'}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <h4 class="poynts-tracker-hover-title">\${task.title}</h4>
            \${task.completed ? '<span class="poynts-tracker-hover-status">✓ Completed</span>' : ''}
          </div>
        </div>
        <p class="poynts-tracker-hover-desc">\${task.description}</p>
        <div class="poynts-tracker-hover-footer">
          <span class="poynts-tracker-hover-reward-label">Reward</span>
          <span class="poynts-tracker-hover-reward-value">+\${task.points} poynts</span>
        </div>
        <div class="poynts-tracker-hover-arrow"></div>
      </div>
    \`;

    return card;
  }

  // Create the main tracker element
  function createTracker() {
    const tracker = document.createElement('div');
    tracker.id = 'poynts-setup-tracker';
    tracker.className = 'poynts-tracker';

    // Header
    const header = document.createElement('div');
    header.className = 'poynts-tracker-header';
    header.innerHTML = \`
      <h3 class="poynts-tracker-title">\${title}</h3>
      <p class="poynts-tracker-subtitle">\${subtitle}</p>
    \`;
    tracker.appendChild(header);

    // Points info
    const pointsInfo = document.createElement('div');
    pointsInfo.className = 'poynts-tracker-points-info';
    pointsInfo.innerHTML = \`
      <span class="poynts-tracker-points-label">Earn up to</span>
      <span class="poynts-tracker-points-value">\${totalPoints}</span>
      <span class="poynts-tracker-points-label">poynts!</span>
    \`;
    tracker.appendChild(pointsInfo);

    // Progress row
    const progressRow = document.createElement('div');
    progressRow.className = 'poynts-tracker-progress-row';
    progressRow.innerHTML = \`
      <span class="poynts-tracker-progress-text">Progress: \${completedCount}/\${tasks.length} tasks</span>
      <div class="poynts-tracker-earned-section">
        <span class="poynts-tracker-earned-text">\${earnedPoints} poynts earned</span>
        <a href="\${redeemUrl}" target="_blank" class="poynts-tracker-redeem-link">Redeem rewards →</a>
      </div>
    \`;
    tracker.appendChild(progressRow);

    // Progress circles
    const circlesContainer = document.createElement('div');
    circlesContainer.className = 'poynts-tracker-circles';

    tasks.forEach((task, index) => {
      const taskWrapper = document.createElement('div');
      taskWrapper.className = 'poynts-tracker-task';

      const circleWrapper = document.createElement('div');
      circleWrapper.className = 'poynts-tracker-circle-wrapper';

      const circle = document.createElement('div');
      circle.className = 'poynts-tracker-circle ' + (task.completed ? 'completed' : 'incomplete');
      circle.appendChild(createCheckSVG());

      circleWrapper.appendChild(circle);
      circleWrapper.appendChild(createHoverCard(task));
      taskWrapper.appendChild(circleWrapper);

      // Add connector line (except after last task)
      if (index < tasks.length - 1) {
        const connector = document.createElement('div');
        connector.className = 'poynts-tracker-connector';
        taskWrapper.appendChild(connector);
      }

      circlesContainer.appendChild(taskWrapper);
    });

    tracker.appendChild(circlesContainer);

    return tracker;
  }

  // ============================================
  // INJECT INTO PAGE
  // ============================================

  function inject() {
    // Find the Vault tab content
    const vaultPanel = document.querySelector('[role="tabpanel"][data-state="active"]');

    if (!vaultPanel) {
      console.log('[Poynts] Vault panel not found, retrying...');
      setTimeout(inject, 500);
      return;
    }

    // Find the grid container inside the vault
    const gridContainer = vaultPanel.querySelector('.grid');

    if (!gridContainer) {
      console.log('[Poynts] Grid container not found, retrying...');
      setTimeout(inject, 500);
      return;
    }

    // Check if already injected
    if (document.getElementById('poynts-setup-tracker')) {
      console.log('[Poynts] Tracker already exists');
      return;
    }

    // Create and inject the tracker
    const tracker = createTracker();

    // Insert after the grid container
    gridContainer.parentNode.insertBefore(tracker, gridContainer.nextSibling);

    console.log('[Poynts] Setup tracker injected successfully');
  }

  // Start injection
  inject();
})();
  `.trim();
}
