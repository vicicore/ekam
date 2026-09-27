# SETU Phase 26 — Full English + Hindi + Marathi Localization Foundation

## Goal

Phase 26 turns the existing language foundation into a reusable localization
system for the entire SETU frontend.

Languages:
- English (`en`)
- Hindi (`hi`)
- Marathi (`mr`)

## Files

- `frontend/src/lib/translations.ts`
- `frontend/src/lib/LanguageProvider.tsx`
- `frontend/src/components/LanguageSwitcher.tsx`
- `frontend/src/components/LocalizedText.tsx`
- `frontend/src/components/Phase26LanguageBar.tsx`
- `frontend/src/app/phase26-demo/page.tsx`
- `frontend/src/app/phase26-demo/phase26.css`
- `frontend/src/app/layout.phase26-snippet.tsx`
- `frontend/src/components/Phase26MigrationGuide.ts`

## Installation

### 1. Language provider

In the existing root layout, wrap the application:

```tsx
<LanguageProvider>
  {children}
</LanguageProvider>
```

Do not create a duplicate root layout.

### 2. Language switcher

Use:

```tsx
import LanguageSwitcher from "@/components/LanguageSwitcher";
```

Then place `<LanguageSwitcher />` in the existing navbar/utility bar.

### 3. Translate UI strings

For client components:

```tsx
const { t } = useLanguage();

<button>{t("applyNow")}</button>
```

For server/static content, pass translated content through the appropriate
client boundary rather than directly reading browser localStorage.

### 4. Demo

Open:

`/phase26-demo`

This is a validation page for the three-language system. It can be removed
after migration.

## What is translated

The package provides a core vocabulary for:
- navigation
- common actions
- application statuses
- service discovery
- schemes
- documents
- grievance
- assistant
- Maharashtra
- privacy messaging
- loading/error/empty states

## What is NOT silently translated

Dynamic official data such as:
- department names
- scheme titles
- eligibility text
- service requirements
- government notices

should not be machine-translated blindly. They should be maintained as
verified multilingual content with language/version metadata.

## Migration plan

Apply `useLanguage().t()` progressively to:
1. NavBar
2. Home
3. Services
4. Schemes
5. Journey pages
6. Vault
7. Grievance
8. Assistant
9. Maharashtra
10. Login/Profile
11. Officer workspace

## Persistence

The selected language is stored in:

`localStorage["setu-language"]`

and `document.documentElement.lang` is updated automatically.

## Accessibility

The switcher has an accessible label and the HTML language attribute changes
with the selected language.

## Production localization

For production, consider moving content into structured translation files or
a CMS/content service with:
- translation status
- source authority
- effective date
- reviewer
- version
- fallback language

This prevents official service information from becoming stale or silently
mistranslated.

## Compatibility

Phase 26 is additive and preserves the existing SETU APIs and routes.
