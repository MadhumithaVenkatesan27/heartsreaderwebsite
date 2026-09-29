# HeartsReader Production Audit - 2026-06-25

Scope:

- Frontend: `https://heartsreader.com`
- Backend: `https://crossed-hearts-final.onrender.com`
- Audit type: security, privacy, payment, paid-content, performance, and load-readiness review.

## Executive Summary

The platform has strong baseline controls in the backend: Helmet, rate limiting, input validation, bcrypt password hashing, account lockout, backend payment verification, webhook signature verification, purchase checks before paid reads, and admin route protection.

Highest-priority production risks found:

- **Critical:** Live backend reported `environment: "development"` before this fix. This failed the high-severity `nodeEnv` readiness check and caused `security.ready=false` with `failingHighOrCritical=1`.
- **High:** `/health` exposed MongoDB database name/host, email provider details, and security readiness details when the live service ran outside `NODE_ENV=production`.
- **High:** CORS rejected unknown origins by returning HTTP 500 instead of a clean non-CORS response.
- **High:** Frontend API URL resolver could return `undefined` on production pages that do not inject `window.CH_API_URL`, causing stuck loading/API failures.
- **Medium:** Browser localStorage persisted user profile and purchased library state by email.
- **Medium:** Frontend docs contained sample backend secret patterns and an unsafe wildcard CORS recommendation.

## Live Checks Performed

Safe GET checks only:

- `GET https://heartsreader.com/` returned `200`, about `89 KB` HTML.
- `GET https://crossed-hearts-final.onrender.com/health` returned `200`.
- `GET https://crossed-hearts-final.onrender.com/api/books` returned `200`, about `8 KB`.
- `GET /api/books` with `Origin: https://heartsreader.com` returned `200` with allowed origin.
- `GET /api/books` with `Origin: https://evil.example` returned `500` before the CORS fix.

Lighthouse was not run locally because Chrome/Lighthouse is not installed in this workspace. k6 is also not installed locally, so load testing was not executed from this machine. Use the load/performance plan below for reproducible results.

## Security Findings

### Critical

- Live backend reported `environment: "development"` before this fix.
  - Risk: production may expose development-only details and bypass production readiness assumptions.
  - Failing check: `nodeEnv` in `Backend/src/services/securityService.js`.
  - Fixed in code: Render runtime now forces `NODE_ENV=production` if Render starts the service without it.
  - Required in Render: also set `NODE_ENV=production` and `PRODUCTION_READINESS_LOCK=true` on the live service.

### High

- Health endpoint leaked MongoDB host/database, email provider, and security readiness details when `NODE_ENV` was not production.
  - Fixed: public `/health` now returns only `status` and `timestamp`.
  - Detailed database/email/security health moved to protected `GET /api/admin/health`.

- CORS rejected unknown origins with a 500 error.
  - Fixed: disallowed origins now get no CORS grant instead of throwing a server error.

- Frontend API resolver had unreachable/incorrect logic.
  - Fixed: production fallback now consistently uses `https://crossed-hearts-final.onrender.com/api`.

- OTP verification had expiry and endpoint rate limits, but no per-email OTP attempt counter.
  - Fixed: OTP verification now locks after 5 invalid attempts for 10 minutes and logs suspicious activity.

### Medium

- Browser storage persisted user identity and library state in `localStorage`.
  - Fixed: user identity and purchased library state now use session storage only; old localStorage library keys are removed during sync/logout.

- Frontend README contained sample backend secret patterns and wildcard CORS guidance.
  - Fixed: docs now warn that secrets belong only in backend env vars and CORS must use trusted origins.

- Frontend static CSP/cache headers are present in `render.yaml`, but the live frontend response did not show the CSP header during this audit.
  - Action: redeploy the Render static frontend service and re-check response headers.

### Low

- Admin dashboard frontend displays some placeholder internal-looking emails in static demo sections.
  - Action: replace demo data with neutral placeholders or only render real backend data after admin auth.

## Payment Security

Controls verified in code:

- Stripe payment success is verified server-side before unlock.
- Stripe webhook signatures use `stripe.webhooks.constructEvent`.
- Razorpay checkout signatures are verified server-side.
- Razorpay webhook signatures are verified server-side at `POST /api/webhooks/razorpay`.
- Amount, currency, user ID, book ID, chapter ID, and order IDs are checked before fulfillment.
- Duplicate digital unlocks are prevented by Stripe payment intent ID, Razorpay payment ID, and provider/reference indexes.
- Physical orders now support Razorpay verification for Indian shipping addresses and Stripe for others.
- No card numbers/CVV are stored in MongoDB; card handling stays with payment providers.

Remaining payment risks:

- Razorpay refund webhook events are logged for monitoring; automated Razorpay refund creation is still manual/admin process.
- Stripe/Razorpay test-mode load tests must never confirm live charges.

## Paid Content Protection

Controls verified in code:

- Paid chapter read routes require auth.
- Paid read checks call `ownsChapter`/`ownsBook`.
- Preview route only allows free/preview chapters.
- Read-token flow exists for paid PDFs.

Remaining content risk:

- Local-disk PDF serving should be replaced with S3/R2 private objects and signed URLs before full production scale.
  - Current status: missing private PDF storage and storage credentials are high production readiness warnings, but they do not block deployment while cloud storage integration is unfinished.
  - Action: continue using purchase verification now; migrate storage before a larger paid-content launch.

Admin hardening risk:

- Admin 2FA is recommended before a larger production launch.
  - Current status: missing `ADMIN_2FA_REQUIRED=true` is a high production readiness warning, but it does not block deployment yet.
  - Action: enable admin 2FA after the current deployment is stable.

