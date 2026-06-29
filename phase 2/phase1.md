# Phase 1: Core Logic & Environment Refactoring

## Overview
The goal of this phase is to eliminate all hardcoded brand identifiers (`TBI`, `The Brainy Insights`) and domain names (`thebrainyinsights.com`) from the application logic and replace them with dynamic environment variables or a centralized configuration.

## 1. Environment Variables Setup
**Action:** Add/Update the following variables in your `.env.local` and Vercel dashboard.

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_NAME` | The full brand name | "New Brand Insights" |
| `NEXT_PUBLIC_SITE_SHORT_NAME` | Shortened brand name | "NBI" |
| `NEXT_PUBLIC_SITE_URL` | The production URL | "https://www.newbrand.com" |
| `NEXT_PUBLIC_REPORT_PREFIX` | Prefix for Report IDs | "NBI" |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Primary contact email | "sales@newbrand.com" |

---

## 2. File-by-File Instructions

### `src/lib/utils.ts`
- **Change:** In `generateSKU`, replace `const prefix = 'TBI'` with `const prefix = process.env.NEXT_PUBLIC_REPORT_PREFIX || 'NBI'`.
- **Impact:** Ensures newly generated SKUs follow the new brand naming convention.

### `src/app/api/reports/route.ts` & `src/app/api/reports/[id]/route.ts`
- **Change:** Locate the `POST` and `PATCH` methods where `reportId` is generated (e.g., `reportId = TBI-${randomNum}`). Replace the `TBI-` string with `${process.env.NEXT_PUBLIC_REPORT_PREFIX}-`.
- **Impact:** Fixes the hardcoded prefix in the API generation logic.

### `src/app/api/reports/[id]/generate-seo/route.ts`
- **Change:**
    1. Update the OpenAI prompt: Replace `Base Domain: "https://www.brainyinsights.com"` with `Base Domain: "${process.env.NEXT_PUBLIC_SITE_URL}"`.
    2. Update the `ogImage` construction logic: Replace the hardcoded URL string with `${process.env.NEXT_PUBLIC_SITE_URL}/upload/${report.slug}.jpg`.
- **Impact:** Critical for ensuring AI-generated SEO metadata doesn't contain the old domain.

### `src/app/robots.ts` & `src/app/sitemap.ts`
- **Change:** Replace hardcoded fallbacks to `brainyinsights.com` with `process.env.NEXT_PUBLIC_SITE_URL`.
- **Impact:** Ensures search engines crawl the correct domain.

### `next.config.mjs`
- **Change:** Update `images.remotePatterns`. Replace `your-domain.com` with the actual new domain.
- **Impact:** Prevents Next.js image optimization errors on the new domain.

---

## 3. Sanity Checks & Verification
- [ ] **Check 1:** Create a new report in the admin panel. Does the ID start with the new prefix?
- [ ] **Check 2:** Trigger the "Generate SEO" action for a report. Does the generated Schema Markup and OG Image URL point to the new domain?
- [ ] **Check 3:** Visit `/robots.txt`. Does the sitemap link point to the new domain?
- [ ] **Check 4:** Search for "TBI" and "thebrainyinsights" in the `src/app/api` and `src/lib` folders. Zero results should return for logic-related code.
