import http from "k6/http";
import { check, sleep } from "k6";

const FRONTEND_URL = __ENV.FRONTEND_URL || "https://heartsreader.com";
const API_URL = __ENV.API_URL || "https://crossed-hearts-final.onrender.com/api";
const TEST_EMAIL = __ENV.TEST_EMAIL || "";
const TEST_PASSWORD = __ENV.TEST_PASSWORD || "";
const ENABLE_PAYMENT_TEST = __ENV.ENABLE_PAYMENT_TEST === "true";
const TEST_BOOK_ID = __ENV.TEST_BOOK_ID || "";

export const options = {
  scenarios: {
    smoke_10_users: {
      executor: "ramping-vus",
      stages: [
        { duration: "30s", target: 10 },
        { duration: "1m", target: 10 },
        { duration: "30s", target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<1500"],
  },
};

const jsonHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export default function () {
  const home = http.get(`${FRONTEND_URL}/`);
  check(home, {
    "homepage status 200": (res) => res.status === 200,
    "homepage under 1.5s": (res) => res.timings.duration < 1500,
  });

  const books = http.get(`${API_URL}/books`);
  check(books, {
    "book listing status 200": (res) => res.status === 200,
    "book listing under 1.5s": (res) => res.timings.duration < 1500,
  });

  const directPaidRead = http.get(`${API_URL}/library/example-book/read/example-chapter`);
  check(directPaidRead, {
    "unauth paid read is blocked": (res) => [401, 403, 404].includes(res.status),
  });

  if (TEST_EMAIL && TEST_PASSWORD) {
    const login = http.post(
      `${API_URL}/auth/login`,
      JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      { headers: jsonHeaders() },
    );
    check(login, {
      "login test did not 5xx": (res) => res.status < 500,
    });

    const token = login.json("accessToken");
    if (token) {
      const library = http.get(`${API_URL}/library`, { headers: jsonHeaders(token) });
      check(library, {
        "library status 200": (res) => res.status === 200,
      });

      if (ENABLE_PAYMENT_TEST && TEST_BOOK_ID) {
        const payment = http.post(
          `${API_URL}/library/${encodeURIComponent(TEST_BOOK_ID)}/payment-intent`,
          JSON.stringify({ currency: "USD" }),
          { headers: jsonHeaders(token) },
        );
        check(payment, {
          "payment intent test did not 5xx": (res) => res.status < 500,
        });
      }
    }
  }

  sleep(1);
}
