/**
 * Nav Badge Widget Generator
 *
 * Generates JavaScript code for the navigation badge with campaign modal.
 * Data is embedded at generation time from JSON files.
 */

import { ClientConfig } from "../clients/types";
import campaignData from "../clients/twinprotocol/data/campaigns.json";

interface CampaignData {
  campaigns: typeof campaignData.campaigns;
  categories: typeof campaignData.categories;
}

export async function generateNavBadgeWidget(
  clientConfig: ClientConfig
): Promise<string> {
  // For now, use the static JSON data
  // In production, this would fetch from an API
  const data: CampaignData = campaignData;

  const theme = clientConfig.config?.theme || {
    primaryColor: "#9333ea",
    accentColor: "#db2777",
  };

  return `
(function() {
  'use strict';

  // Prevent duplicate injection
  if (document.getElementById('poynts-nav-badge')) {
    console.log('[Poynts] Nav badge already exists');
    return;
  }

  // ============================================
  // CAMPAIGN DATA (Injected at build time)
  // ============================================
  const campaigns = ${JSON.stringify(data.campaigns)};
  const campaignCategories = ${JSON.stringify(data.categories)};
  const theme = ${JSON.stringify(theme)};

  // Current view state
  let currentView = 'list';
  let selectedCategoryId = null;

  // ============================================
  // STYLES
  // ============================================
  const styles = \`
    /* Badge styles */
    .poynts-nav-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: linear-gradient(135deg, rgb(147, 51, 234) 0%, rgb(219, 39, 119) 100%);
      border-radius: 9999px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin-right: 8px;
      box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);
    }

    .poynts-nav-badge:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(147, 51, 234, 0.4);
    }

    .poynts-nav-badge-icon {
      width: 16px;
      height: 16px;
    }

    .poynts-nav-badge-text {
      font-size: 13px;
      font-weight: 600;
      color: white;
      white-space: nowrap;
    }

    /* Modal overlay */
    .poynts-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
    }

    .poynts-modal-overlay.open {
      opacity: 1;
      visibility: visible;
    }

    /* Modal container */
    .poynts-modal {
      background: rgb(17, 24, 39);
      border: 1px solid rgb(55, 65, 81);
      border-radius: 16px;
      width: 90%;
      max-width: 700px;
      max-height: 85vh;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      transition: transform 0.2s ease;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .poynts-modal-overlay.open .poynts-modal {
      transform: scale(1) translateY(0);
    }

    /* Modal header */
    .poynts-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid rgb(55, 65, 81);
    }

    .poynts-modal-title {
      font-size: 20px;
      font-weight: 600;
      color: white;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .poynts-modal-title-icon {
      width: 24px;
      height: 24px;
      color: rgb(147, 51, 234);
    }

    .poynts-modal-close {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: rgb(55, 65, 81);
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
      color: rgb(156, 163, 175);
    }

    .poynts-modal-close:hover {
      background: rgb(75, 85, 99);
      color: white;
    }

    .poynts-modal-close svg {
      width: 18px;
      height: 18px;
    }

    /* Modal body */
    .poynts-modal-body {
      padding: 24px;
      overflow-y: auto;
      max-height: calc(85vh - 80px);
      color: rgb(209, 213, 219);
    }

    /* Campaign cards grid */
    .poynts-campaigns-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    @media (max-width: 600px) {
      .poynts-campaigns-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Campaign card */
    .poynts-campaign-card {
      background: rgb(31, 41, 55);
      border: 2px solid rgb(59, 130, 246);
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .poynts-campaign-card:hover {
      border-color: rgb(96, 165, 250);
      background: rgb(37, 48, 63);
      transform: translateY(-2px);
    }

    .poynts-campaign-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      border-color: rgb(55, 65, 81);
    }

    .poynts-campaign-card.disabled:hover {
      transform: none;
      background: rgb(31, 41, 55);
    }

    /* Card icon */
    .poynts-campaign-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      background: rgb(59, 130, 246);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .poynts-campaign-icon svg {
      width: 24px;
      height: 24px;
      color: white;
    }

    /* Card content */
    .poynts-campaign-content {
      flex: 1;
      min-width: 0;
    }

    .poynts-campaign-name {
      font-size: 15px;
      font-weight: 600;
      color: white;
      margin: 0 0 4px 0;
    }

    .poynts-campaign-desc {
      font-size: 13px;
      color: rgb(156, 163, 175);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .poynts-campaign-count {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: rgb(96, 165, 250);
    }

    .poynts-campaign-count svg {
      width: 14px;
      height: 14px;
    }

    /* Card chevron */
    .poynts-campaign-chevron {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: rgb(107, 114, 128);
      align-self: center;
    }

    .poynts-campaign-card:hover .poynts-campaign-chevron {
      color: rgb(156, 163, 175);
    }

    /* Detail view styles */
    .poynts-detail-view {
      display: none;
    }

    .poynts-detail-view.active {
      display: block;
    }

    .poynts-list-view.hidden {
      display: none;
    }

    .poynts-back-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      background: transparent;
      border: 1px solid rgb(55, 65, 81);
      border-radius: 8px;
      color: rgb(156, 163, 175);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 16px;
    }

    .poynts-back-button:hover {
      background: rgb(31, 41, 55);
      color: white;
      border-color: rgb(75, 85, 99);
    }

    .poynts-back-button svg {
      width: 16px;
      height: 16px;
    }

    /* Campaign detail header */
    .poynts-detail-header {
      margin-bottom: 20px;
    }

    .poynts-detail-title {
      font-size: 22px;
      font-weight: 700;
      color: white;
      margin: 0 0 8px 0;
    }

    .poynts-detail-desc {
      font-size: 14px;
      color: rgb(156, 163, 175);
      margin: 0 0 16px 0;
      line-height: 1.5;
    }

    /* Progress bar */
    .poynts-progress-container {
      background: rgb(31, 41, 55);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .poynts-progress-stats {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .poynts-progress-label {
      font-size: 14px;
      color: rgb(156, 163, 175);
    }

    .poynts-progress-value {
      font-size: 14px;
      font-weight: 600;
      color: rgb(74, 222, 128);
    }

    .poynts-progress-bar {
      height: 8px;
      background: rgb(55, 65, 81);
      border-radius: 4px;
      overflow: hidden;
    }

    .poynts-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, rgb(59, 130, 246) 0%, rgb(147, 51, 234) 100%);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .poynts-points-info {
      display: flex;
      justify-content: space-between;
      margin-top: 12px;
      font-size: 13px;
    }

    .poynts-points-earned {
      color: rgb(250, 204, 21);
      font-weight: 600;
    }

    .poynts-points-available {
      color: rgb(156, 163, 175);
    }

    /* Task list */
    .poynts-tasks-title {
      font-size: 16px;
      font-weight: 600;
      color: white;
      margin: 0 0 12px 0;
    }

    .poynts-task-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .poynts-task-item {
      background: rgb(31, 41, 55);
      border: 1px solid rgb(55, 65, 81);
      border-radius: 10px;
      padding: 14px;
      display: flex;
      align-items: flex-start;
      gap: 12px;
      transition: all 0.2s;
    }

    .poynts-task-item:hover {
      border-color: rgb(75, 85, 99);
      background: rgb(37, 48, 63);
    }

    .poynts-task-item.completed {
      border-color: rgb(22, 163, 74);
      background: rgba(22, 163, 74, 0.1);
    }

    .poynts-task-checkbox {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
    }

    .poynts-task-checkbox.completed {
      background: rgb(22, 163, 74);
    }

    .poynts-task-checkbox.incomplete {
      background: rgb(55, 65, 81);
      border: 2px solid rgb(75, 85, 99);
    }

    .poynts-task-checkbox svg {
      width: 14px;
      height: 14px;
      color: white;
    }

    .poynts-task-content {
      flex: 1;
      min-width: 0;
    }

    .poynts-task-title {
      font-size: 14px;
      font-weight: 600;
      color: white;
      margin: 0 0 4px 0;
    }

    .poynts-task-item.completed .poynts-task-title {
      color: rgb(74, 222, 128);
    }

    .poynts-task-desc {
      font-size: 13px;
      color: rgb(156, 163, 175);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .poynts-task-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
    }

    .poynts-task-duration {
      color: rgb(107, 114, 128);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .poynts-task-duration svg {
      width: 12px;
      height: 12px;
    }

    .poynts-task-points {
      color: rgb(250, 204, 21);
      font-weight: 600;
    }

    .poynts-task-item.completed .poynts-task-points {
      color: rgb(74, 222, 128);
    }
  \`;

  // ============================================
  // ICON SVGs
  // ============================================
  const icons = {
    'user-plus': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>',
    'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>',
    'award': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>',
    'bar-chart': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>',
    'folder': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>',
    'chevron-right': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
    'chevron-left': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>',
    'check': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    'clock': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    'share': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>',
    'mail': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>',
    'video': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
    'message-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
    'trophy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path></svg>',
    'users': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    'clipboard': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',
    'edit': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>',
    'message-square': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'
  };

  // ============================================
  // CREATE DOM ELEMENTS
  // ============================================

  // Inject styles
  const styleElement = document.createElement('style');
  styleElement.id = 'poynts-nav-badge-styles';
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);

  // Create the badge element
  function createBadge() {
    const badge = document.createElement('div');
    badge.id = 'poynts-nav-badge';
    badge.className = 'poynts-nav-badge';
    badge.innerHTML = \`
      <svg class="poynts-nav-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
      </svg>
      <span class="poynts-nav-badge-text">Get Rewarded</span>
    \`;
    return badge;
  }

  // Create campaign card HTML
  function createCampaignCard(category) {
    const isDisabled = category.campaignCount === 0;
    const iconSvg = icons[category.icon] || icons['folder'];

    return \`
      <div class="poynts-campaign-card \${isDisabled ? 'disabled' : ''}" data-category-id="\${category.id}">
        <div class="poynts-campaign-icon">
          \${iconSvg}
        </div>
        <div class="poynts-campaign-content">
          <h3 class="poynts-campaign-name">\${category.name}</h3>
          <p class="poynts-campaign-desc">\${category.description}</p>
          <span class="poynts-campaign-count">
            \${icons['folder']}
            \${category.campaignCount} campaign\${category.campaignCount !== 1 ? 's' : ''}
          </span>
        </div>
        <div class="poynts-campaign-chevron">
          \${icons['chevron-right']}
        </div>
      </div>
    \`;
  }

  // Create task item HTML
  function createTaskItem(task) {
    return \`
      <div class="poynts-task-item \${task.completed ? 'completed' : ''}">
        <div class="poynts-task-checkbox \${task.completed ? 'completed' : 'incomplete'}">
          \${task.completed ? icons['check'] : ''}
        </div>
        <div class="poynts-task-content">
          <h4 class="poynts-task-title">\${task.title}</h4>
          <p class="poynts-task-desc">\${task.description}</p>
          <div class="poynts-task-meta">
            <span class="poynts-task-duration">
              \${icons['clock']}
              \${task.duration}
            </span>
            <span class="poynts-task-points">\${task.completed ? '✓' : '+'}\${task.points} poynts</span>
          </div>
        </div>
      </div>
    \`;
  }

  // Create detail view HTML for a campaign
  function createDetailView(campaign) {
    const progressPercent = (campaign.progress.completed / campaign.progress.total) * 100;
    const tasksHtml = campaign.tasks.map(createTaskItem).join('');

    return \`
      <button class="poynts-back-button" id="poynts-back-btn">
        \${icons['chevron-left']}
        Back to Campaigns
      </button>
      <div class="poynts-detail-header">
        <h2 class="poynts-detail-title">\${campaign.title}</h2>
        <p class="poynts-detail-desc">\${campaign.description}</p>
      </div>
      <div class="poynts-progress-container">
        <div class="poynts-progress-stats">
          <span class="poynts-progress-label">Progress</span>
          <span class="poynts-progress-value">\${campaign.progress.completed}/\${campaign.progress.total} tasks</span>
        </div>
        <div class="poynts-progress-bar">
          <div class="poynts-progress-fill" style="width: \${progressPercent}%"></div>
        </div>
        <div class="poynts-points-info">
          <span class="poynts-points-earned">\${campaign.pointsEarned} poynts earned</span>
          <span class="poynts-points-available">\${campaign.pointsAvailable} available</span>
        </div>
      </div>
      <h3 class="poynts-tasks-title">Campaign Tasks</h3>
      <div class="poynts-task-list">
        \${tasksHtml}
      </div>
    \`;
  }

  // Create the modal element
  function createModal() {
    const overlay = document.createElement('div');
    overlay.id = 'poynts-modal-overlay';
    overlay.className = 'poynts-modal-overlay';

    const campaignCardsHtml = campaignCategories.map(createCampaignCard).join('');

    overlay.innerHTML = \`
      <div class="poynts-modal">
        <div class="poynts-modal-header">
          <h2 class="poynts-modal-title">
            <svg class="poynts-modal-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            Campaigns
          </h2>
          <button class="poynts-modal-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="poynts-modal-body">
          <div class="poynts-list-view" id="poynts-list-view">
            <div class="poynts-campaigns-grid">
              \${campaignCardsHtml}
            </div>
          </div>
          <div class="poynts-detail-view" id="poynts-detail-view">
            <!-- Detail content will be injected here -->
          </div>
        </div>
      </div>
    \`;

    return overlay;
  }

  // ============================================
  // VIEW NAVIGATION
  // ============================================

  function showDetailView(categoryId) {
    const campaign = campaigns.find(c => c.category === categoryId);
    if (!campaign) return;

    const listView = document.getElementById('poynts-list-view');
    const detailView = document.getElementById('poynts-detail-view');

    if (listView && detailView) {
      listView.classList.add('hidden');
      detailView.classList.add('active');
      detailView.innerHTML = createDetailView(campaign);

      // Add back button handler
      const backBtn = document.getElementById('poynts-back-btn');
      if (backBtn) {
        backBtn.addEventListener('click', showListView);
      }
    }

    currentView = 'detail';
    selectedCategoryId = categoryId;
  }

  function showListView() {
    const listView = document.getElementById('poynts-list-view');
    const detailView = document.getElementById('poynts-detail-view');

    if (listView && detailView) {
      listView.classList.remove('hidden');
      detailView.classList.remove('active');
      detailView.innerHTML = '';
    }

    currentView = 'list';
    selectedCategoryId = null;
  }

  // ============================================
  // MODAL CONTROLS
  // ============================================

  function openModal() {
    const overlay = document.getElementById('poynts-modal-overlay');
    if (overlay) {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    const overlay = document.getElementById('poynts-modal-overlay');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
      // Reset to list view when closing
      showListView();
    }
  }

  // ============================================
  // INJECT INTO PAGE
  // ============================================

  function inject() {
    // Find the nav
    const nav = document.querySelector('nav.fixed');
    if (!nav) {
      console.log('[Poynts] Nav not found, retrying...');
      setTimeout(inject, 500);
      return;
    }

    // Find the right side container (where Twin Points badge is)
    const pointsBadge = nav.querySelector('[href="/profile/?tab=vault"]');
    if (!pointsBadge) {
      console.log('[Poynts] Points badge not found, retrying...');
      setTimeout(inject, 500);
      return;
    }

    // Get the parent container of the points section
    const pointsContainer = pointsBadge.closest('.flex.justify-center');
    if (!pointsContainer) {
      console.log('[Poynts] Points container not found, retrying...');
      setTimeout(inject, 500);
      return;
    }

    // Check if badge already exists
    if (document.getElementById('poynts-nav-badge')) {
      console.log('[Poynts] Badge already exists');
      return;
    }

    // Create and inject the badge
    const badge = createBadge();
    pointsContainer.parentNode.insertBefore(badge, pointsContainer);

    // Create and inject the modal
    const modal = createModal();
    document.body.appendChild(modal);

    // Add click handler to badge
    badge.addEventListener('click', openModal);

    // Add click handler to close button
    const closeButton = modal.querySelector('.poynts-modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', closeModal);
    }

    // Add click handler to campaign cards
    const campaignCards = modal.querySelectorAll('.poynts-campaign-card:not(.disabled)');
    campaignCards.forEach(card => {
      card.addEventListener('click', () => {
        const categoryId = card.getAttribute('data-category-id');
        console.log('[Poynts] Campaign category clicked:', categoryId);
        showDetailView(categoryId);
      });
    });

    // Close on overlay click (outside modal)
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    console.log('[Poynts] Nav badge injected successfully');
  }

  // Start injection
  inject();
})();
  `.trim();
}
