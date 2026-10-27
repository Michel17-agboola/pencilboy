# Pencilboy — Engineering Cleanup Pass

Date: 2026-10-27

## What changed

### Shared code
- Added `src/lib/format.js` as the single source for Naira/number/date formatting and `slugify()`.
- Removed repeated `money()`, `formatNaira()` and `slugify()` implementations from pages/components.
- Restored one canonical `FALLBACK_CATEGORIES` definition in `src/data/fallback.js`.
- Updated `Header.jsx` and `App.jsx` to consume the shared category/format helpers.

### Catalogue/data access
- Consolidated published catalogue loading in `src/lib/catalogue.js` through `fetchStoreCatalogue()`.
- `App.jsx` no longer duplicates the products/categories Supabase queries.

### Routing / UX / SEO
- Added `src/pages/NotFound.jsx` and a real not-found route instead of silently sending unknown routes to Home.
- Added `src/lib/seo.js` for page titles and meta descriptions.
- Added a global description in `index.html`.
- Fixed the header bag action to navigate to `/bag`.
- Made the footer copyright year dynamic.
- Added horizontal-overflow protection.
- Replaced the checkout `alert()` error with an inline accessible error message.
- Added try/catch handling to customer sign-in/sign-up.

### CSS cleanup
- Consolidated the repeated product-card/image/price patch chain into one canonical product catalogue section.
- Removed multiple duplicated product-card final overrides.
- Removed the repeated generic newsletter popup patch layer that targeted unused alias class names.
- Removed duplicated category-nav scrollbar rules and duplicate header hover rules.
- Cleaned the duplicated PNCHE STUDIIOS divider patch in `Lookbook.css`.
- Reduced `src/index.css` from 5,181 lines to about 4,088 lines without intentionally changing the current catalogue design targets.

### Dead starter files
Removed unused Vite starter files:
- `src/App.css`
- `src/assets/react.svg`
- `src/assets/vite.svg`

### Environment safety
- Added `.env` / `.env.*` to `.gitignore`.
- Added `.env.example` containing only the required variable names.
- The cleaned ZIP intentionally does **not** include the local `.env` file.

## Validation

Passed:
- JavaScript syntax check with Node.
- JSX/JS parse check using the installed TypeScript parser.
- Local import resolution check.
- CSS brace balance/static structure check.

Not run:
- `npm run build`
- `npm run lint`

The environment could not download the project's npm dependencies: the package registry request timed out and offline installation was missing the required Vite React package. Run these locally after `npm install`:

```bash
npm install
npm run lint
npm run build
```

## Deliberately deferred

The large Admin/AdminDashboard/Lookbook React files still need a feature-level component refactor. That should be done as a separate pass rather than blindly splitting code and risking behaviour changes.

Security/RLS also needs a database-side review because frontend admin checks are not a security boundary. No database policies were changed in this pass because the project ZIP does not contain the authoritative Supabase SQL schema/policies.
