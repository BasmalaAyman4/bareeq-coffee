# Bareeq: pre-implementation inspection

Inspected 5 October 2026. Repository: D:\bareeq. No application files changed.

## Verified current architecture
- React 19.2.6 and TypeScript 5.9.3; custom esbuild-wasm build, not Vite.
- scripts/build.mjs builds browser and server bundles, prerenders pages and copies public assets to dist. Browser/server rendering compatibility must be preserved.
- src/router.tsx provides client navigation through history and useSyncExternalStore, with a GitHub Pages base-path special case.
- Public routes: /, /menu, /cakes, /savory, /locations, /cart, /checkout and /product/:slug.
- src/app.tsx wraps pages in CartProvider and Shell and resolves products from local JSON.
- src/data/products.json is the current menu source. Existing text IDs and slugs should remain stable during import; preserve image paths, descriptions and availability. Some prices may be null; these must not become zero-price orderable products.
- CartProvider uses React context and localStorage (bareeq-cart-v1), storing product ID and quantity; quantities cap at 99. There are no variant/modifier selections or server validation.
- CartPage calculates a display subtotal from JSON and prepares a WhatsApp message. No order is persisted and no payment is processed.
- GSAP, Radix UI, Lucide and existing CSS comprise the current presentation dependencies. No Supabase, Zustand or TanStack Query dependency is listed.
- .github/workflows/deploy-pages.yml publishes dist to GitHub Pages. The build rewrites paths when GITHUB_ACTIONS=true. This must be scoped to GitHub Pages specifically before reusing CI for Firebase; otherwise Firebase builds could receive incorrect /bareeq-coffee paths.
- .openai/hosting.json records an existing Sites connection and dist output. Preserve it.
- No Firebase configuration was found in the inspected repository inventory. Existing web.app domain and Firebase project remain unverified. Frontend Firebase deployment and Supabase backend deployment must be documented separately.

## Implementation boundaries
Preserve public layouts, animations, assets and routes. Replace local menu reads with a shared database-backed query layer while handling prerendering, loading, failures and unavailable products. Preserve existing product URLs and provide a cart migration when variants/modifiers are introduced. Add authenticated dashboard routes without rendering private data into static HTML.

Database-backed role checks and current sessions must protect sensitive operations. Checkout must use a transactional database operation behind an Edge Function, current database prices, immutable item snapshots, strict selection validation and idempotency. Separate source from fulfillment. Pending InstaPay payments must not be readable as actionable cashier orders. Only a founder-authorized atomic transition can verify payment and admit an order to preparation.

Private receipt uploads require scoped upload authorization, content validation, limits, non-user-controlled paths and retention that preserves metadata. Durable notification dispatch and queue reconciliation must make notifications optional for order correctness. Reports must use historical order snapshots. Future POS and gateway integration should use provider-neutral adapters and durable events.

## Access blockers
- The filesystem permission request returned read access only for D:\bareeq; write access was not granted. Git status also failed with Permission denied, so working-tree state could not be verified. Do not infer a clean checkout.
- The Supabase connector returned projects: []. It returned one organization, but no project can currently be inspected or deployed to. No project was created and no remote data was changed.
- Required next inputs: writable access to the existing repository, and access to the intended existing Supabase project. Confirm the current Firebase project/domain before deployment. Never send service-role keys in chat or put secrets in frontend code.

## Validation status
Inspection only. No schema, functions, dashboards, checkout integration, push configuration or tests have been implemented or executed. The requested happy-path, adversarial, concurrency, RLS and hosted end-to-end checks remain outstanding. Live iPhone push and hosted deep-link behavior require real deployment/device verification and cannot be claimed from source inspection.
