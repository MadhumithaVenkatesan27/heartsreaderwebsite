# HeartsReader / Crossed Hearts Security Checklist

Last updated: 2026-06-24

## Implemented safeguards

- API rate limits are enabled for global API traffic, login/register, licensor login, OTP verification, OTP resend, password reset, payment creation, payment verification, sensitive actions, admin APIs, support tickets, and PDF uploads.
- Login uses temporary account lockout after repeated failed passwords. The current policy locks after 5 failures and allows retry after 15 minutes.
- Passwords are validated for minimum 8 characters, uppercase, lowercase, number, and special character. Passwords are hashed with bcrypt and plaintext passwords must never be logged or stored.
- JWT access and refresh tokens use environment secrets. Refresh tokens are stored hashed in MongoDB, rotated on refresh, and cleared on logout.
- Helmet security headers, HTTPS enforcement in production, no-store headers for private routes, and JSON/urlencoded request size limits are enabled.
- Production CORS is restricted to `https://heartsreader.com`, `https://www.heartsreader.com`, and `https://crossed-hearts-frontend.onrender.com`. Localhost origins remain allowed for development.
- Request body, params, and query values are sanitized against MongoDB operator injection. Auth, library, admin, support, campaign, physical order, book, notification, and licensor routes validate important inputs.
- Stripe payment unlocks are verified on the backend. The backend checks Stripe status, metadata user/book/chapter ownership, amount, currency, duplicate fulfillment, and webhook signatures.
- Razorpay digital purchases are verified on the backend. The backend verifies checkout signatures, retrieves/captures the payment, checks order notes, amount, currency, user ID, book ID, chapter ID, and duplicate fulfillment before unlocking content.
- Paid chapter access requires authentication, purchase ownership, or a free preview chapter. Read-token flow is in place for future signed-file delivery.
- Admin APIs use role protection, admin audit logging, optional 2FA readiness checks, and optional IP allowlist readiness checks.
- Audit logs are used for registration, login success/failure, OTP flows, password reset, payment events, purchase unlocks, refunds, support/admin actions, and suspicious payment/security events.
- Production error responses hide stack traces and return user-friendly messages while detailed errors remain server-side.

## Required production environment variables

- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `READ_TOKEN_SECRET`
- `FRONTEND_URL=https://heartsreader.com,https://www.heartsreader.com,https://crossed-hearts-frontend.onrender.com`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_INR_PER_USD`
- `EMAIL_FROM`
- `BREVO_API_KEY` or SMTP email settings
- `ADMIN_2FA_REQUIRED=true`
- `ADMIN_IP_ALLOWLIST` when admin access should be limited by IP

## Payment security notes

- Never unlock content from frontend payment success alone.
- Always confirm payment status with Stripe, Razorpay, or through a signed webhook before granting access.
- Keep webhook signature verification enabled and store `STRIPE_WEBHOOK_SECRET` only in Render environment variables.
- Keep Razorpay key secret only in Render environment variables. The frontend should receive only `RAZORPAY_KEY_ID`.
- Duplicate payment intents should not create duplicate unlocks or duplicate invoices.
- Refunded, cancelled, failed, or mismatched payments should remain logged and blocked from content access.
- Razorpay refunds are not automated yet. Handle Razorpay refunds from the Razorpay dashboard or add a backend refund API before relying on automated refunds for INR payments.

## MongoDB backup and recovery readiness

- Enable MongoDB Atlas automated backups or point-in-time restore for the production cluster.
- Document restore steps, expected RPO/RTO, and the person responsible for approving restores.
- Test restore into a separate staging database before relying on backups.
- Export critical operational collections periodically: users, books, purchases, refunds, physical orders, pledges, audit logs, and email logs.
- Do not run destructive restore, delete, or repair commands on production without written confirmation and a fresh backup snapshot.

## Remaining risks and maintenance checks

- Add object storage signed URLs before moving paid PDFs outside the backend server.
- Keep Stripe in test mode until production keys and webhook endpoints are verified.
- Review admin IP allowlist and 2FA enforcement before public launch.
- Run `npm audit --omit=dev` for the backend before each deployment.
- Rotate JWT, read-token, Stripe, and email secrets after any suspected exposure.
- Review audit logs weekly for repeated failed logins, OTP abuse, payment mismatches, and unusual admin actions.
- Keep Render security headers and frontend API base URLs aligned with the live domains.
