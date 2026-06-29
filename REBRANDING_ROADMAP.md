# 🚀 Project Clone & Rebranding Roadmap: End-to-End Guide

This document outlines the systematic process for duplicating the **TBI Admin Dashboard** for a new brand and domain. The goal is to achieve 100% functionality with a completely fresh identity, without migrating old data.

---

## 📊 1. Executive Summary & Costing
*   **Total Project Quote:** ₹90,000 INR
*   **Estimated Timeline:** 3-4 Weeks (3 Sprints)
*   **Target:** A clean, fully functional replica of the current platform under a new domain name.

| Sprint | Phase | Focus | Cost |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | **Identity & Logic** | Env Vars, Logos, Asset Overwrites | ₹35,000 |
| **Sprint 2** | **Localization & AI** | 7-Language Dictionaries & AI Prompts | ₹35,000 |
| **Sprint 3** | **Launch & Payments** | Vercel Setup, Payment Keys, SEO Init | ₹20,000 |

---

## 🛠 2. Detailed Change-Log (Step-by-Step)

### Phase A: Infrastructure & Environment
**1. Environment Variables (`.env.local` & Vercel)**
*   **Action:** Replace all existing brand variables.
*   **Changes:**
    *   `NEXT_PUBLIC_SITE_NAME`: "New Company Insights"
    *   `NEXT_PUBLIC_SITE_SHORT_NAME`: "NCI"
    *   `NEXT_PUBLIC_SITE_URL`: "https://www.newdomain.com"
    *   `NEXT_PUBLIC_REPORT_PREFIX`: "NCI"
    *   `NEXT_PUBLIC_SUPPORT_EMAIL`: "sales@newdomain.com"
*   **Impact:** This is the "Master Switch." Once changed, the website logic will automatically start using the new name for SKUs, Meta Tags, and Links.

**2. Database Initialization**
*   **Action:** Connect to a **New** PostgreSQL instance.
*   **How:** Run `npx prisma db push`.
*   **Impact:** Creates a clean, empty database structure ready for the new domain's reports.

---

### Phase B: Visual & Asset Branding
**3. Static Asset Replacement (`/public`)**
*   **Action:** Overwrite existing files (keeping same filenames).
*   **Files:**
    *   `public/logo.png` → New Logo
    *   `public/favicon.png` → New Favicon
    *   `public/images/about-us-image.jpg` → New Brand Image
*   **Impact:** Instant visual change across all pages without changing <img> tags in code.

**4. UI Component Updates**
*   **File:** `src/components/layout/Footer.tsx` & `Header.tsx`
*   **Action:** Ensure `alt` tags and hardcoded copyright text point to `{process.env.NEXT_PUBLIC_SITE_NAME}`.
*   **Impact:** Every page shows the correct copyright and brand name.

---

### Phase C: Content & Language (The Heavy Lifting)
**5. Dictionary Refactoring**
*   **File:** `src/i18n/dictionaries.ts`
*   **Action:** Replace "The Brainy Insights" with the new site name across all 7 language blocks (EN, DE, FR, IT, JA, KO, ES).
*   **Impact:** Ensures that when a user switches to Japanese or Spanish, they don't see the old brand name in the "About Us" or "Service" sections.

**6. AI Pipeline Re-Prompting**
*   **Files:** `src/prompts/prompt_summarize.txt`, `src/app/api/reports/.../generate-seo/route.ts`
*   **Action:** Update the **System Instructions** for OpenAI. 
    *   *Change:* "You are an AI analyst for The Brainy Insights" → "You are an AI analyst for [New Brand]."
*   **Impact:** Prevents the AI from "hallucinating" the old brand name into the reports it generates. **This is critical for quality control.**

---

### Phase D: Transactional & Financial
**7. Email System**
*   **File:** `src/lib/email.ts`
*   **Action:** Update the `transporter` name and the "From" field.
*   **Impact:** When a customer buys a report, the confirmation email comes from `sales@newdomain.com` instead of the old one.

**8. Payment Gateway Config**
*   **Action:** Update PayPal/CCAvenue Client IDs and Secret Keys in the Vercel environment.
*   **Impact:** Money flows into the new company's bank account.

---

## 📈 3. End-to-End Implementation Workflow

1.  **Clone Repo:** Create a new GitHub branch for the new domain.
2.  **Asset Swap:** Drop the new logo/favicon into the `/public` folder.
3.  **Env Config:** Push the new environment variables to Vercel.
4.  **Dictionary Cleanup:** Run a script to sanitize `dictionaries.ts`.
5.  **Prompt Audit:** Manually review the `.txt` files in `/prompts` to ensure no "TBI" mentions remain.
6.  **DB Push:** Connect the new database and run migrations.
7.  **Payment Verification:** Run a successful $1 transaction in Sandbox mode.
8.  **SEO Launch:** Submit the new `sitemap.xml` to Google Search Console.

---

## 📋 4. Final Delivery Checklist
- [ ] Website URL `newdomain.com` loads correctly.
- [ ] New Logo and Favicon are visible.
- [ ] Admin panel allows creating a report with the new prefix (e.g., `NCI-101`).
- [ ] AI-generated summary correctly mentions the new brand name.
- [ ] Checkout redirects to the new PayPal merchant account.
- [ ] Emails are sent from the new support email address.

---

**Authorized by:** Gemini CLI Architect
**Date:** April 23, 2026
