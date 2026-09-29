# Cloudflare R2 PDF Setup

This backend keeps the R2 bucket private. MongoDB stores only object keys.

## 1. Render environment variables

Set these on the Render backend service:

```env
PDF_STORAGE_DRIVER=r2
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=heartsreader-pdfs
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

Do not put these secrets in frontend code.

## 2. Upload one test PDF to R2

Use this key pattern:

```text
books/{book-slug}/chapter-01.pdf
covers/{book-slug}/cover.jpg
books/{book-slug}/full-volume.pdf
```

Example:

```text
books/sample-book/chapter-01.pdf
covers/sample-book/cover.jpg
books/sample-book/full-volume.pdf
```

## 3. Store only R2 keys in MongoDB

Example `books` document fields:

```json
{
  "title": "Sample Book",
  "slug": "sample-book",
  "coverImageKey": "covers/sample-book/cover.jpg",
  "fullBookR2Key": "books/sample-book/full-volume.pdf",
  "accessStatus": "paid",
  "chapters": [
    {
      "chapterNumber": 1,
      "order": 1,
      "title": "Chapter 1",
      "r2Key": "books/sample-book/chapter-01.pdf",
      "isFree": true,
      "accessStatus": "free",
      "price": 0
    }
  ]
}
```

No PDF binary data should be stored in MongoDB.

## 4. Backend behavior

- Free chapters: backend verifies the chapter is free, fetches the PDF from private R2, watermarks it, then streams it.
- Paid chapters: backend checks logged-in user ownership before fetching from R2.
- R2 keys are never converted into permanent public PDF URLs.
- Local dev still works when `PDF_STORAGE_DRIVER` is not `r2` by using `pdfStorageKey`.

## 5. Test one sample chapter

1. Upload `books/sample-book/chapter-01.pdf` to the private R2 bucket.
2. Update one MongoDB book chapter with `r2Key`.
3. Deploy backend with the Render R2 env vars.
4. Log in as a user.
5. Open the free preview chapter and confirm the PDF loads.
6. Set `isFree: false` and `accessStatus: "paid"` for the chapter.
7. Confirm a user without purchase receives `403`.
8. Purchase the chapter/book.
9. Confirm the purchased user can read it.
