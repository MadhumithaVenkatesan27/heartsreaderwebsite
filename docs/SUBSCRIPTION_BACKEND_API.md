# Subscription Backend API

Base URL: `/api`

Authentication uses the existing `Authorization: Bearer <access_token>` user JWT. Admin endpoints use the existing admin JWT protection and admin IP/2FA policy.

## Public Endpoints

### GET `/plans`

Returns active subscription plans.

Response:

```json
{
  "status": "success",
  "data": {
    "plans": [
      {
        "planId": "reader",
        "monthly": { "amount": 12.99, "currency": "USD" },
        "annual": { "amount": 139.99, "currency": "USD" },
        "credits": { "monthly": 1, "annual": 12 },
        "bonusCredits": { "monthly": 0, "annual": 1, "format": "manga" },
        "allowedFormats": ["manga", "novel", "print", "digital"],
        "retailComparison": { "monthly": 17.99, "annual": 215.88 },
        "savings": { "monthly": 5, "annual": 75.89 }
      }
    ]
  }
}
```

### GET `/catalog`

Query filters:

- `format`
- `plan_id`
- `release_status`
- `page`
- `limit`

Returns subscription-eligible titles with pricing, release, cover, volume, and availability data.

## User Endpoints

### POST `/subscribe`

Creates a Stripe-backed subscription payment.

Body:

```json
{
  "planId": "reader",
  "billingCycle": "monthly",
  "shippingAddress": {
    "fullName": "Reader Name",
    "email": "reader@example.com",
    "phone": "5551234567",
    "line1": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "postalCode": "78701",
    "country": "US"
  }
}
```

Notes:

- US ZIP validation is enforced.
- Monthly billing creates a Stripe Subscription.
- Annual billing creates a Stripe PaymentIntent and activates from verified webhook success.
- The backend never trusts frontend payment success.

### GET `/credits`

Returns credit balance, expiring credits, bonus balance, and ledger entries.

### POST `/credits/redeem`

Body:

```json
{ "titleId": "example-title-vol-1" }
```

Validates active subscription, available unexpired credits, allowed format, duplicate redemption, and title availability. A fulfillment order is created after successful redemption.

### POST `/credits/carry-forward`

Compatibility endpoint. Active credits already carry forward until expiry while the subscription remains active.

### GET `/dashboard`

Returns current subscription, available credits, expiring credits, redemption history, and orders.

### GET `/dashboard/picks`

Returns catalog recommendations for the current subscriber and plan.

### GET `/subscriptions/orders`

Returns subscription fulfillment orders for the logged-in user.

### POST `/subscriptions/cancel`

Schedules Stripe subscription cancellation at period end when applicable.

## Stripe Webhooks

Existing endpoint: `POST /api/webhooks/stripe`

Handled subscription events:

- `payment_intent.succeeded` for annual subscription activation
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Webhook signatures are verified with `STRIPE_WEBHOOK_SECRET`.

## Admin Endpoints

Base: `/api/admin/subscription-platform`

- `GET /plans`
- `POST /plans`
- `PUT /plans/:planId`
- `GET /catalog`
- `POST /catalog`
- `PUT /catalog/:titleId`
- `GET /subscriptions`
- `GET /members`
- `PATCH /subscriptions/:subscriptionId`
- `GET /orders`
- `PATCH /orders/:orderId`

All admin actions are protected by `protectAdmin` and logged through admin audit logs.

## Subscription Member Storage

Subscriber users are stored separately from normal user accounts in the `subscriptionmembers` MongoDB collection. The backend explicitly creates this collection on startup, along with the other subscription collections, so they appear in MongoDB after the deployed backend restarts.

MongoDB collection names:

- `subscriptionmembers`
- `subscriptions`
- `subscriptionplans`
- `subscriptioncatalogtitles`
- `creditledgers`
- `subscriptionorders`
- `redemptionhistories`
- `paymenttransactions`

Each member record stores:

- `userId`
- `subscriptionId`
- `name`
- `email`
- `planId`
- `billingCycle`: `monthly` or `annual`
- `status`
- `currentPeriodStart`
- `currentPeriodEnd`
- `stripeCustomerId`
- `stripeSubscriptionId`

The detailed billing/subscription history remains in the `subscriptions` collection, while `subscriptionmembers` is the quick admin/reporting table for "who is a subscription member and which plan/cycle they took."

## Scheduled Jobs

Started automatically with the backend unless `DISABLE_SUBSCRIPTION_JOBS=true`.

Jobs:

- Credit expiry
- Credit forfeiture after cancelled/expired subscriptions
- Scheduled credit grants for active subscriptions whose `nextCreditGrantAt` is due

Interval:

- `SUBSCRIPTION_JOB_INTERVAL_MS`
- default: one hour

## Environment Variables

Required for paid subscriptions:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

Optional:

- `SUBSCRIPTION_CREDIT_EXPIRY_MONTHS`
- `SUBSCRIPTION_JOB_INTERVAL_MS`
- `DISABLE_SUBSCRIPTION_JOBS`

## Security Notes

- Passwords, JWT, refresh tokens, OTP, and account auth remain handled by existing auth backend.
- Subscription APIs use existing auth middleware, rate limiting, Helmet, CORS, request size limits, sanitization, and production error handling.
- Payment state is updated only from backend-created Stripe objects and verified Stripe webhook events.
- Paid PDF direct-download protection remains backend-owned; permanent private PDF URLs should not be exposed. R2/S3 signed URL integration is prepared as a production readiness warning until storage migration is complete.
