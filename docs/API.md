# Crossed Hearts Backend API

Base URL:

```text
http://localhost:5000
```

Auth:

```text
Authorization: Bearer <accessToken>
```

Admin routes require a logged-in user with `role: "admin"`.

## Health

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | Backend, DB, email, security summary |

## Auth

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Public | Create user and send verification |
| POST | `/api/auth/login` | Public | Login user |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | User | Logout |
| GET | `/api/auth/verify-email?token=...` | Public | Verify email by link |
| POST | `/api/auth/verify-email-otp` | Public | Verify email by OTP |
| POST | `/api/auth/resend-verification` | Public | Resend verification |
| POST | `/api/auth/forgot-password` | Public | Send reset link |
| POST | `/api/auth/reset-password?token=...` | Public | Reset password |
| PATCH | `/api/auth/change-password` | User | Change password |
| GET | `/api/auth/me` | User | Current profile |
| PATCH | `/api/auth/me` | User | Update profile name |
| GET | `/api/auth/email-preferences` | User | Get email settings |
| PATCH | `/api/auth/email-preferences` | User | Update email settings |
| GET | `/api/auth/unsubscribe?token=...` | Public | Unsubscribe optional emails |
| POST | `/api/auth/enable-2fa` | User | Enable 2FA |
| POST | `/api/auth/disable-2fa` | User | Disable 2FA |
| POST | `/api/auth/verify-2fa` | Public | Complete 2FA login |

## Books

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/books` | Public | List/search/filter books |
| GET | `/api/books/:bookId` | Public | Book details |
| POST | `/api/books` | Admin | Create book |
| PATCH | `/api/books/:bookId` | Admin | Update book |
| DELETE | `/api/books/:bookId` | Admin | Unpublish book |
| POST | `/api/books/:bookId/chapters/pdf` | Admin | Upload chapter PDF |
| GET | `/api/books/:bookId/reviews` | Public | List reviews |
| POST | `/api/books/:bookId/reviews` | User | Create/update review |
| GET | `/api/books/:bookId/threads` | Public | List discussion threads |
| POST | `/api/books/:bookId/threads` | User | Create discussion thread |
| POST | `/api/books/threads/:threadId/replies` | User | Reply to thread |
| PATCH | `/api/books/threads/:threadId/like` | User | Like/unlike thread |
| GET | `/api/books/:bookId/preview` | Public | Legacy preview stream |
| GET | `/api/books/:bookId/read` | User | Legacy read stream |
| POST | `/api/books/:bookId/notify-upload` | Secret header | Notify users of upload |

## Library

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/library` | User | Purchased library |
| POST | `/api/library/:bookId/payment-intent` | User | Create Stripe payment intent |
| POST | `/api/library/:bookId/purchase` | User | Manual/dev purchase |
| GET | `/api/library/purchases/:purchaseId/invoice.pdf` | User | Download own invoice PDF |
| POST | `/api/library/purchases/:purchaseId/refund` | User | Request refund |
| GET | `/api/library/refunds` | User | List own refunds |
| GET | `/api/library/wishlist` | User | List wishlist |
| POST | `/api/library/:bookId/wishlist` | User | Add wishlist item |
| DELETE | `/api/library/:bookId/wishlist` | User | Remove wishlist item |
| GET | `/api/library/progress` | User | List reading progress |
| PATCH | `/api/library/:bookId/progress/:chapterId` | User | Save reading progress |
| POST | `/api/library/:bookId/read-token/:chapterId` | User | Create short-lived read token |
| GET | `/api/library/:bookId/read/:chapterId` | User | Read protected chapter |
| GET | `/api/library/:bookId/preview/:chapterId` | Public | Read free preview |

## Discovery

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/discovery/collections` | Public | New releases, trending, top-rated, previews |
| GET | `/api/discovery/home` | User | Personalized homepage feed |

## Support

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/support/tickets` | User | Create support ticket |
| GET | `/api/support/tickets` | User | List own tickets |
| GET | `/api/support/tickets/:ticketId` | User | Get own ticket |
| POST | `/api/support/tickets/:ticketId/replies` | User | Reply to own ticket |

## Notifications

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/notifications` | User | List notifications |
| PATCH | `/api/notifications/:notificationId/read` | User | Mark one as read |
| PATCH | `/api/notifications/read-all` | User | Mark all as read |

## Admin

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/admin/stats` | Admin | Admin dashboard stats |
| GET | `/api/admin/system-check` | Admin | Production readiness/security check |
| GET | `/api/admin/database` | Admin | DB collections/index overview |
| POST | `/api/admin/database/indexes` | Admin | Create missing indexes |
| GET | `/api/admin/database/audit` | Admin | Check data integrity |
| POST | `/api/admin/database/repair` | Admin | Repair missing access records |
| POST | `/api/admin/cleanup` | Admin | Clean expired tokens/logs |
| GET | `/api/admin/users` | Admin | List users |
| GET | `/api/admin/users/:userId` | Admin | User detail |
| PATCH | `/api/admin/users/:userId/status` | Admin | Active/blocked/deleted |
| PATCH | `/api/admin/users/:userId/role` | Admin | Change role |
| GET | `/api/admin/activities` | Admin | Activity logs |
| GET | `/api/admin/emails` | Admin | Email logs |
| GET | `/api/admin/purchases` | Admin | Purchases |
| GET | `/api/admin/purchases/:purchaseId/invoice.pdf` | Admin | Download invoice PDF |
| GET | `/api/admin/access` | Admin | Book access records |
| GET | `/api/admin/refunds` | Admin | Refund requests |
| PATCH | `/api/admin/refunds/:refundId/status` | Admin | Approve/reject/process refund |
| GET | `/api/admin/support/tickets` | Admin | List support tickets |
| GET | `/api/admin/support/tickets/:ticketId` | Admin | Ticket detail |
| PATCH | `/api/admin/support/tickets/:ticketId` | Admin | Status/priority/assignee |
| POST | `/api/admin/support/tickets/:ticketId/replies` | Admin | Admin reply |
| GET | `/api/admin/threads` | Admin | List all discussion threads |
| PATCH | `/api/admin/threads/:threadId` | Admin | Publish/hide/lock thread |

## Licensors

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/licensors/login` | Public | Licensor login |
| GET | `/api/licensors/me` | Licensor | Licensor profile |
| GET | `/api/licensors/my-books` | Licensor | Granted books and revenue |

## Webhooks

| Method | Route | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/webhooks/stripe` | Stripe signature | Fulfill paid Stripe payment intents |

## Seed Data

Create demo admin, reader, licensor, books, purchase, review, progress, thread, ticket, and notification:

```powershell
npm run seed
```

Recreate demo data:

```powershell
npm run seed -- --reset
```

Demo logins:

```text
admin@test.com / TestPass1!
reader@test.com / TestPass1!
jane@publisher.com / TestPass1!
```
