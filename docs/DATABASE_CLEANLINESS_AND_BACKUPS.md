# Database Cleanliness and Backup Checklist

This checklist is for HeartsReader production database maintenance. It is intentionally non-destructive.

## Read-Only Audit

Run from the backend folder:

```bash
npm run audit:db:clean
```

The audit checks:

- duplicate user emails
- invalid user records
- duplicate book slugs
- books missing title, slug, cover reference, or chapter metadata
- chapters missing R2 keys
- Chapter 1 not marked free
- paid chapters accidentally marked free
- duplicate Razorpay payment IDs
- duplicate payment provider event IDs
- invalid physical order customer, shipping, item, payment, or order status data
- stale pending physical orders
- orphan purchases and access records
- paid purchases missing `BookAccess` records

The audit does not write, delete, repair, or cancel anything.

## Admin Visibility

Protected admin endpoints:

```http
GET /api/admin/database/audit
GET /api/admin/physical-orders/cleanup-report
GET /api/admin/physical-orders?paymentStatus=pending
GET /api/admin/physical-orders?paymentStatus=failed
GET /api/admin/physical-orders?orderStatus=cancelled
```

Use the cleanup report to review abandoned pending orders before manually cancelling anything.

## Safe Manual Cleanup Rules

- Never delete production orders only because payment is pending.
- Review stale pending orders older than 14 or 30 days before marking them cancelled.
- Keep failed payment records for customer support and payment reconciliation.
- Keep refunded purchases and orders for financial records.
- Do not remove old `pdfStorageKey` values until R2 delivery is fully verified for every book.
- Do not drop indexes automatically in production.

## MongoDB Atlas Backups

Recommended:

- Enable continuous cloud backups for the production cluster.
- Keep point-in-time restore enabled where available.
- Keep at least 7 daily snapshots and 4 weekly snapshots.
- Run a restore test into a non-production cluster once per month.
- Export critical collections monthly:
  - `users`
  - `books`
  - `purchases`
  - `bookaccesses`
  - `physicalorders`
  - `paymenttransactions`
  - `refundrequests`
  - `subscriptions`
  - `subscriptionmembers`

## Incident Recovery Checklist

If payment data looks wrong:

1. Stop manual fulfillment changes.
2. Export affected `paymenttransactions`, `purchases`, and `physicalorders`.
3. Compare Razorpay dashboard payment IDs against MongoDB.
4. Repair only missing access records with the admin repair endpoint after review.

If paid content access looks wrong:

1. Run `npm run audit:db:clean`.
2. Check `missingAccessRecords`.
3. Verify the related `Purchase` status is `paid`.
4. Use `POST /api/admin/database/repair` only for missing access records.

If accidental data deletion is suspected:

1. Stop writes if possible.
2. Identify deletion time window.
3. Restore MongoDB snapshot to a temporary cluster.
4. Diff the affected collections.
5. Reinsert only reviewed records.
