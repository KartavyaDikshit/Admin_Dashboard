# Phase 4: Deployment, Infrastructure & Final Validation

## Overview
The final phase involves setting up the new production environment, configuring external integrations (Payments, AI), and performing a full system test to ensure the clone is fully functional.

## 1. Infrastructure Setup (Vercel)
**Action:** Deploy the repository to a new Vercel project.

- **Instructions:**
    1. Connect the GitHub repository to a new Vercel project.
    2. Configure all Environment Variables defined in Phase 1.
    3. Ensure `NEXTAUTH_SECRET` is newly generated.
    4. Connect the domain in Vercel settings and wait for SSL propagation.
- **Impact:** Site becomes accessible on the new domain.

---

## 2. External Services Configuration

### Vercel Blob Storage
- **Action:** Create a new Vercel Blob store or decide if you will share the existing one.
- **Note:** If sharing, ensure `next.config.mjs` allows the existing blob hostname. If new, update `BLOB_READ_WRITE_TOKEN`.

### Payment Gateways (PayPal / CCAvenue)
- **Action:**
    1. **PayPal:** Update the Developer Dashboard with the new `RETURN_URL` and `CANCEL_URL`.
    2. **CCAvenue:** Whitelist the new domain in the merchant dashboard and update environment keys if unique to the domain.
- **Impact:** Prevents "Invalid Merchant" or "Callback Mismatch" errors during checkout.

### OpenAI API
- **Action:** Ensure the OpenAI API key is active and has sufficient quota for SEO generation and translations.

---

## 3. Final End-to-End Sanity Checks
Perform these actions on the **LIVE** new domain:

- [ ] **Core Navigation:** Navigate through Categories -> Reports -> Individual Report. Are all links working and showing the new domain in the address bar?
- [ ] **Checkout Flow:** Add a report to the cart and proceed to the payment selection page. Does the price match?
- [ ] **Form Submission:** Fill out a "Request Sample" form. Do you receive an email? Does the admin dashboard show the new request?
- [ ] **Admin Security:** Log in to `/admin`. Ensure only the new admin database is being accessed.
- [ ] **SEO Validation:** Use Google Search Console to verify the new domain and submit the new sitemap (`/sitemap.xml`).
- [ ] **Performance:** Run a Vercel Speed Insight or Lighthouse test to ensure no asset loading errors (404s on old images).

---

## 4. Post-Launch
- [ ] Decommission the old beta site if no longer needed.
- [ ] Monitor logs for any missed "TBI" or "brainyinsights" references appearing in error messages.
