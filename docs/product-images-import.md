# Product image import — 6 October 2026

Imported the supplied `Bareeq-Website-Images.zip`: 100 PNG crops at 214 × 214 pixels. Optimized JPEG copies preserve the source resolution under `public/assets/products/`.

99 images matched existing product IDs. All 99 were uploaded to the public `menu-images` bucket under `catalog-20261006/`, downloaded again to verify their sizes, and linked to the corresponding Supabase products. Product names and prices were not changed. Static product data uses the same URLs.

`product-image-manifest.json` records archive filenames; `product-image-matches.json` records product IDs and previous image values. Matching uses normalized names and explicit aliases, with the two Blueberry products distinguished by category.

No supplied image matched Carrot Cake, Watermelon, Japanese Coconut Matcha Blend, or Blueberry Danish. Their previous image values remain unchanged. Whipped Cream has an image but no matching product; no product or price was invented.

The authenticated, fixed-purpose import function was disabled after verification. Its current version returns HTTP 410 and requires platform JWT verification. It is not a reusable public upload endpoint.

Founder menu deletion archives products (`deleted_at`, `active=false`, `available=false`). Menu queries exclude archived products; order-item references and historical snapshots remain intact. The service-only delete function validates the Founder role and active session. Verification used a disposable product inside a transaction that was rolled back: Founder deletion and repeat deletion passed; anonymous deletion was denied. Direct function execution is denied to both anonymous and authenticated client database roles.

The Supabase changes are deployed. The rebuilt frontend still requires Firebase Hosting publication to update the hosted UI.
