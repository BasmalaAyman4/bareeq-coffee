# Bareeq verification record

Executed on 5 October 2026 against project `vdoxjbftaegdjvjpspql`.

## Automated checks completed

- `npm run typecheck` passed.
- `npm test` passed: 21 request-validation and receipt-validation checks.
- `npm run build` passed: 112 static pages generated.
- The deployed API smoke test passed: server menu quote, tampered totals/discounts/roles rejected, invalid quantity rejected, concurrent duplicate checkout returned one order, a saved-order capability resumed only its own order, forged/anonymous staff actions were denied, and InstaPay receipt evidence remained pending verification.
- The rollback-only database suite passed 39 checks. It covered RLS, cashier/founder separation, session revocation, no direct private receipt access, current DB pricing, prices/availability changing during checkout, invalid variants and extras, payment verification concurrency, reject-path queue isolation, cashier-created dine-in/takeaway pricing, status lifecycle, report snapshot integrity, and receipt-file metadata retention.

Machine-readable outcomes are saved in `docs/database-test-results.json` and `docs/http-test-results.json`.

## Final operating checks after deployment

These require a real browser/device and should be completed on the production domain after the latest function and Firebase builds are deployed:

- Founder and Cashier first password change, sign-out and reset behavior.
- Cash website order appearing once in the cashier queue with sound enabled.
- InstaPay receipt upload, Founder confirmation and rejection, then cash-queue admission only after confirmation.
- Founder receipt viewer with an actual transfer destination configured.
- Browser offline/reconnect and dashboard closed/reopened queue recovery.
- Firebase direct refresh of `/dashboard` (legacy `/founder` and `/cashier` aliases remain compatible).
- iPhone Add to Home Screen, user permission flow, push deep link, and denied-permission fallback.
- Scheduled retention after the configured period; it should delete only the private file and retain payment/audit/order records.

The API and database remain the authority in every one of these cases; visual/audio/push notifications are secondary conveniences.
