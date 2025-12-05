# Chrome Web Store Listing

## Basic Information

**Extension Name:** Poynts Campaign Demo

**Short Name:** Poynts

**Summary (132 characters max):**
Display Poynts loyalty widgets on partner sites. Track rewards, complete challenges, and earn points for your activities.

**Description (16,000 characters max):**
```
Poynts Campaign Demo brings loyalty rewards directly to partner websites you already use.

🎯 KEY FEATURES

• Seamless Integration - Campaign widgets appear naturally within partner websites
• Track Progress - See your campaign completion status in real-time
• Earn Rewards - Complete challenges and activities to earn Poynts
• Non-Intrusive - Widgets only appear on supported partner sites

📱 HOW IT WORKS

1. Install the extension
2. Visit a supported partner website (like twinprotocol.ai)
3. Campaign widgets will automatically appear when available
4. Complete activities to earn Poynts rewards

🔒 PRIVACY FOCUSED

• Only activates on supported partner websites
• No tracking on other websites
• Minimal permissions required
• Your data stays secure

💡 ABOUT POYNTS

Poynts is a loyalty and rewards platform that helps you earn points for activities across partner websites. This extension enables the seamless display of campaign widgets so you never miss an opportunity to earn rewards.

📧 SUPPORT

Questions or feedback? Contact us at support@carepoynt.com

🔗 LINKS

• Website: https://poynts-ai-portal.vercel.app
• Privacy Policy: https://poynts-ai-portal.vercel.app/extension/privacy
```

**Category:** Productivity (or "Shopping" if available)

**Language:** English

## URLs

**Website:** https://poynts-ai-portal.vercel.app/extension

**Privacy Policy:** https://poynts-ai-portal.vercel.app/extension/privacy

**Support URL:** mailto:support@carepoynt.com

## Images Required

### Store Icon (128x128 PNG)
- Already have: `icons/icon128.png`
- Should be high quality, recognizable at small sizes

### Promotional Images

#### Small Promo Tile (440x280 PNG)
- Appears in Chrome Web Store listings
- Should include extension name and brief tagline
- **FILE NEEDED:** `store-assets/promo-small.png`

#### Large Promo Tile (920x680 PNG) - Optional but recommended
- Featured in store promotions
- **FILE NEEDED:** `store-assets/promo-large.png`

#### Marquee Promo Tile (1400x560 PNG) - Optional
- Used for featured extensions
- **FILE NEEDED:** `store-assets/promo-marquee.png`

### Screenshots (1280x800 or 640x400 PNG)
Required: At least 1, recommended: 3-5

**Screenshot 1:** Widget appearing on partner site
**Screenshot 2:** Campaign progress tracker widget
**Screenshot 3:** Rewards/points notification

**FILES NEEDED:**
- `store-assets/screenshot-1.png`
- `store-assets/screenshot-2.png`
- `store-assets/screenshot-3.png`

## Visibility Settings

**Visibility:** Unlisted
- Extension will not appear in Chrome Web Store search
- Only accessible via direct link
- Good for demos and controlled distribution

## Additional Notes

### Single Purpose Description (required for review)
```
This extension displays Poynts loyalty campaign widgets on supported partner websites,
allowing users to track their rewards progress and complete challenges to earn points.
```

### Permission Justifications

**activeTab:** Required to detect when user is on a supported partner website and inject campaign widget content into the page.

**storage:** Required to persist user preferences and track which widgets have been displayed to prevent duplicate loading.

**Host Permission (twinprotocol.ai):** Required to run content scripts on the partner website where campaigns are active.

## Submission Checklist

- [ ] Create Chrome Web Store Developer account ($5 one-time fee)
- [ ] Create promotional images (440x280 minimum)
- [ ] Take screenshots of extension in action
- [ ] Zip extension files (manifest.json, content.js, config.js, icons/)
- [ ] Upload to Chrome Web Store Developer Dashboard
- [ ] Fill in store listing details
- [ ] Set visibility to "Unlisted"
- [ ] Submit for review (typically 1-3 business days)
