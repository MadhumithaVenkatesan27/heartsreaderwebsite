const https = require("https");
const EmailLog = require("../models/EmailLog");

const brevoApiConfig = () => ({
  apiKey: String(process.env.BREVO_API_KEY || "").trim(),
  endpoint: process.env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email",
  from: process.env.EMAIL_FROM,
  timeout: Number(process.env.EMAIL_SOCKET_TIMEOUT_MS || 20000),
});

const parseEmailAddress = (value = "") => {
  const match = String(value).match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1].trim() || undefined, email: match[2].trim() };
  }
  return { email: String(value).trim() };
};

const publicFrontendUrl = () => {
  const configured =
    process.env.FRONTEND_PUBLIC_URL ||
    String(process.env.FRONTEND_URL || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)[0];

  return configured || "http://localhost:3000";
};

const safeEmailTransportConfig = () => {
  const config = brevoApiConfig();
  const from = parseEmailAddress(config.from);
  return {
    provider: "brevo-api",
    endpoint: config.endpoint,
    apiKeyConfigured: Boolean(config.apiKey),
    from: config.from || null,
    fromEmail: from.email || null,
    timeout: config.timeout,
  };
};

const emailErrorDetails = (err) => ({
  message: err.message,
  code: err.code,
  statusCode: err.statusCode,
  response: err.response,
});

const smtpErrorDetails = emailErrorDetails;

const logSmtpError = (label, err) => {
  console.error(`${label}:`, emailErrorDetails(err));
};

const verifyEmailTransport = async () => {
  const config = brevoApiConfig();
  if (!config.apiKey) {
    throw new Error("BREVO_API_KEY is required for Brevo API email.");
  }
  if (!parseEmailAddress(config.from).email) {
    throw new Error("EMAIL_FROM is required for Brevo API email.");
  }
  return true;
};

const attachmentToBrevo = (attachment) => {
  if (!attachment) return null;
  const name = attachment.filename || attachment.name;
  const content = attachment.content;
  if (!name || content === undefined || content === null) return null;
  return {
    name,
    content: Buffer.isBuffer(content)
      ? content.toString("base64")
      : Buffer.from(String(content)).toString("base64"),
  };
};

