# Multi-Language Support Guide

## Overview

Your healthcare platform now supports **7 languages** including English and 6 major Indian languages:

- 🇬🇧 **English** (en)
- 🇮🇳 **हिंदी Hindi** (hi)
- 🇮🇳 **தமிழ் Tamil** (ta)
- 🇮🇳 **తెలుగు Telugu** (te)
- 🇮🇳 **বাংলা Bengali** (bn)
- 🇮🇳 **मराठी Marathi** (mr)
- 🇮🇳 **ગુજરાતી Gujarati** (gu)

## How It Works

### URL Structure

All pages are now prefixed with a language code:
- English: `http://localhost:3000/en/`
- Hindi: `http://localhost:3000/hi/`
- Tamil: `http://localhost:3000/ta/`
- And so on...

### Language Switcher

A language switcher is available in the header of every page. Users can switch between languages seamlessly, and the content will be translated instantly.

## Implementation Details

### Key Files

1. **`i18n.ts`** - Configuration file that defines supported locales
2. **`messages/[locale].json`** - Translation files for each language
3. **`components/LanguageSwitcher.tsx`** - Language selector component
4. **`middleware.ts`** - Handles locale routing and authentication
5. **`next.config.mjs`** - Next.js configuration with i18n plugin

### Translation Files Structure

Translation files are organized hierarchically:

```json
{
  "common": {
    "appName": "HealthCare Portal",
    "tagline": "Comprehensive Healthcare Management"
  },
  "nav": {
    "login": "Log in",
    "getStarted": "Get Started"
  },
  "home": {
    "hero": {
      "title": "Modern Healthcare",
      "description": "..."
    },
    "features": { ... }
  },
  "auth": {
    "login": { ... },
    "register": { ... }
  }
}
```

## Adding New Translations

### 1. Add Content to Translation Files

Edit the appropriate JSON file in the `messages/` directory:

```json
// messages/en.json
{
  "myNewSection": {
    "title": "My New Title",
    "description": "My description"
  }
}
```

Do the same for all other language files (`hi.json`, `ta.json`, etc.).

### 2. Use Translations in Components

#### Server Components

```tsx
import { useTranslations } from 'next-intl';
import { unstable_setRequestLocale } from 'next-intl/server';

export default function MyPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  const t = useTranslations('myNewSection');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

#### Client Components

```tsx
"use client"

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('myNewSection');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 3. Nested Translations

Access nested keys using dot notation:

```tsx
const t = useTranslations();

// Access home.hero.title
<h1>{t('home.hero.title')}</h1>

// Or scope to a specific section
const heroT = useTranslations('home.hero');
<h1>{heroT('title')}</h1>
```

## Adding a New Language

1. **Add locale to `i18n.ts`**:
```typescript
export const locales = ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'gu', 'kn'] as const;

export const localeNames: Record<Locale, string> = {
  // ... existing languages
  kn: 'ಕನ್ನಡ', // Kannada
};
```

2. **Create translation file**:
Create `messages/kn.json` with all translations.

3. **Test**: Visit `http://localhost:3000/kn/` to see your new language.

## Best Practices

### 1. Keep Keys Consistent
Always use the same keys across all language files.

### 2. Use Namespaces
Organize translations into logical sections:
- `common` - App-wide text
- `nav` - Navigation items
- `home` - Home page content
- `auth` - Authentication pages
- `dashboard` - Dashboard content

### 3. Handle Dynamic Content
For content with variables:

```json
{
  "greeting": "Hello, {name}!"
}
```

```tsx
t('greeting', { name: 'John' })
// Output: "Hello, John!"
```

### 4. Pluralization
```json
{
  "items": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}
```

```tsx
t('items', { count: 0 })  // "No items"
t('items', { count: 1 })  // "One item"
t('items', { count: 5 })  // "5 items"
```

## Testing

### Manual Testing
1. Visit `http://localhost:3000/en/`
2. Use the language switcher to change languages
3. Navigate between pages to ensure translations work
4. Check authentication flows in different languages

### What to Test
- ✅ All text is translated
- ✅ Language switcher works on all pages
- ✅ URLs maintain locale prefix
- ✅ Authentication redirects preserve locale
- ✅ Forms and error messages are translated

## Troubleshooting

### Issue: "Text not translating"
**Solution**: Ensure the translation key exists in all language files.

### Issue: "404 on language switch"
**Solution**: Make sure the page exists in the `[locale]` directory structure.

### Issue: "Falling back to English"
**Solution**: Check that the locale is properly configured in `i18n.ts` and the translation file exists.

## Future Enhancements

- [ ] Add more Indian languages (Kannada, Malayalam, Odia, Punjabi)
- [ ] Implement language detection based on browser preferences
- [ ] Add RTL (Right-to-Left) support for languages that need it
- [ ] Create a translation management dashboard
- [ ] Add professional translations for medical terminology

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [ICU Message Format](https://formatjs.io/docs/core-concepts/icu-syntax/)

## Contribution

To contribute translations:
1. Fork the repository
2. Add/improve translations in `messages/[locale].json`
3. Test your changes
4. Submit a pull request

---

**Made with ❤️ for accessible healthcare** 