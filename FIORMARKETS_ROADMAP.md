# 🚀 Fior Markets Rebranding & Duplication Roadmap

This document outlines the systematic process, checklist, and cost breakdown for duplicating the **TBI Admin Dashboard** for **Fior Markets (https://www.fiormarkets.com/)**. The goal is a 100% functional clone running on a separate branch, connected to its own database and hosted on Vercel, with entirely rebranded logic, SEO, and AI generation pipelines.

---

## 📊 1. Quote & Cost Breakdown
*   **Original TBI Website Cost:** ₹2,10,000 INR
*   **Duplication & Rebranding Cost:** ₹1,00,000 INR
*   **Estimated Timeline:** 3 Weeks (3 Sprints)
*   **Target:** A clean, fully functional replica tailored for Fior Markets.

| Sprint | Phase | Focus | Cost Breakdown | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** | **Identity, Env & DB** | Env Vars, DB Init, Logos, Social Links | ₹35,000 | ✅ Completed |
| **Sprint 2** | **Localization & AI** | Multi-Language Dictionaries & AI Content Prompts | ₹40,000 | ✅ Completed |
| **Sprint 3** | **Launch, SEO & Payments** | Vercel Hosting, Payment Keys, SEO Init | ₹25,000 | ⏳ Pending |

---

## 📋 2. Client Requirements (Action Needed)
Please provide the following assets to proceed seamlessly. These will be swapped out similarly to `Screenshot 2026-06-29 223726.png`:
- [ ] **Logos:** High-res Logo and Favicon for Fior Markets.
- [ ] **Images:** Any brand-specific placeholder images (About Us, Home Banner).
- [ ] **Social Links:** Links for Fior Markets' Twitter, LinkedIn, and Facebook pages.
- [ ] **Accounts:** Vercel login (or access) and Payment Gateway keys (PayPal, etc.) for the new domain.

---

## 🛠 3. Detailed Change-Log & Tracking (Step-by-Step)

### Phase 1: Identity, Env & DB (Sprint 1 - ₹35,000)
**1. Environment Variables (`.env.local` & Vercel)**
*   **Action:** Update all existing brand variables.
*   **Variables to update:**
    *   `NEXT_PUBLIC_SITE_NAME`: "Fior Markets"
    *   `NEXT_PUBLIC_SITE_SHORT_NAME`: "FM"
    *   `NEXT_PUBLIC_SITE_URL`: "https://www.fiormarkets.com"
    *   `NEXT_PUBLIC_REPORT_PREFIX`: "FM"
    *   `NEXT_PUBLIC_SUPPORT_EMAIL`: "sales@fiormarkets.com" (or client specified)
*   **Status:** ✅ Completed

**2. Database Initialization**
*   **Action:** Connect to a **New** PostgreSQL database instance.
*   **How:** Run `npx prisma db push` / `npx prisma migrate dev`.
*   **Status:** ✅ Completed

**3. Static Asset & Social Links Replacement**
*   **Action:** Overwrite logos and update hardcoded social media links.
*   **Files:** `public/logo.png`, `public/favicon.png`, `Footer.tsx` (for Twitter, LinkedIn, Facebook).
*   **Status:** ✅ Completed

---

### Phase 2: Content, Localization & AI Pipeline (Sprint 2 - ₹40,000)
**4. AI Pipeline Re-Prompting**
*   **Action:** Update System Instructions for OpenAI for content generation.
*   **Target:** Change "TBI" references to "Fior Markets" in generation logic (`src/app/api/...`, `src/prompts/...`).
*   **Status:** ✅ Completed

**5. Dictionary Refactoring (i18n)**
*   **Action:** Replace "The Brainy Insights" with "Fior Markets" across all 7 language blocks (EN, DE, FR, IT, JA, KO, ES) in `src/i18n/dictionaries.ts` or respective locale files.
*   **Status:** ✅ Completed

**6. UI Component Updates & Copyrights**
*   **Action:** Ensure `alt` tags, email links, and hardcoded texts point to Fior Markets.
*   **Status:** ✅ Completed

---

### Phase 3: Launch, SEO & Payments (Sprint 3 - ₹25,000)
**7. SEO Setup**
*   **Action:** Update Metadata, OpenGraph tags, and generate a new `sitemap.xml`.
*   **Status:** ⏳ Pending

**8. Transactional Setup**
*   **Action:** Configure the email `transporter` and update Payment Gateway Config (PayPal/CCAvenue keys).
*   **Status:** ⏳ Pending

**9. Vercel Hosting & Build Verification**
*   **Action:** Link branch `rebranding-fiormarkets` to a new Vercel project and verify `npm run build` runs with 0 errors.
*   **Status:** ⏳ Pending

---

## 🚀 4. Final Delivery Checklist
- [ ] Git branch `rebranding-fiormarkets` created and isolated from `main`.
- [ ] Build passes with 0 errors.
- [ ] Database is completely separated and functional.
- [ ] Website URL `fiormarkets.com` loads correctly.
- [ ] Social links correctly route to Fior Markets pages.
- [ ] AI-generated summary mentions "Fior Markets".
- [ ] Checkout works with the new merchant account.
- [ ] Vercel hosting live.

**Last Updated:** 2026-06-29