const postBrevoEmail = (payload) => {
  const config = brevoApiConfig();
  const url = new URL(config.endpoint);
  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        port: url.port || 443,
        timeout: config.timeout,
        headers: {
          "api-key": config.apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let parsed = raw;
          try {
            parsed = raw ? JSON.parse(raw) : {};
          } catch (err) {
            // Keep the raw response when Brevo returns non-JSON.
          }

          if (response.statusCode >= 200 && response.statusCode < 300) {
            return resolve(parsed);
          }

          const error = new Error(
            parsed?.message || `Brevo API email failed with HTTP ${response.statusCode}`,
          );
          error.code = parsed?.code;
          error.statusCode = response.statusCode;
          error.response = parsed;
          return reject(error);
        });
      },
    );

    req.on("timeout", () => {
      req.destroy(new Error("Brevo API request timeout"));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
};

const sendEmail = async ({ to, subject, html, type = "general", userId, metadata, attachments }) => {
  const config = brevoApiConfig();
  const sender = parseEmailAddress(config.from);
  const attachmentPayload = (attachments || [])
    .map(attachmentToBrevo)
    .filter(Boolean);

  try {
    if (!config.apiKey) {
      throw new Error("BREVO_API_KEY is required for Brevo API email.");
    }
    if (!sender.email) {
      throw new Error("EMAIL_FROM is required for Brevo API email.");
    }

    const info = await postBrevoEmail({
      sender,
      to: [{ email: to }],
      subject,
      htmlContent: html,
      ...(attachmentPayload.length ? { attachment: attachmentPayload } : {}),
    });

    await EmailLog.create({
      userId,
      to,
      subject,
      type,
      status: "sent",
      providerMessageId: info.messageId || info.messageIds?.[0],
      metadata,
    });

    return info;
  } catch (err) {
    logSmtpError(`Email send failed (${type})`, err);
    try {
      await EmailLog.create({
        userId,
        to,
        subject,
        type,
        status: "failed",
        errorMessage: err.message,
        metadata,
      });
    } catch (logErr) {
      console.error("Email log failed:", logErr.message);
    }
    throw err;
  }
};

const shell = (content) => `
  <div style="margin:0;padding:0;background:#f6f1e8;">
    <div style="font-family:Georgia,'Times New Roman',serif;max-width:640px;margin:auto;padding:28px 16px;color:#231a20;">
      <div style="background:#130f14;border:1px solid #d7b85d;border-radius:14px;overflow:hidden;box-shadow:0 16px 38px rgba(35,26,32,0.16);">
        <div style="padding:24px 28px;border-bottom:1px solid rgba(215,184,93,0.35);background:linear-gradient(135deg,#130f14 0%,#241726 100%);">
          <div style="font-size:23px;letter-spacing:0.08em;text-transform:uppercase;color:#f8e7b0;">Crossed Hearts</div>
          <div style="margin-top:5px;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#a89ab0;">Digital Library</div>
        </div>
        <div style="background:#fffaf1;padding:32px 28px;">
          ${content}
        </div>
        <div style="padding:18px 26px;background:#130f14;color:#c9b98d;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;">
          Crossed Hearts sends account, purchase, and reading updates only for your library experience.
          <br/>Please do not share verification codes or password reset links with anyone.
        </div>
      </div>
      <p style="margin:18px 0 0 0;text-align:center;font-family:Arial,sans-serif;font-size:12px;color:#8d7f72;">Crossed Hearts</p>
    </div>
  </div>
`;

const money = (amount, currency = "USD") => `${currency} ${Number(amount || 0).toFixed(2)}`;

const unsubscribeLink = (token) => {
  if (!token) return "";
  const baseUrl =
    process.env.BACKEND_URL ||
    process.env.API_URL ||
    `http://localhost:${process.env.PORT || 5000}`;

  return `
    <p style="margin-top:28px;font-size:12px;color:#999;">
      You are receiving this because you enabled book update emails.
      <a href="${baseUrl}/api/auth/unsubscribe?token=${token}" style="color:#777;">Unsubscribe</a>
    </p>
  `;
};

const emailTemplates = {
  welcome: (name) => ({
    subject: "Welcome to Crossed Hearts ✨",
    html: shell(`
      <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#b38a2d;">Your reading room is open</p>
      <h1 style="font-size:30px;line-height:1.15;margin:0 0 12px 0;color:#20151d;">Welcome, ${name}.</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Your Crossed Hearts account is ready. Browse the catalogue, purchase titles,
        and access your library from any device.
      </p>
      <a href="${publicFrontendUrl()}/library"
         style="display:inline-block;margin-top:26px;padding:15px 28px;background:#c9a050;color:#130f14;text-decoration:none;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;">
        Go to My Library
      </a>
    `),
  }),

  verifyEmail: (name, token, code) => ({
    subject: "Verify your email - Crossed Hearts",
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Verify your email</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Hi ${name}, use the code below to verify your email address.
      </p>
      <div style="background:#20151d;border:1px solid #d7b85d;padding:24px;border-radius:12px;text-align:center;margin:26px 0;">
        <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;color:#d7b85d;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;">Verification Code</p>
        <p style="font-family:Arial,sans-serif;font-size:32px;font-weight:bold;letter-spacing:9px;color:#fff5d6;margin:0;">${code}</p>
      </div>
      <a href="${publicFrontendUrl()}/verify-email?token=${token}"
         style="display:inline-block;padding:15px 28px;background:#c9a050;color:#130f14;text-decoration:none;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;">
        Verify Email
      </a>
      <p style="margin-top:22px;font-family:Arial,sans-serif;font-size:13px;color:#8a7e88;line-height:1.6;">The code expires in 10 minutes; the link expires in 24 hours.</p>
    `),
  }),

  welcomeVerifyEmail: (name, token, code) => ({
    subject: "Welcome to Crossed Hearts - Verify your account",
    html: `
      <!doctype html>
      <html>
        <head>
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Welcome to Crossed Hearts</title>
        </head>
        <body style="margin:0;padding:0;background:#0b0612;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#0b0612;margin:0;padding:0;width:100%;">
            <tr>
              <td align="center" style="padding:28px 12px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;background:#120B1D;border:1px solid rgba(212,175,55,0.48);border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,0.38);">
                  <tr><td style="height:5px;background:#D4AF37;font-size:0;line-height:0;">&nbsp;</td></tr>
                  <tr>
                    <td align="center" style="padding:32px 28px 22px 28px;background:#120B1D;">
                      <div style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;color:#fff8dd;">Crossed Hearts</div>
                      <div style="margin-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;letter-spacing:0.26em;text-transform:uppercase;color:#D4AF37;">Digital Library</div>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 34px;">
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                        <tr>
                          <td style="height:1px;background:#3a2848;font-size:0;line-height:0;">&nbsp;</td>
                          <td width="70" align="center" style="font-family:Georgia,'Times New Roman',serif;color:#D4AF37;font-size:18px;line-height:1;">|||</td>
                          <td style="height:1px;background:#3a2848;font-size:0;line-height:0;">&nbsp;</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:42px 34px 22px 34px;background:#120B1D;">
                      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;color:#D4AF37;">Welcome to the Crossed Hearts Library</div>
                      <h1 style="margin:14px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:38px;line-height:1.12;font-weight:bold;color:#fff8ee;">Welcome to Crossed Hearts</h1>
                      <div style="margin-top:12px;font-family:Georgia,'Times New Roman',serif;font-size:21px;line-height:1.35;color:#d9c7e8;">Your Library Awaits</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 34px 6px 34px;background:#120B1D;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fbf6ec;border-radius:14px;border:1px solid rgba(212,175,55,0.32);">
                        <tr>
                          <td style="padding:34px 30px 12px 30px;">
                            <p style="margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#392d43;">Thank you for joining <strong style="color:#120B1D;">Crossed Hearts Digital Library</strong>.</p>
                            <p style="margin:0 0 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#51445d;">Verify your email address to activate your account and gain access to exclusive chapters, premium collections, reading progress sync, and future releases from our growing catalogue.</p>
                            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.8;color:#51445d;">Enter the verification code below to continue.</p>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:28px 30px 10px 30px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#120B1D;border:2px solid #D4AF37;border-radius:14px;">
                              <tr>
                                <td align="center" style="padding:28px 18px;">
                                  <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.4;font-weight:bold;letter-spacing:0.22em;text-transform:uppercase;color:#D4AF37;">Verification Code</div>
                                  <div style="margin-top:12px;font-family:Arial,Helvetica,sans-serif;font-size:42px;line-height:1;font-weight:bold;letter-spacing:12px;color:#fff8dd;">${code}</div>
                                  <div style="margin:18px auto 0 auto;width:70px;height:2px;background:#D4AF37;font-size:0;line-height:0;">&nbsp;</div>
                                  <p style="margin:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#d9c7e8;">This code will expire in 10 minutes.<br />For your security, never share this code with anyone.</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding:24px 30px 34px 30px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td align="center" style="border-radius:8px;background:#D4AF37;">
                                  <a href="${publicFrontendUrl()}/verify-email?token=${token}" style="display:inline-block;padding:16px 34px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.2;font-weight:bold;letter-spacing:0.12em;text-transform:uppercase;color:#120B1D;text-decoration:none;border-radius:8px;">Verify Account</a>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:30px 34px 34px 34px;background:#120B1D;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td align="center" style="padding-bottom:18px;">
                            <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="width:9px;height:28px;background:#D4AF37;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td><td style="width:7px;font-size:0;line-height:0;">&nbsp;</td><td style="width:9px;height:28px;background:#6f5687;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td><td style="width:7px;font-size:0;line-height:0;">&nbsp;</td><td style="width:9px;height:28px;background:#D4AF37;border-radius:2px;font-size:0;line-height:0;">&nbsp;</td></tr></table>
                          </td>
                        </tr>
                        <tr><td align="center" style="font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:1.4;color:#fff8dd;">Crossed Hearts Digital Library</td></tr>
                        <tr><td align="center" style="padding-top:8px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#b9a7c9;">Discover stories beyond the page.</td></tr>
                        <tr><td align="center" style="padding-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.7;color:#b9a7c9;">Need help?<br /><a href="mailto:support@thecrossedhearts.com" style="color:#D4AF37;text-decoration:none;">support@thecrossedhearts.com</a></td></tr>
                        <tr><td align="center" style="padding-top:18px;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8f7ba1;">&copy; 2026 Crossed Hearts. All rights reserved.</td></tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  }),
  purchaseConfirmation: ({
    name,
    bookTitle,
    chapterTitles = [],
    amount,
    currency = "USD",
    invoiceNumber,
    purchasedAt = new Date(),
  }) => ({
    subject: `Invoice ${invoiceNumber}: ${bookTitle} - Crossed Hearts`,
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Thank you for your purchase</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">Hi ${name}, your purchase is complete and your reading access has been updated.</p>
      <div style="border:1px solid #e4d7ba;background:#fff;border-radius:10px;padding:20px;margin:26px 0;font-family:Arial,sans-serif;color:#342733;">
        <p style="margin:0 0 8px 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p style="margin:0 0 8px 0;"><strong>Date:</strong> ${new Date(purchasedAt).toLocaleString()}</p>
        <p style="margin:0 0 8px 0;"><strong>Book:</strong> ${bookTitle}</p>
        ${
          chapterTitles.length
            ? `<p style="margin:0 0 8px 0;"><strong>Chapters:</strong> ${chapterTitles.join(", ")}</p>`
            : `<p style="margin:0 0 8px 0;"><strong>Access:</strong> Full book</p>`
        }
        <p style="margin:0;"><strong>Total:</strong> ${money(amount, currency)}</p>
      </div>
      <a href="${publicFrontendUrl()}/library"
         style="display:inline-block;padding:15px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;">
        View Your Library
      </a>
    `),
  }),

  bookUploadNotification: (name, book, chapters = [], unsubscribeToken) => ({
    subject: `New upload: ${book.title} 📚 Crossed Hearts`,
    html: shell(`
      <p style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#b38a2d;">Fresh from the catalogue</p>
      <h1 style="font-size:28px;margin:0 0 12px 0;color:#20151d;">New chapters are available</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Hi ${name}, ${book.title} has new content available.
      </p>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;">
        <strong>Title:</strong> ${book.title}<br/>
        <strong>Author:</strong> ${book.author}<br/>
        ${
          chapters.length
            ? `<strong>Chapters:</strong> ${chapters.map((chapter) => chapter.title).join(", ")}`
            : "Open the catalogue to see what is new."
        }
      </p>
      <a href="${publicFrontendUrl()}/library"
         style="display:inline-block;margin-top:10px;padding:15px 28px;background:#c9a050;color:#130f14;text-decoration:none;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.08em;text-transform:uppercase;">
        View Updates
      </a>
      ${unsubscribeLink(unsubscribeToken)}
    `),
  }),

  physicalOrderConfirmation: ({ name, orderNumber, items = [], subtotal, shippingFee, total, currency = "USD", shippingAddress }) => ({
    subject: `Invoice ${orderNumber}: Physical book order - Crossed Hearts`,
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Your print order invoice</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Hi ${name}, your payment is confirmed and your physical book order has been received.
      </p>
      <div style="border:1px solid #e4d7ba;background:#fff;border-radius:10px;padding:20px;margin:26px 0;font-family:Arial,sans-serif;color:#342733;">
        <p style="margin:0 0 8px 0;"><strong>Invoice / Order:</strong> ${orderNumber}</p>
        ${items
          .map(
            (item) =>
              `<p style="margin:0 0 8px 0;"><strong>${item.title}</strong> - ${item.edition || "Standard"} x ${item.quantity} (${money(Number(item.unitPrice || 0) * Number(item.quantity || 1), currency)})</p>`,
          )
          .join("")}
        <p style="margin:14px 0 8px 0;"><strong>Subtotal:</strong> ${money(subtotal, currency)}</p>
        <p style="margin:0 0 8px 0;"><strong>Shipping:</strong> ${money(shippingFee, currency)}</p>
        <p style="margin:0 0 8px 0;"><strong>Total:</strong> ${money(total, currency)}</p>
        <p style="margin:0;"><strong>Ship to:</strong> ${shippingAddress.fullName}, ${shippingAddress.city}, ${shippingAddress.country}</p>
      </div>
      <p style="margin-top:22px;font-family:Arial,sans-serif;font-size:13px;color:#8a7e88;line-height:1.6;">
        Your invoice PDF is attached. You will receive another email when the order status changes.
      </p>
    `),
  }),

  physicalOrderStatusUpdate: ({ name, orderNumber, fulfillmentStatus, notes }) => ({
    subject: `Order ${orderNumber} update - Crossed Hearts`,
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Your print order has been updated</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Hi ${name}, your Crossed Hearts physical book order has a new shipping status.
      </p>
      <div style="border:1px solid #e4d7ba;background:#fff;border-radius:10px;padding:20px;margin:26px 0;font-family:Arial,sans-serif;color:#342733;">
        <p style="margin:0 0 8px 0;"><strong>Order:</strong> ${orderNumber}</p>
        <p style="margin:0 0 8px 0;"><strong>Status:</strong> ${String(fulfillmentStatus || "").replace(/_/g, " ")}</p>
        ${notes ? `<p style="margin:0;"><strong>Note:</strong> ${notes}</p>` : ""}
      </div>
      <p style="margin-top:22px;font-family:Arial,sans-serif;font-size:13px;color:#8a7e88;line-height:1.6;">
        You can keep this email for your order records.
      </p>
    `),
  }),

  campaignPledgeConfirmation: ({
    name,
    pledgeNumber,
    campaignTitle,
    tierName,
    amount,
    currency = "USD",
    shippingAddress,
  }) => ({
    subject: `Campaign pledge ${pledgeNumber} paid - Crossed Hearts`,
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Your campaign pledge is confirmed</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Hi ${name}, thank you for funding <strong>${campaignTitle}</strong>. Your payment is confirmed and your pledge is now counted toward the print goal.
      </p>
      <div style="border:1px solid #e4d7ba;background:#fff;border-radius:10px;padding:20px;margin:26px 0;font-family:Arial,sans-serif;color:#342733;">
        <p style="margin:0 0 8px 0;"><strong>Pledge:</strong> ${pledgeNumber}</p>
        <p style="margin:0 0 8px 0;"><strong>Reward tier:</strong> ${tierName}</p>
        <p style="margin:0 0 8px 0;"><strong>Total:</strong> ${money(amount, currency)}</p>
        ${
          shippingAddress
            ? `<p style="margin:0;"><strong>Ship to:</strong> ${shippingAddress.line1}, ${shippingAddress.city}, ${shippingAddress.country}</p>`
            : `<p style="margin:0;"><strong>Delivery:</strong> Digital reward</p>`
        }
      </div>
      <p style="color:#5f5360;font-size:15px;line-height:1.7;margin:0;">
        If the campaign does not reach its funding goal, eligible paid pledges will be refunded through the original payment method.
      </p>
    `),
  }),

  campaignRefund: ({
    name,
    pledgeNumber,
    campaignTitle,
    amount,
    currency = "USD",
    reason,
  }) => ({
    subject: `Campaign refund processed: ${pledgeNumber} - Crossed Hearts`,
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Campaign refund processed</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Hi ${name}, your pledge for <strong>${campaignTitle}</strong> has been refunded.
      </p>
      <div style="border:1px solid #e4d7ba;background:#fff;border-radius:10px;padding:20px;margin:26px 0;font-family:Arial,sans-serif;color:#342733;">
        <p style="margin:0 0 8px 0;"><strong>Pledge:</strong> ${pledgeNumber}</p>
        <p style="margin:0 0 8px 0;"><strong>Refund amount:</strong> ${money(amount, currency)}</p>
        <p style="margin:0;"><strong>Reason:</strong> ${reason || "Campaign goal was not reached."}</p>
      </div>
      <p style="color:#5f5360;font-size:15px;line-height:1.7;margin:0;">
        Refund timing depends on your bank or card provider, but Stripe has received the refund request.
      </p>
    `),
  }),

  refundUpdate: ({ name, invoiceNumber, status, amount, currency = "USD", adminNote }) => ({
    subject: `Refund ${status}: ${invoiceNumber} - Crossed Hearts`,
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Refund ${status}</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Hi ${name}, your refund request for invoice ${invoiceNumber} is now ${status}.
      </p>
      <div style="border:1px solid #e4d7ba;background:#fff;border-radius:10px;padding:20px;margin:26px 0;font-family:Arial,sans-serif;color:#342733;">
        <p style="margin:0 0 8px 0;"><strong>Invoice:</strong> ${invoiceNumber}</p>
        <p style="margin:0 0 8px 0;"><strong>Status:</strong> ${status}</p>
        <p style="margin:0 0 8px 0;"><strong>Amount:</strong> ${money(amount, currency)}</p>
        ${adminNote ? `<p style="margin:0;"><strong>Note:</strong> ${adminNote}</p>` : ""}
      </div>
    `),
  }),

  passwordReset: (name, token) => ({
    subject: "Reset your password - Crossed Hearts",
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Password Reset</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">
        Hi ${name}, click the link below to reset your password. This link expires in 1 hour.
      </p>
      <a href="${publicFrontendUrl()}/reset-password.html?token=${token}"
         style="display:inline-block;margin-top:26px;padding:15px 28px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:0.06em;text-transform:uppercase;">
        Reset Password
      </a>
      <p style="margin-top:22px;font-family:Arial,sans-serif;font-size:13px;color:#8a7e88;line-height:1.6;">If you did not request this, ignore this email.</p>
    `),
  }),

  twoFactorCode: (name, code) => ({
    subject: "Your two-factor authentication code - Crossed Hearts",
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">Authentication Code</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">Hi ${name}, here is your one-time code:</p>
      <div style="background:#20151d;border:1px solid #d7b85d;padding:24px;border-radius:12px;text-align:center;margin:26px 0;">
        <p style="font-family:Arial,sans-serif;font-size:32px;font-weight:bold;letter-spacing:8px;color:#fff5d6;margin:0;">${code}</p>
      </div>
      <p style="color:#8a7e88;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;">This code expires in 10 minutes.</p>
    `),
  }),

  securityAlert: ({ name, title, message, ipAddress, userAgent }) => ({
    subject: `${title} - Crossed Hearts`,
    html: shell(`
      <h1 style="font-size:26px;margin:0 0 12px 0;color:#20151d;">${title}</h1>
      <p style="color:#5f5360;font-size:16px;line-height:1.7;margin:0;">Hi ${name}, ${message}</p>
      <div style="border:1px solid #e4d7ba;background:#fff;border-radius:10px;padding:20px;margin:26px 0;font-family:Arial,sans-serif;color:#342733;">
        <p style="margin:0 0 8px 0;"><strong>IP address:</strong> ${ipAddress || "Unknown"}</p>
        <p style="margin:0;"><strong>Device:</strong> ${userAgent || "Unknown"}</p>
      </div>
      <p style="color:#8a7e88;font-family:Arial,sans-serif;font-size:13px;line-height:1.6;">
        If this was not you, reset your password immediately and contact support.
      </p>
    `),
  }),
};

module.exports = {
  sendEmail,
  emailTemplates,
  safeEmailTransportConfig,
  verifyEmailTransport,
  smtpErrorDetails,
  logSmtpError,
};