## Privacy And Compliance

Privacy risks checked:

- User email/purchase history are exposed only through authenticated user/admin APIs.
- Admin APIs are protected server-side.
- Browser token is in `sessionStorage`; refresh token uses httpOnly cookie.
- Persistent browser storage of user/library data was reduced.

Legal pages found:

- Terms: `Frontend/terms.html`
- Privacy Policy: `Frontend/privacy.html`
- Refund Policy: `Frontend/refund-policy.html`

Recommended:

- Add a Cookie Policy if analytics, tracking pixels, ad tags, or non-essential cookies are enabled.
- Update Privacy Policy to mention Razorpay as a payment processor.
- Add explicit content usage / anti-piracy language if not already covered in Terms.

## Performance Findings

- Homepage HTML is about `89 KB`, acceptable but asset size still needs Lighthouse/WebPageTest confirmation.
- Static frontend response is edge cached, but live CSP/cache headers did not match `render.yaml`.
- Backend public book listing returned about `8 KB`.
- Many static pages load `script.js`; cache-busting and short JS caching are important after payment changes.
- MongoDB has useful indexes for users, purchases, books, notifications, activities, orders, and content access.

Performance fixes applied:

- Added static cache headers in `render.yaml`:
  - Images: long immutable cache.
  - CSS: 1 hour with revalidation.
  - JS: 5 minutes with revalidation.

Recommended next performance work:

- Run Lighthouse on mobile and desktop after redeploy.
- Compress/resize large images and convert suitable assets to WebP/AVIF.
- Add lazy loading to catalogue/detail images where missing.
- Consider backend compression middleware if Render is not compressing API responses.
- Add pagination/limits to any remaining unbounded admin or user-facing lists.

## Load Readiness

Added safe k6 script:

- `load-tests/k6-heartsreader-smoke.js`

Safe run examples:

```bash
k6 run load-tests/k6-heartsreader-smoke.js
k6 run -e TEST_EMAIL=user@example.com -e TEST_PASSWORD=... load-tests/k6-heartsreader-smoke.js
k6 run -e ENABLE_PAYMENT_TEST=true -e TEST_BOOK_ID=<book-or-slug> -e TEST_EMAIL=... -e TEST_PASSWORD=... load-tests/k6-heartsreader-smoke.js
```

Safe production limits:

- Start at 10 virtual users.
- Run 50 users only after 10-user test error rate is below 2%.
- Run 100 users only in test/staging or during an approved production window.
- Do not run payment confirmation or live charging in load tests.

Report these metrics:

- Average response time.
- p95 response time.
- Error rate.
- Failed requests.
- 4xx/5xx breakdown.

## Customer Complaint Monitoring Plan

Track and tag support tickets for:

- Login failures and account lockouts.
- OTP delivery delays/failures.
- Payment creation/verification failures.
- Paid content access failures after payment.
- Website downtime.
- Slow loading or infinite loading.

Operational signals:

- Rate of `login_failed`.
- Rate of `verification_resent`.
- Rate of `payment_security_blocked`.
- Rate of `suspicious_activity`.
- Backend health readiness status.
- Email delivery failure logs.

## Incident Response Plan

Payment issue:

- Pause affected payment provider if needed.
- Verify provider dashboard status.
- Compare payment reference against MongoDB purchase/order.
- Manually unlock only after provider confirms capture/success.
- Record support ticket and audit log.

Suspected data leak:

- Rotate JWT, email, payment, storage, and database secrets.
- Disable affected admin/user accounts.
- Export relevant audit logs.
- Preserve evidence and notify affected users if legally required.

Website down:

- Check Render service status and `/health`.
- Check MongoDB connectivity.
- Roll back latest deploy if failure started after release.
- Post customer-facing status update.

Paid content leaked:

- Revoke exposed URLs/objects.
- Rotate read-token secret if signed URLs/tokens are involved.
- Move affected PDFs to private object storage.
- Review access logs and user purchase/access history.

Unauthorized admin access:

- Disable admin account.
- Revoke refresh token/session.
- Rotate admin credentials and enforce 2FA/IP allowlist.
- Review `AdminAuditLog` and `UserActivity`.

## Files Changed During Audit

- `Backend/src/index.js`
- `Backend/src/controllers/authController.js`
- `Backend/src/models/PendingRegistration.js`
- `Backend/src/models/User.js`
- `Backend/src/models/UserActivity.js`
- `Frontend/script.js`
- `Frontend/checkout.html`
- `Frontend/dashboard.html`
- `Frontend/licenser-login.html`
- `Frontend/licenser.js`
- `Frontend/README.md`
- `render.yaml`
- `load-tests/k6-heartsreader-smoke.js`
- `docs/PRODUCTION_AUDIT_2026-06-25.md`

## Retest Checklist

- Redeploy backend with `NODE_ENV=production` and `PRODUCTION_READINESS_LOCK=true`.
- Confirm `/health` returns only `status` and `timestamp`.
- Confirm `/api/admin/health` rejects normal/anonymous users and returns detailed checks only for admins.
- Confirm unknown CORS origins do not return 500 and do not receive `Access-Control-Allow-Origin`.
- Register a test user and submit 5 bad OTPs; expect temporary lock.
- Resend OTP and verify the attempt counter resets.
- Login/logout and confirm tokens are cleared from session storage.
- Confirm paid read URLs return 401/403/404 without purchase.
- Confirm Stripe payment intent creation works in test mode.
- Confirm Razorpay order creation works in test mode for India.
- Run k6 smoke test at 10 users only.
