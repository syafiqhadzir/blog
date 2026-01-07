# Google Analytics 4 (GA4) Documentation

This document is a comprehensive guide to the Google Analytics 4 (GA4)
implementation for this blog. It covers setup, tracking capabilities, and
reference information.

---

## ⚡ Quick Start - 5 Minutes

### 1. Deploy & Test (Right Now)

```powershell
# Commit the changes
git add .
git commit -m "feat: implement expert-level GA4"
git push

# Wait for GitHub Actions to deploy (~2-3 minutes)
# Watch: https://github.com/syafiqhadzir.dev/blog/actions
```

### 2. Test Immediately

```powershell
# Validate configuration
npm run validate:ga4
```

**Should see:** ✅ All critical validations passed!

### 3. Verify Live (30 seconds)

1. Open: [GA4 Realtime](https://analytics.google.com/analytics/web/)
2. Open: <https://blog.syafiqhadzir.dev> (in another tab)
3. **See yourself in Realtime within 30 seconds** ✓

---

## 📋 Must-Do Admin Setup (15 Minutes)

### Configure Custom Dimensions (10 min)

**Path:** GA4 → Admin → Data display → Custom definitions

**Quick Setup (14 event-scoped + 1 user-scoped = 15 total):**

| Parameter Name     | Display Name     | Scope        |
| :----------------- | :--------------- | :----------- |
| `page_type`        | Page Type        | Event        |
| `content_category` | Content Category | Event        |
| `post_tags`        | Post Tags        | Event        |
| `reading_time`     | Reading Time     | Event        |
| `author_name`      | Author Name      | Event        |
| `publication_year` | Publication Year | Event        |
| `is_amp`           | Is AMP           | Event        |
| `percent_scrolled` | Percent Scrolled | Event        |
| `outbound`         | Outbound Link    | Event        |
| `tag_name`         | Tag Name         | Event        |
| `search_term`      | Search Term      | Event        |
| `file_extension`   | File Extension   | Event        |
| `theme_mode`       | Theme Mode       | Event & User |
| `error_type`       | Error Type       | Event        |

### Mark Conversions (2 min)

**Path:** GA4 → Admin → Events → [Event Name] → Mark as conversion

Mark these:

- [ ] `article_complete`
- [ ] `share`
- [ ] `file_download`
- [ ] `search`
- [ ] `related_post_click`

### Set Data Retention (1 min)

**Path:** GA4 → Admin → Data Settings → Data retention

- Set to: **14 months** (maximum for free tier)

### Enable Enhanced Measurement (30 sec)

**Path:** GA4 → Admin → Data Streams → [Stream] → Enhanced measurement

- Make sure it's: **ON** ✓

---

## 🎯 Implementation Overview

### Architecture

- **Vendor**: `gtag` (Google Analytics 4 for AMP)
- **Script**: `amp-analytics-0.1.js`
- **Protocol**: GA4 Measurement Protocol
- **Consent Mode**: Ready for GDPR/CCPA compliance

### Key Features

- ✅ Pageview tracking with content attribution
- ✅ Granular scroll depth analysis (6 checkpoints)
- ✅ Engagement time measurement (10-minute maximum)
- ✅ Outbound vs. internal link distinction
- ✅ File download tracking
- ✅ Search query analytics
- ✅ 404 error monitoring
- ✅ Reading progress metrics

---

## 📊 Event Tracking Matrix

| User Action          | Event Name           | Key Parameters                  |
| :------------------- | :------------------- | :------------------------------ |
| Page loads           | `page_view`          | `page_type`, `content_category` |
| Scrolls to 50%       | `scroll`             | `percent_scrolled: 50`          |
| Clicks external link | `click`              | `outbound: true`, `link_url`    |
| Clicks internal link | `click`              | `outbound: false`, `link_url`   |
| Uses navigation      | `navigation_click`   | `event_label`, `link_url`       |
| Shares on social     | `share`              | `method`, `content_type`        |
| Clicks tag           | `tag_click`          | `tag_name`                      |
| Searches archive     | `search`             | `search_term`                   |
| Downloads file       | `file_download`      | `file_extension`, `file_name`   |
| Active for 15s       | `user_engagement`    | `engagement_time_msec`          |
| Reads to 100%        | `article_complete`   | `article_title`, `reading_time` |
| Changes theme        | `theme_change`       | `theme_mode`                    |
| Clicks back-to-top   | `back_to_top`        | `event_label: scroll_to_top`    |
| Clicks related post  | `related_post_click` | `link_url`                      |
| Hits 404             | `page_error`         | `error_type: 404_not_found`     |

---

## 🔧 Troubleshooting

### "No data in Realtime"

- Check measurement ID in `_config.yml`: `G-TYLK1PCZPF`
- Verify deployment completed
- Test on deployed site (not localhost)

### "Events not firing"

- Open DevTools → Console → Check for errors
- Verify AMP validation via Google search console or AMP validator

### "Custom dimensions empty"

- Wait 24-48 hours after first events
- Check parameter names match exactly (case-sensitive)

---

**Property ID**: G-TYLK1PCZPF  
**Implementation**: AMP Analytics (gtag vendor)  
**Version**: 2.0.0  
**Last Updated**: January 7, 2026
