# Bareeq source architecture

The source is organized by responsibility. Pages are route entrypoints only; feature folders own behavior and their UI; shared components hold visual primitives reused across the storefront and dashboards.

## Shared foundation

- `src/components/ui/` — one component per primitive: button, input, textarea, select, field, image upload, modal, table, status badge, and quantity.
- `src/types/` — shared domain types.
- `src/lib/` — Supabase client and framework-independent helpers.
- `src/services/` — server API calls and upload services.
- `src/providers/` — React Query and cart providers.
- `src/i18n/` — shared Arabic/English provider, persisted language preference, translations, and automatic RTL/LTR document direction.
- `src/components/ui/language-toggle.tsx` — reusable language switch used by the storefront and both staff dashboards.

## Storefront

- `src/layouts/storefront/` — storefront shell, header, footer, and mobile navigation.
- `src/features/catalog/` — menu queries, product cards, product images, menu control, and image upload.
- `src/features/cart/` — cart state and cart hook.
- `src/features/checkout/` — checkout hook, cart items, checkout form, confirmation, receipt upload, and summary.
- `src/features/home/` — homepage sections and menu-story behavior.
- `src/pages/` — thin route adapters such as home, menu, product, cart, and the dashboard aliases.

## Operations dashboards

- `src/features/dashboard/layout/` — dashboard layout, sidebar, header, and footer.
- `src/features/auth/` — staff login, session hook, and Founder password management.
- `src/features/orders/` — order display rules, queue query, alerts, order table, and detail modal.
- `src/features/reports/` — daily report.
- `src/features/settings/` — café settings.
- `src/features/counter/` — counter order hook, menu, options dialog, cart, and payment action.

Each feature keeps server state in a hook, mutations in a service, and reusable visual pieces in a component. A page should compose these pieces and avoid owning a large form, table, sidebar, or workflow.

## Language behavior

The `I18nProvider` wraps the whole application. It stores the selected language in `localStorage` under `bareeq-language-v1`, chooses Arabic automatically for an Arabic browser on first use, and sets the document `lang` and `dir` attributes. Interface labels use the shared `useI18n().t()` helper; product names and descriptions remain database content so they can be translated as catalog data later without changing the UI architecture.
