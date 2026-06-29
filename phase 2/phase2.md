# Phase 2: UI, Assets & Dictionary Updates

## Overview
This phase focuses on the visual and content-driven rebranding of the website. It involves updating all localized text, email templates, and UI components where the brand name is visible to the user.

## 1. Dictionary & Translations (`src/i18n/dictionaries.ts`)
**Action:** Perform a comprehensive text replacement across the entire dictionary file.

- **Instructions:**
    1. Replace all occurrences of `"The Brainy Insights"` with the value of `NEXT_PUBLIC_SITE_NAME`.
    2. Replace all occurrences of `"TBI"` with the value of `NEXT_PUBLIC_SITE_SHORT_NAME`.
    3. Update the `aboutText` and `service` descriptions in all 7 languages. These sections are long and specifically mention the old brand's history and methodology.
- **Impact:** High. This is the primary source of all user-facing text.

---

## 2. File-by-File UI Component Changes

### `src/components/layout/Footer.tsx` & `src/components/new_ui/Footer.tsx`
- **Change:**
    1. Update logo `alt` text.
    2. Update hardcoded email display (`sales@thebrainyinsights.com` → `sales@newbrand.com`).
    3. Update copyright year/text if hardcoded.
- **Impact:** Updates the bottom of every page.

### `src/components/layout/PublicHeader.tsx` & `src/components/new_ui/Header.tsx`
- **Change:**
    1. Update logo `alt` text.
    2. Update the contact email link in the top bar.
- **Impact:** Updates the top of every page.

### `src/lib/email.ts`
- **Change:**
    1. Update `from` address: `"The Brainy Insights" <sales@thebrainyinsights.com>`.
    2. Update hardcoded body text in `sendOrderConfirmation` and `sendEnquiryNotification` where "The Brainy Insights Team" is mentioned.
- **Impact:** Crucial for professional communication under the new brand.

---

## 3. Asset Replacement (`public/`)
**Action:** Replace physical files while keeping the filenames consistent to avoid path errors.

| File Path | Action |
| :--- | :--- |
| `public/logo.png` | Replace with new brand logo (keep dimensions similar). |
| `public/favicon.png` | Replace with new brand favicon. |
| `public/images/dummy-footer-logo.png` | Replace with new brand secondary logo. |

---

## 4. Sanity Checks & Verification
- [ ] **Check 1:** Switch the site language to Spanish/German/Japanese. Is the brand name correct in all headers and footers?
- [ ] **Check 2:** Inspect the browser tab. Is the favicon and page title prefix correct?
- [ ] **Check 3:** Send a test enquiry. Does the confirmation email come from the new email address and mention the new brand?
- [ ] **Check 4:** View the site on mobile. Is the logo appearing correctly in the mobile drawer?
