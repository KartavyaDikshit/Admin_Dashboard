# Phase 3: Database & SEO Data Migration

## Overview
Even after changing the code, existing database records will still contain absolute URLs and brand names in fields like `canonicalUrl`, `metaTitle`, and `ogImage`. This phase involves a controlled migration of the database content.

## 1. Preparation
**Action:** Create a backup of your PostgreSQL database before running any update scripts.

---

## 2. Database Update Scripts (Prisma/SQL)

### Task A: Replace Domain in URL Fields
**Target Tables:** `Report`, `Category`, `ReportTranslation`, `CategoryTranslation`, `BlogTranslation`.
**Target Fields:** `canonical_url`, `og_image`, `schema_markup`.

**SQL Script Example:**
```sql
UPDATE reports SET canonical_url = REPLACE(canonical_url, 'thebrainyinsights.com', 'newdomain.com');
UPDATE report_translations SET canonical_url = REPLACE(canonical_url, 'thebrainyinsights.com', 'newdomain.com');
UPDATE categories SET canonical_url = REPLACE(canonical_url, 'thebrainyinsights.com', 'newdomain.com');
```

### Task B: Update Branding in Meta Titles
**Action:** Identify records where `metaTitle` ends with `| The Brainy Insights` and replace it.

**Prisma Script Logic:**
```typescript
const reports = await prisma.report.findMany({
  where: { metaTitle: { contains: 'The Brainy Insights' } }
});

for (const report of reports) {
  const newTitle = report.metaTitle.replace('The Brainy Insights', process.env.NEXT_PUBLIC_SITE_NAME);
  await prisma.report.update({
    where: { id: report.id },
    data: { metaTitle: newTitle }
  });
}
```

### Task C: SKU & ReportID Transformation (Optional)
**Caution:** Changing existing SKUs may break external links if they rely on the ID.
**Action:** If required, run a script to update `sku` and `reportId` prefixes from `TBI-` to your new prefix.

---

## 3. Blog & Content Scrubbing
**Action:** Search the `content` and `description` fields in `Report`, `Blog`, and `PressRelease` tables for brand mentions.
- **Why:** Often, market descriptions contain sentences like "According to The Brainy Insights analysis...". These should be replaced or made generic.

---

## 4. Sanity Checks & Verification
- [ ] **Check 1:** Run a SELECT query for "thebrainyinsights" across all tables. Result should be 0.
- [ ] **Check 2:** View an existing report on the new website. View source code (Ctrl+U). Does the `<link rel="canonical">` tag show the new domain?
- [ ] **Check 3:** Check the `og:image` meta tag. Does it point to the new domain's storage path?
- [ ] **Check 4:** Verify that Report IDs in the database still match the logic updated in Phase 1 for consistency.
