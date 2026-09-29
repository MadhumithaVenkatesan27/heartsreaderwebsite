# Security Hardening Phase 2

## Implemented

- Admin route denial logging for non-admin users, blocked IPs, and missing admin 2FA.
- Suspicious paid-content access logging for unauthorized read-token, read, preview, and progress attempts.
- Stripe webhook replay protection using `providerEventId`.
- Stripe and Razorpay webhook signature failure logging.
- R2 PDF delivery now prefers `r2Key` over old local `pdfStorageKey`, keeping private PDFs behind the backend.

## Existing Protections Confirmed

- Helmet security headers.
- Production CORS allowlist.
- Login/register/OTP/payment/read-token rate limits.
- Account lockout after repeated failed login attempts.
- OTP attempt lockout.
- JWT access token expiry and hashed refresh token rotation.
- Private R2 bucket access through backend only.
- Minimal public `/health` response.

## Required Production Settings

- `NODE_ENV=production`
- `JWT_SECRET`
- `REGISTRATION_ENCRYPTION_SECRET`
- `ADMIN_2FA_REQUIRED=true`
- `ADMIN_IP_ALLOWLIST` if the admin team has fixed office/VPN IPs
- `STRIPE_WEBHOOK_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `PDF_STORAGE_DRIVER=r2`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`

## Maintenance Checks

- Review `/api/admin/security-events` weekly.
- Review `/api/admin/audit-logs` after admin/order/refund changes.
- Alert on repeated `paid_chapter_without_purchase` or webhook signature failures.
- Rotate payment/R2/API keys after any suspected leak.
- Keep MongoDB Atlas backups enabled and test recovery quarterly.
