# Render Deployment Checklist

Use this when deploying Crossed Hearts to Render.

## Services

The repo includes `render.yaml` with two services:

- `crossed-hearts-api`: Node/Express backend from `Backend`
- `crossed-hearts`: static frontend from `Frontend`

Render looks for `render.yaml` in the repository root. The config uses `rootDir` for each service, which Render supports for monorepos.

## Runtime

Use Node `>=20.19.0` for the backend. The current dependency set includes Mongoose 9 and other packages that do not support Node 16.

## Backend Environment Variables

In Render, open `crossed-hearts-api` and fill every secret marked `sync: false`.

Required before production:

- `MONGO_URI`
- `JWT_SECRET`
- `REGISTRATION_ENCRYPTION_SECRET`
- `LICENSER_JWT_SECRET`
- `READ_TOKEN_SECRET`
- `EMAIL_FROM`
- `BREVO_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_INR_PER_USD`
- `RAZORPAY_WEBHOOK_SECRET`
- `NOTIFY_UPLOAD_SECRET`

Recommended:

- Set `FRONTEND_PUBLIC_URL` to the single canonical customer-facing site URL, for example `https://heartsreader.com`.
- Keep `FRONTEND_URL` as the comma-separated CORS allowlist.
- Set `ADMIN_2FA_REQUIRED=true`.
- Set `ADMIN_IP_ALLOWLIST` to the public IPs allowed to use admin tools.

## PDF Storage Blocker

The production readiness check requires private PDF storage:

- `PDF_STORAGE_DRIVER=s3` or `PDF_STORAGE_DRIVER=r2`
- Fill the matching S3/R2 bucket credentials

The current backend upload and watermark code still reads and writes PDFs from local disk. Before a real production launch, either implement the S3/R2 storage driver or change the readiness policy knowingly for a staging-only deploy. Do not rely on Render's normal filesystem for paid reader PDFs.

Also enable at least one backup flag after MongoDB backups are configured:

- `ATLAS_BACKUP_ENABLED=true`
- or `MONGODB_BACKUP_ENABLED=true`

## Stripe Webhook

After the backend is live, create a Stripe webhook endpoint:

```text
https://crossed-hearts-final.onrender.com/api/webhooks/stripe
```

Select this event:

```text
payment_intent.succeeded
```

Copy the webhook signing secret into Render:

```text
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Razorpay For Indian Users

Set these Render environment variables after your Razorpay account is ready:

```text
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_INR_PER_USD=83.00
RAZORPAY_WEBHOOK_SECRET=...
```

`RAZORPAY_INR_PER_USD` converts the current USD catalog prices into INR checkout amounts. Review this value before launch, or add native INR pricing later.

After the backend is live, create a Razorpay webhook endpoint:

```text
https://crossed-hearts-final.onrender.com/api/webhooks/razorpay
```

Select these events:

```text
payment.captured
payment.failed
refund.created
refund.processed
refund.failed
```

Copy the webhook signing secret into Render as `RAZORPAY_WEBHOOK_SECRET`.

## Custom Domains

If you use custom domains, update these Render env vars:

```text
BACKEND_URL=https://crossed-hearts-final.onrender.com
FRONTEND_URL=https://heartsreader.com,https://www.heartsreader.com
```

Also update the frontend service env var:

```text
CH_API_URL=https://crossed-hearts-final.onrender.com/api
```

Then update Stripe webhook URL to:

```text
https://crossed-hearts-final.onrender.com/api/webhooks/stripe
```

## Verify After Deploy

Open:

```text
https://crossed-hearts-final.onrender.com/health
```

Expected:

- `status` is `ok`
- database is connected
- email is configured
- security is ready
- failing high/critical count is `0`

## Frontend Security Headers

The static frontend service sets security headers in `render.yaml`, including:

- Content Security Policy with API access limited to `https://crossed-hearts-final.onrender.com`
- `frame-ancestors 'none'`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy` disabling camera, microphone, and geolocation
- `X-Content-Type-Options: nosniff`
