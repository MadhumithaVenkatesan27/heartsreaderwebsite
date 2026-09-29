/* ---- DATA ---- */
const SERIES_DATA = [
  {
    id: "grenimal",
    name: "The Executioner of Grenimal",
    cat: "manga",
    genre: "Action · Fantasy",
    launch: "2024-05-01",
    volumes: 2,
    buyers: 3240,
    revenue: 81000,
    trend: 42,
  },
  {
    id: "chigaya",
    name: "You're Way Too Cheeky, Chigaya-kun!",
    cat: "manga",
    genre: "Romance · School Life",
    launch: "2024-02-01",
    volumes: 2,
    buyers: 2891,
    revenue: 72275,
    trend: 8,
  },
  {
    id: "matchmaker",
    name: "The Matchmaker's Fiancé",
    cat: "manga",
    genre: "Romance · Fantasy",
    launch: "2024-05-01",
    volumes: 1,
    buyers: 2650,
    revenue: 46375,
    trend: 15,
  },
  {
    id: "connie",
    name: "All-Rounder Maid Connie Ville",
    cat: "manga",
    genre: "Romance · Fantasy",
    launch: "2024-05-01",
    volumes: 2,
    buyers: 2198,
    revenue: 54950,
    trend: 5,
  },
  {
    id: "pale",
    name: "A Pale Moon Reverie",
    cat: "manga",
    genre: "Romance · Fantasy",
    launch: "2025-10-01",
    volumes: 1,
    buyers: 1410,
    revenue: 24675,
    trend: 11,
  },
  {
    id: "royal",
    name: "The Royal's Secret",
    cat: "manga",
    genre: "Romance · Fantasy",
    launch: "2025-10-01",
    volumes: 1,
    buyers: 1280,
    revenue: 22400,
    trend: 9,
  },
  {
    id: "borrowing",
    name: "Borrowing Your Textbook 175160",
    cat: "glambeat",
    genre: "Yuri · Romance",
    launch: "2024-05-01",
    volumes: 1,
    buyers: 1870,
    revenue: 32775,
    trend: 19,
  },
  {
    id: "timecloset",
    name: "Time is a Closet",
    cat: "glambeat",
    genre: "Fantasy · Yuri",
    launch: "2024-05-01",
    volumes: 1,
    buyers: 1620,
    revenue: 28350,
    trend: -3,
  },
  {
    id: "afternoontea",
    name: "Afternoon Tea for Two",
    cat: "glambeat",
    genre: "Slice-of-Life · Yuri",
    launch: "2024-05-01",
    volumes: 1,
    buyers: 1200,
    revenue: 21000,
    trend: 7,
  },
  {
    id: "until-fall",
    name: "Until We Fall in Love",
    cat: "blushclub",
    genre: "Romance · BL",
    launch: "2025-09-01",
    volumes: 1,
    buyers: 1740,
    revenue: 30450,
    trend: 31,
  },
  {
    id: "king-owls",
    name: "The King of Owls and His Troubled Servant",
    cat: "blushclub",
    genre: "Fantasy · BL",
    launch: "2025-09-01",
    volumes: 1,
    buyers: 1510,
    revenue: 26425,
    trend: 22,
  },
  {
    id: "roommate",
    name: "Roommate",
    cat: "blushclub",
    genre: "Drama · BL",
    launch: "2025-10-01",
    volumes: 2,
    buyers: 1350,
    revenue: 23625,
    trend: -2,
  },
  {
    id: "bird-cage",
    name: "The Bird in the Cage Dreams",
    cat: "blushclub",
    genre: "BL · Historical",
    launch: "2025-09-01",
    volumes: 1,
    buyers: 1090,
    revenue: 19075,
    trend: 4,
  },
  {
    id: "gaze",
    name: "A Gaze Like Lightning",
    cat: "blushclub",
    genre: "Drama · BL",
    launch: "2025-09-01",
    volumes: 1,
    buyers: 980,
    revenue: 17150,
    trend: -7,
  },
  {
    id: "zombie",
    name: "The Abandoned Villainess Became a Zombie",
    cat: "novel",
    genre: "Fantasy · Comedy",
    launch: "2025-04-01",
    volumes: 2,
    buyers: 1980,
    revenue: 49500,
    trend: 14,
  },
  {
    id: "raeliana",
    name: "Why Raeliana Ended Up at the Duke's Mansion",
    cat: "novel",
    genre: "Romance · Fantasy",
    launch: "2025-05-01",
    volumes: 2,
    buyers: 2410,
    revenue: 60250,
    trend: 6,
  },
  {
    id: "sister",
    name: "Sister Mafioso",
    cat: "novel",
    genre: "Fantasy · Mafia",
    launch: "2025-11-01",
    volumes: 1,
    buyers: 890,
    revenue: 22275,
    trend: 48,
  },
];

const SESSIONS_DATA = [
  {
    reader: "Alice W.",
    status: "online",
    title: "The Executioner of Grenimal Vol.1",
    progress: 45,
    time: "12m",
    device: "Mobile",
  },
  {
    reader: "John Doe",
    status: "idle",
    title: "All-Rounder Maid Connie Ville Vol.2",
    progress: 80,
    time: "45m",
    device: "Desktop",
  },
  {
    reader: "MangaFan99",
    status: "online",
    title: "You're Way Too Cheeky, Chigaya-kun! Vol.1",
    progress: 12,
    time: "3m",
    device: "Mobile",
  },
  {
    reader: "Sarah J.",
    status: "online",
    title: "A Royal Rebound",
    progress: 100,
    time: "1h 20m",
    device: "Tablet",
  },
  {
    reader: "Reader_X",
    status: "idle",
    title: "Sister Mafioso",
    progress: 60,
    time: "28m",
    device: "Desktop",
  },
  {
    reader: "k_reader22",
    status: "online",
    title: "Until We Fall in Love",
    progress: 33,
    time: "18m",
    device: "Mobile",
  },
  {
    reader: "nova_reads",
    status: "online",
    title: "Time is a Closet",
    progress: 71,
    time: "34m",
    device: "Mobile",
  },
];

const TOP_TITLES = [
  {
    name: "The Executioner of Grenimal",
    cover: "Images/Grenimal-vol 1.png",
    views: "12.4k",
    change: 42,
  },
  {
    name: "You're Way Too Cheeky, Chigaya-kun!",
    cover: "Images/Chigaya-vol 1.png",
    views: "9.8k",
    change: 8,
  },
  {
    name: "The Matchmaker's Fiancé",
    cover: "Images/Matchmaker-vol 1.png",
    views: "8.1k",
    change: 15,
  },
  {
    name: "All-Rounder Maid Connie Ville",
    cover: "Images/Connie-vol 1.png",
    views: "7.5k",
    change: 5,
  },
  { name: "Sister Mafioso", cover: "", views: "5.2k", change: 48 },
];

const TICKER_EVENTS = [
  {
    text: "<strong>MangaFan99</strong> started reading The Executioner of Grenimal",
  },
  { text: "<strong>New signup:</strong> reader_567 joined the platform" },
  {
    text: "<strong>Purchase:</strong> nova_reads bought Until We Fall in Love Vol.1",
  },
  { text: "<strong>Trending:</strong> Sister Mafioso up 48% this week" },
  {
    text: "<strong>Alice W.</strong> completed You're Way Too Cheeky, Chigaya-kun! Vol.2",
  },
  {
    text: "<strong>Purchase:</strong> k_reader22 bought The Executioner of Grenimal Vol.2",
  },
  { text: "<strong>New review:</strong> 5★ for The Matchmaker's Fiancé" },
];

const CMD_ITEMS = [
  {
    // icon: "🏠",
    title: "Overview",
    desc: "Platform overview & KPIs",
    page: "overview",
  },
  {
    // icon: "👥",
    title: "Readers Analytics",
    desc: "Growth, cohorts, segmentation",
    page: "readers",
  },
  {
    // icon: "💰",
    title: "Revenue Intelligence",
    desc: "Revenue by series & genre",
    page: "revenue",
  },
  {
    // icon: "📚",
    title: "Title Performance",
    desc: "Per-title engagement metrics",
    page: "titles",
  },
  {
    // icon: "📈",
    title: "Engagement Insights",
    desc: "Session graphs & streaks",
    page: "engagement",
  },
  {
    // icon: "🕐",
    title: "Reading Behaviour",
    desc: "Heatmaps & device comparison",
    page: "behaviour",
  },
  {
    // icon: "🔴",
    title: "Live Activity",
    desc: "Real-time sessions & events",
    page: "live",
  },
  {
    // icon: "📄",
    title: "Reports Center",
    desc: "Export PDF, CSV, templates",
    page: "reports",
  },
  {
    // icon: "💵",
    title: "Title Revenue Reports",
    desc: "Per-title financial breakdown",
    page: "title-revenue",
  },
  {
    // icon: "🖥️",
    title: "System Monitoring",
    desc: "API health & server status",
    page: "system",
  },
  {
    // icon: "⚙️",
    title: "Settings",
    desc: "Platform preferences & roles",
    page: "settings",
  },
];

const NOTIFICATIONS = [
  {
    // icon: "📈",
    title: "Trending Title",
    body: '"The Executioner of Grenimal" is up 42% this week.',
    time: "2m ago",
  },
  {
    // icon: "⚠️",
    title: "High Concurrent Load",
    body: "Approaching 300 concurrent readers. Monitor closely.",
    time: "14m ago",
  },
  {
    // icon: "✅",
    title: "Monthly Report Ready",
    body: "Auto-generated analytics report sent to admin inbox.",
    time: "1h ago",
  },
  {
    // icon: "🆕",
    title: "New Series Added",
    body: '"Sister Mafioso" is now live on the platform.',
    time: "3h ago",
  },
];

/* ---- STATE ---- */
let revSortKey = "revenue";
let revSortDir = -1;
let revPage = 1;
const REV_PER_PAGE = 8;
const REV_MAX = Math.max(...SERIES_DATA.map((d) => d.revenue));

let liveRunning = true;
let liveInterval = null;
let ADMIN_DASHBOARD_DATA = null;
let ADMIN_NOTIFICATIONS = [];
let ADMIN_SOCKET = null;
let ADMIN_SOCKET_SCRIPT_PROMISE = null;

function dashboardApiBase() {
  const override =
    window.CH_API_URL ||
    (["localhost", "127.0.0.1", ""].includes(location.hostname) || location.protocol === "file:" ? localStorage.getItem("ch_api_url") : "") ||
    document.querySelector('meta[name="ch-api-url"]')?.getAttribute("content");
  if (override) return String(override).replace(/\/$/, "");

  const isLocal =
    ["localhost", "127.0.0.1", ""].includes(window.location.hostname) ||
    window.location.protocol === "file:";
  if (window.location.hostname === "thecrossedhearts.com" || window.location.hostname === "www.thecrossedhearts.com") {
    return "https://crossed-hearts-final.onrender.com/api";
  }
  if (window.location.hostname === "crossed-hearts.onrender.com") {
    return "https://crossed-hearts-final.onrender.com/api";
  }
  return isLocal ? "http://localhost:5000/api" : "https://crossed-hearts-final.onrender.com/api";
}

function adminToken() {
  return sessionStorage.getItem("ch_token");
}

async function adminApi(path, options = {}) {
  const token = adminToken();
  if (!token) throw new Error("Admin login token is missing.");
  const res = await fetch(`${dashboardApiBase()}/admin${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || "Admin API request failed.");
  }
  return data.data;
}

function dashboardApiOrigin() {
  return dashboardApiBase().replace(/\/api\/?$/, "");
}

async function dashboardApi(path, options = {}) {
  const token = adminToken();
  if (!token) throw new Error("Admin login token is missing.");
  const res = await fetch(`${dashboardApiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    throw new Error(data.message || "Dashboard API request failed.");
  }
  return data;
}

function formatAdminNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatAdminMoney(totals = {}) {
  const entries = Object.entries(totals);
  if (!entries.length) return "$0";
  return entries
    .map(([currency, value]) => {
      const prefix = currency === "USD" ? "$" : `${currency} `;
      return prefix + Number(value || 0).toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
    })
    .join(" / ");
}

function setAdminText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setAdminKpiLabel(valueId, label, footerText) {
  const valueEl = document.getElementById(valueId);
  const card = valueEl?.closest(".kpi-card-new");
  const labelEl = card?.querySelector(".kpi-label-new");
  const periodEl = card?.querySelector(".kpi-period");
  if (labelEl) labelEl.textContent = label;
  if (periodEl && footerText) periodEl.textContent = footerText;
}

function escapeAdminHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function adminStatus(message, type = "info") {
  const subtitle = document.querySelector("#page-overview .page-subtitle");
  if (!subtitle) return;
  subtitle.textContent = message;
  subtitle.style.color =
    type === "error" ? "var(--danger, #f87171)" : "var(--text-secondary)";
}

function renderRealAdminOverview(data) {
  const page = document.getElementById("page-overview");
  if (!page) return;

  const summary = data.summary || {};
  const users = summary.users || {};
  const books = summary.books || {};
  const purchases = summary.purchases || {};
  const revenue = summary.revenue || {};
  const attention = summary.attention || {};
  const recent = data.recent || {};
  const generatedAt = data.generatedAt
    ? new Date(data.generatedAt).toLocaleString()
    : new Date().toLocaleString();

  const kpis = [
    {
      label: "Registered Users",
      value: formatAdminNumber(users.total),
      note: `${formatAdminNumber(users.today)} joined today`,
    },
    {
      label: "Verified Users",
      value: users.total
        ? `${Math.round((Number(users.verified || 0) / Number(users.total)) * 100)}%`
        : "0%",
      note: `${formatAdminNumber(users.verified)} verified accounts`,
    },
    {
      label: "Books",
      value: formatAdminNumber(books.total),
      note: `${formatAdminNumber(books.published)} published`,
    },
    {
      label: "Paid Purchases",
      value: formatAdminNumber(purchases.paid),
      note: `${formatAdminNumber(purchases.thisMonth)} this month`,
    },
    {
      label: "Revenue",
      value: formatAdminMoney(revenue.total),
      note: `${formatAdminMoney(revenue.thisMonth)} this month`,
    },
    {
      label: "Open Refunds",
      value: formatAdminNumber(attention.openRefunds),
      note: "payment issue follow-up",
    },
    {
      label: "Support Tickets",
      value: formatAdminNumber(attention.openSupportTickets),
      note: "open or pending",
    },
    {
      label: "Failed Emails Today",
      value: formatAdminNumber(attention.failedEmailsToday),
      note: "SMTP/email health",
    },
  ];

  const topBooks = (data.topBooks || []).slice(0, 8);
  const recentUsers = (recent.users || []).slice(0, 8);
  const recentPurchases = (recent.purchases || []).slice(0, 8);
  const recentActivities = (recent.activities || []).slice(0, 8);

  page.innerHTML = `
    <div class="page-header">
      <div>
        <h1 class="page-title">Admin Dashboard</h1>
        <p class="page-subtitle">Real MongoDB values loaded · Last updated ${escapeAdminHtml(generatedAt)}</p>
      </div>
      <div class="page-actions">
        <div class="live-badge">
          <span class="live-pulse"></span>
          <span>Database Connected</span>
        </div>
      </div>
    </div>

    <div class="kpi-grid-new">
      ${kpis
        .map(
          (item) => `
        <div class="kpi-card-new">
          <div class="kpi-header-row">
            <span class="kpi-label-new">${escapeAdminHtml(item.label)}</span>
          </div>
          <div class="kpi-value-new">${escapeAdminHtml(item.value)}</div>
          <div class="kpi-footer-row">
            <span class="kpi-period">${escapeAdminHtml(item.note)}</span>
          </div>
        </div>
      `,
        )
        .join("")}
    </div>

    <div class="bottom-grid" style="margin-top:24px">
      <div class="data-card span-2">
        <div class="data-card-head">
          <h3 class="panel-title">Top Books By Real Sales</h3>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>Book</th><th>Sales</th><th>Revenue</th><th>Currency</th></tr>
            </thead>
            <tbody>
              ${
                topBooks.length
                  ? topBooks
                      .map(
                        (book) => `
                  <tr>
                    <td><strong style="color:var(--text-primary)">${escapeAdminHtml(book.title || "Untitled")}</strong></td>
                    <td>${formatAdminNumber(book.sales)}</td>
                    <td>${formatAdminNumber(book.revenue)}</td>
                    <td>${escapeAdminHtml(book.currency || "USD")}</td>
                  </tr>
                `,
                      )
                      .join("")
                  : `<tr><td colspan="4">No paid purchases yet.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="data-card">
        <div class="data-card-head">
          <h3 class="panel-title">Needs Attention</h3>
        </div>
        <div style="padding:16px 20px;display:flex;flex-direction:column;gap:14px">
          <div><strong style="color:var(--text-primary)">${formatAdminNumber(attention.openRefunds)}</strong><div style="font-size:12px;color:var(--text-tertiary)">Open refund requests</div></div>
          <div><strong style="color:var(--text-primary)">${formatAdminNumber(attention.openSupportTickets)}</strong><div style="font-size:12px;color:var(--text-tertiary)">Open support tickets</div></div>
          <div><strong style="color:var(--text-primary)">${formatAdminNumber(attention.unreadNotifications)}</strong><div style="font-size:12px;color:var(--text-tertiary)">Unread notifications</div></div>
          <div><strong style="color:var(--text-primary)">${formatAdminNumber(attention.failedEmailsToday)}</strong><div style="font-size:12px;color:var(--text-tertiary)">Failed emails today</div></div>
        </div>
      </div>
    </div>

    <div class="bottom-grid" style="margin-top:24px">
      <div class="data-card span-2">
        <div class="data-card-head">
          <h3 class="panel-title">Recent Purchases</h3>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>User</th><th>Book</th><th>Amount</th><th>Date</th></tr>
            </thead>
            <tbody>
              ${
                recentPurchases.length
                  ? recentPurchases
                      .map(
                        (purchase) => `
                  <tr>
                    <td>${escapeAdminHtml(purchase.userId?.email || purchase.userId?.name || "Unknown user")}</td>
                    <td><strong style="color:var(--text-primary)">${escapeAdminHtml(purchase.bookTitle || purchase.bookId?.title || "Untitled")}</strong></td>
                    <td>${escapeAdminHtml(purchase.currency || "USD")} ${Number(purchase.amount || 0).toFixed(2)}</td>
                    <td>${purchase.createdAt ? new Date(purchase.createdAt).toLocaleString() : "-"}</td>
                  </tr>
                `,
                      )
                      .join("")
                  : `<tr><td colspan="4">No paid purchases yet.</td></tr>`
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="data-card">
        <div class="data-card-head">
          <h3 class="panel-title">Recent Users</h3>
        </div>
        <div style="padding:8px 0">
          ${
            recentUsers.length
              ? recentUsers
                  .map(
                    (user) => `
              <div style="padding:12px 18px;border-bottom:1px solid var(--border)">
                <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${escapeAdminHtml(user.name || "User")}</div>
                <div style="font-size:12px;color:var(--text-tertiary)">${escapeAdminHtml(user.email)} · ${escapeAdminHtml(user.role)} · ${escapeAdminHtml(user.status)}</div>
              </div>
            `,
                  )
                  .join("")
              : `<div style="padding:16px 18px;color:var(--text-tertiary)">No users yet.</div>`
          }
        </div>
      </div>
    </div>

    <div class="data-card" style="margin-top:24px">
      <div class="data-card-head">
        <h3 class="panel-title">Recent Backend Activity</h3>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Type</th><th>Email/User</th><th>Date</th></tr></thead>
          <tbody>
            ${
              recentActivities.length
                ? recentActivities
                    .map(
                      (activity) => `
                <tr>
                  <td><span class="cat-badge cat-manga">${escapeAdminHtml(activity.type || "activity")}</span></td>
                  <td>${escapeAdminHtml(activity.email || activity.userId || "system")}</td>
                  <td>${activity.createdAt ? new Date(activity.createdAt).toLocaleString() : "-"}</td>
                </tr>
              `,
                    )
                    .join("")
                : `<tr><td colspan="3">No activity recorded yet.</td></tr>`
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function applyAdminDashboardData(data) {
  ADMIN_DASHBOARD_DATA = data;
  renderRealAdminOverview(data);
  const summary = data.summary || {};
  const users = summary.users || {};
  const books = summary.books || {};
  const purchases = summary.purchases || {};
  const revenue = summary.revenue || {};
  const attention = summary.attention || {};

  const verifiedPct = users.total
    ? Math.round((Number(users.verified || 0) / Number(users.total)) * 100)
    : 0;

  setAdminText("kpiVal0", formatAdminNumber(users.total));
  setAdminText("kpiVal1", formatAdminNumber(users.active));
  setAdminText("kpiVal2", formatAdminMoney(revenue.thisMonth || revenue.total));
  setAdminText("kpiVal3", `${verifiedPct}%`);
  setAdminText("kpiVal4", `${formatAdminNumber(attention.openSupportTickets)} open`);
  setAdminText("kpiVal5", formatAdminNumber(purchases.thisMonth || purchases.paid));
  setAdminText("kpiVal6", formatAdminNumber(books.total));
  setAdminText("kpiVal7", formatAdminNumber(attention.unreadNotifications));
  setAdminKpiLabel("kpiVal3", "Verified Readers", "of all users");
  setAdminKpiLabel("kpiVal4", "Open Support Tickets", "needs attention");
  setAdminKpiLabel("kpiVal7", "Unread Notifications", "real-time alerts");

  const generatedAt = data.generatedAt
    ? new Date(data.generatedAt).toLocaleString()
    : new Date().toLocaleString();
  adminStatus(`Real MongoDB values loaded · Last updated ${generatedAt}`);

  if (Array.isArray(data.topBooks) && data.topBooks.length) {
    TOP_TITLES.splice(
      0,
      TOP_TITLES.length,
      ...data.topBooks.map((book) => ({
        name: book.title || "Untitled book",
        cover: "",
        views: `${formatAdminNumber(book.sales)} sales`,
        change: Math.round(Number(book.revenue || 0)),
      })),
    );

    SERIES_DATA.splice(
      0,
      SERIES_DATA.length,
      ...data.topBooks.map((book) => ({
        id: String(book._id || book.title || "book"),
        name: book.title || "Untitled book",
        cat: "manga",
        genre: "Digital",
        launch: "",
        volumes: 1,
        buyers: Number(book.sales || 0),
        revenue: Number(book.revenue || 0),
        trend: 0,
      })),
    );
    renderTopTitles();
    renderRevKpis();
    renderRevTable();
  }

  const recent = data.recent || {};
  if (Array.isArray(recent.users) && recent.users.length) {
    allSessions = recent.users.map((user) => ({
      reader: user.name || user.email || "Registered user",
      status: user.status === "active" ? "online" : "idle",
      title: user.email || "No email",
      progress: user.isEmailVerified ? 100 : 25,
      time: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-",
      device: user.role || "user",
    }));
    renderSessionsTable("");
  }

  if (Array.isArray(recent.activities) && recent.activities.length) {
    TICKER_EVENTS.splice(
      0,
      TICKER_EVENTS.length,
      ...recent.activities.map((activity) => ({
        text: `<strong>${activity.type || "activity"}:</strong> ${
          activity.email || activity.userId || "system"
        }`,
      })),
    );
    renderTicker();
  }

  const notifBadge = document.getElementById("notifBadge");
  if (notifBadge) notifBadge.textContent = formatAdminNumber(attention.unreadNotifications);
}

async function loadRealAdminDashboard() {
  try {
    adminStatus("Loading real MongoDB dashboard values...");
    const dashboard = await adminApi("/dashboard");
    applyAdminDashboardData(dashboard);
  } catch (err) {
    console.error("Admin dashboard load failed:", err);
    adminStatus(`Could not load real admin values: ${err.message}`, "error");
  }
}

/* ---- NAVIGATION ---- */
function navigate(page, linkEl) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((a) => a.classList.remove("active"));

  const target = document.getElementById("page-" + page);
  if (target) target.classList.add("active");

  if (linkEl) linkEl.classList.add("active");
  else {
    const el = document.querySelector(`[data-page="${page}"]`);
    if (el) el.classList.add("active");
  }

  const names = {
    overview: "Overview",
    readers: "Readers Analytics",
    revenue: "Revenue Intelligence",
    titles: "Title Performance",
    engagement: "Engagement Insights",
    behaviour: "Reading Behaviour",
    live: "Live Activity",
    reports: "Reports Center",
    "title-revenue": "Title Revenue Reports",
    "physical-orders": "Physical Orders",
    system: "System Monitoring",
    settings: "Settings",
  };

  const el = document.getElementById("breadcrumbCurrent");
  if (el) el.textContent = names[page] || page;

  if (page === "revenue") {
    initRevCharts();
    renderRevTable();
  }
  if (page === "live") {
    initLivePage();
  }

  event && event.preventDefault();
}

/* ---- THEME ---- */
function toggleTheme() {
  const cur = document.body.getAttribute("data-theme");
  const next = cur === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", next);
  localStorage.setItem("ch-theme2", next);
}

/* ---- SIDEBAR COLLAPSE ---- */
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle("mobile-open");
  } else {
    document.querySelector(".app-shell").classList.toggle("collapsed");
  }
}

/* ---- DATE RANGE ---- */
function setDateRange(val, label) {
  document.getElementById("dateRangeLabel").textContent = label;
  document
    .querySelectorAll(".date-dropdown button")
    .forEach((b) => b.classList.remove("active"));
}

/* ---- EXPORT ---- */
function adminDownloadText(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function adminCsvValue(value) {
  const clean = String(value ?? "").replace(/\s+/g, " ").trim();
  return `"${clean.replace(/"/g, '""')}"`;
}

function adminDownloadCsv(filename, headers, rows) {
  const csv = [
    headers.map(adminCsvValue).join(","),
    ...rows.map((row) => row.map(adminCsvValue).join(",")),
  ].join("\n");
  adminDownloadText(filename, csv, "text/csv;charset=utf-8");
}

function getActiveDashboardPage() {
  return document.querySelector(".page.active");
}

function pageExportName(page) {
  const title = page?.querySelector(".page-title")?.textContent || "dashboard-export";
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "dashboard-export";
}

function exportVisibleTables(page) {
  const tables = [...page.querySelectorAll("table")];
  const rows = [];
  tables.forEach((table) => {
    const tableRows = [...table.querySelectorAll("tr")].map((tr) =>
      [...tr.children].map((cell) => cell.textContent),
    );
    rows.push(...tableRows, []);
  });
  if (!rows.length) return false;
  const maxCols = Math.max(...rows.map((row) => row.length), 1);
  const normalized = rows.map((row) => [
    ...row,
    ...Array(Math.max(maxCols - row.length, 0)).fill(""),
  ]);
  adminDownloadCsv(`${pageExportName(page)}.csv`, normalized.shift() || [], normalized);
  return true;
}

function handleExport() {
  const page = getActiveDashboardPage();
  if (!page) return;
  const pageId = page.id.replace(/^page-/, "");
  if (pageId === "revenue") return exportRevenueCSV();
  if (pageId === "reports") return downloadAdminReport(0);
  if (pageId === "physical-orders") return exportPhysicalOrdersCSV();
  if (exportVisibleTables(page)) return;

  const cards = [...page.querySelectorAll(".kpi-card-new, .data-card, .panel-card")].map((card) =>
    card.textContent.replace(/\s+/g, " ").trim(),
  );
  if (!cards.length) {
    alert("No exportable data is visible on this page yet.");
    return;
  }
  adminDownloadText(`${pageExportName(page)}.txt`, cards.join("\n\n"));
}

/* ---- COMMAND PALETTE ---- */
function openCmd() {
  document.getElementById("cmdOverlay").classList.add("open");
  document.getElementById("cmdPalette").classList.add("open");
  setTimeout(() => document.getElementById("cmdInput").focus(), 50);
  filterCmd("");
}

function closeCmd() {
  document.getElementById("cmdOverlay").classList.remove("open");
  document.getElementById("cmdPalette").classList.remove("open");
}

function filterCmd(q) {
  const results = document.getElementById("cmdResults");
  const filtered = q
    ? CMD_ITEMS.filter(
        (i) =>
          i.title.toLowerCase().includes(q.toLowerCase()) ||
          i.desc.toLowerCase().includes(q.toLowerCase()),
      )
    : CMD_ITEMS;

  if (!filtered.length) {
    results.innerHTML =
      '<div style="padding:20px;text-align:center;color:var(--text-tertiary);font-size:13px">No results found</div>';
    return;
  }

  results.innerHTML =
    `<div class="cmd-section-label">Navigation</div>` +
    filtered
      .map(
        (item) => `
      <div class="cmd-result-item" onclick="cmdGo('${item.page}')">
        <div class="cmd-result-text">
          <div class="cmd-result-title">${item.title}</div>
          <div class="cmd-result-desc">${item.desc}</div>
        </div>
      </div>
    `,
      )
      .join("");
}

function cmdGo(page) {
  closeCmd();
  navigate(page, null);
}

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "k") {
    e.preventDefault();
    openCmd();
  }
  if (e.key === "Escape") {
    closeCmd();
    closeNotif();
  }
});

/* ---- NOTIFICATIONS ---- */
function openNotif() {
  document.getElementById("notifOverlay").classList.add("open");
  document.getElementById("notifDrawer").classList.add("open");
  loadAdminNotifications({ markRead: true });
}

function closeNotif() {
  document.getElementById("notifOverlay").classList.remove("open");
  document.getElementById("notifDrawer").classList.remove("open");
}

function renderNotifications() {
  const list = document.getElementById("notifList");
  if (!list) return;
  const notifications = ADMIN_NOTIFICATIONS.length ? ADMIN_NOTIFICATIONS : NOTIFICATIONS.map((item) => ({
    title: item.title,
    message: item.body,
    createdAt: item.time,
    isRead: true,
  }));
  list.innerHTML = notifications.map(
    (n) => `
    <div class="notif-item" style="${n.isRead ? "" : "border-left:3px solid var(--gold);"}">
      <div>
        <div class="notif-item-title">${escapeAdminHtml(n.title || "Notification")}</div>
        <div class="notif-item-body">${escapeAdminHtml(n.message || "")}</div>
        <div class="notif-item-time">${formatNotificationTime(n.createdAt)}</div>
      </div>
    </div>
  `,
  ).join("");
}

function formatNotificationTime(value) {
  if (!value) return "Just now";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const seconds = Math.max(Math.round((Date.now() - date.getTime()) / 1000), 0);
  if (seconds < 60) return "Just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleString();
}

function setNotificationBadge(count) {
  const badge = document.getElementById("notifBadge");
  if (!badge) return;
  badge.textContent = formatAdminNumber(count);
  badge.style.display = Number(count || 0) > 0 ? "" : "none";
}

async function loadAdminNotifications({ markRead = false } = {}) {
  try {
    const data = await dashboardApi("/notifications?limit=30");
    ADMIN_NOTIFICATIONS = data.data?.notifications || [];
    renderNotifications();
    setNotificationBadge(data.unread || 0);
    if (markRead && Number(data.unread || 0) > 0) {
      await dashboardApi("/notifications/read-all", { method: "PATCH" });
      ADMIN_NOTIFICATIONS = ADMIN_NOTIFICATIONS.map((item) => ({ ...item, isRead: true }));
      setNotificationBadge(0);
      renderNotifications();
    }
  } catch (err) {
    console.warn("Could not load admin notifications:", err.message || err);
    renderNotifications();
  }
}

function showAdminLiveNotification(notification) {
  const toast = document.createElement("div");
  toast.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:80;background:var(--bg-elevated);border:1px solid rgba(201,160,80,.45);color:var(--text-primary);padding:14px 16px;border-radius:12px;box-shadow:0 16px 34px rgba(0,0,0,.32);font-size:13px;max-width:340px;cursor:pointer";
  toast.innerHTML = `<strong style="display:block;margin-bottom:4px;color:var(--gold)">${escapeAdminHtml(notification.title || "New notification")}</strong><span>${escapeAdminHtml(notification.message || "")}</span>`;
  toast.onclick = () => {
    toast.remove();
    navigate("physical-orders", document.querySelector('[data-page="physical-orders"]'));
  };
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 6500);
}

function loadAdminSocketClient() {
  if (window.io) return Promise.resolve();
  if (ADMIN_SOCKET_SCRIPT_PROMISE) return ADMIN_SOCKET_SCRIPT_PROMISE;
  ADMIN_SOCKET_SCRIPT_PROMISE = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = dashboardApiOrigin() + "/socket.io/socket.io.js";
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return ADMIN_SOCKET_SCRIPT_PROMISE;
}

async function connectAdminNotifications() {
  const token = adminToken();
  if (!token || ADMIN_SOCKET?.connected) return;
  try {
    await loadAdminSocketClient();
    ADMIN_SOCKET = window.io(dashboardApiOrigin(), {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    ADMIN_SOCKET.on("notification:new", (payload) => {
      const notification = payload?.notification;
      if (!notification) return;
      ADMIN_NOTIFICATIONS.unshift(notification);
      ADMIN_NOTIFICATIONS = ADMIN_NOTIFICATIONS.slice(0, 30);
      renderNotifications();
      const unread = ADMIN_NOTIFICATIONS.filter((item) => !item.isRead).length;
      setNotificationBadge(unread);
      showAdminLiveNotification(notification);
      if (notification.type === "physical_order") loadPhysicalOrders();
    });
  } catch (err) {
    console.warn("Realtime admin notifications unavailable:", err.message || err);
  }
}

/* ---- CHART HELPERS ---- */
function chartDefaults() {
  const isDark = document.body.getAttribute("data-theme") !== "light";
  Chart.defaults.color = isDark ? "#9898a8" : "#5f5f70";
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 11;
}

function gridColor() {
  return document.body.getAttribute("data-theme") !== "light"
    ? "rgba(255,255,255,0.05)"
    : "rgba(0,0,0,0.06)";
}

/* ---- SPARKLINES ---- */
function drawSparklines() {
  const sparkData = [
    [120, 150, 180, 200, 250, 310, 380, 450],
    [700, 750, 780, 810, 840, 870, 890, 892],
    [48000, 52000, 56000, 58000, 600000, 620000, 625000, 631825],
    [60, 62, 63, 65, 66, 67, 68, 68],
    [30, 29, 31, 28, 29, 28, 28, 28],
    [2800, 3000, 3100, 3200, 3400, 3600, 3700, 3842],
    [42, 43, 44, 44, 45, 46, 46, 47],
    [200, 220, 235, 245, 240, 250, 248, 248],
  ];

  sparkData.forEach((data, i) => {
    const canvas = document.getElementById("spark" + i);
    if (!canvas) return;
    new Chart(canvas.getContext("2d"), {
      type: "line",
      data: {
        labels: data.map((_, j) => j),
        datasets: [
          {
            data,
            borderColor: "#c9a050",
            borderWidth: 1.5,
            tension: 0.4,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: {
          x: { display: false },
          y: { display: false },
        },
        animation: false,
      },
    });
  });
}

/* ---- KPI COUNTER ANIMATION ---- */
function animateCounters() {
  const cards = document.querySelectorAll(".kpi-value-new[data-target]");
  cards.forEach((el) => {
    const target = parseInt(el.dataset.target);
    const isCurrency = el.classList.contains("currency");
    const isPercent = el.dataset.target == "68";
    let start = 0;
    const duration = 1200;
    const step = target / (duration / 16);

    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      if (isCurrency) {
        el.textContent = "$" + Math.round(start).toLocaleString();
      } else if (isPercent) {
        el.textContent = Math.round(start) + "%";
      } else {
        el.textContent = Math.round(start).toLocaleString();
      }
      if (start >= target) clearInterval(timer);
    }, 16);
  });
}

/* ---- MAIN CHARTS ---- */
let trendChart, deviceChart, timeChart;

function initOverviewCharts() {
  chartDefaults();

  // Trend Chart
  const ctxT = document.getElementById("trendChart");
  if (ctxT) {
    trendChart = new Chart(ctxT.getContext("2d"), {
      type: "line",
      data: {
        labels: Array.from({ length: 30 }, (_, i) => i + 1),
        datasets: [
          {
            label: "Daily Logins",
            data: [
              120, 150, 180, 130, 200, 250, 210, 280, 310, 290, 340, 310, 380,
              420, 390, 450, 430, 470, 460, 500, 480, 520, 510, 540, 530, 560,
              550, 580, 600, 450,
            ],
            borderColor: "#c9a050",
            backgroundColor: "rgba(201,160,80,0.07)",
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: "New Registrations",
            data: [
              20, 30, 25, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100,
              95, 105, 100, 110, 108, 115, 112, 120, 118, 125, 122, 130, 128,
              100,
            ],
            borderColor: "#4ade80",
            backgroundColor: "transparent",
            borderDash: [4, 4],
            tension: 0.4,
            borderWidth: 1.5,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "top", align: "end" } },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: gridColor() },
            border: { display: false },
          },
          x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } },
        },
        interaction: { intersect: false, mode: "index" },
      },
    });
  }

  // Device chart
  const ctxD = document.getElementById("deviceChart");
  if (ctxD) {
    deviceChart = new Chart(ctxD.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Mobile", "Desktop", "Tablet"],
        datasets: [
          {
            data: [65, 25, 10],
            backgroundColor: ["#c9a050", "#3b82f6", "#10b981"],
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "72%",
        plugins: { legend: { display: false } },
      },
    });

    const legend = document.getElementById("deviceLegend");
    if (legend) {
      legend.innerHTML = [
        { color: "#c9a050", label: "Mobile", pct: "65%" },
        { color: "#3b82f6", label: "Desktop", pct: "25%" },
        { color: "#10b981", label: "Tablet", pct: "10%" },
      ]
        .map(
          (d) => `
        <div class="legend-item">
          <div class="legend-dot" style="background:${d.color}"></div>
          <span>${d.label}</span>
          <strong style="color:var(--text-primary);font-size:11px">${d.pct}</strong>
        </div>
      `,
        )
        .join("");
    }
  }

  // Time chart
  const ctxTm = document.getElementById("timeChart");
  if (ctxTm) {
    timeChart = new Chart(ctxTm.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["12am", "4am", "8am", "12pm", "4pm", "6pm", "8pm", "10pm"],
        datasets: [
          {
            label: "Avg Reading (mins)",
            data: [15, 5, 20, 35, 40, 50, 55, 45],
            backgroundColor: "rgba(201,160,80,0.7)",
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: {
            grid: { color: gridColor() },
            border: { display: false },
            beginAtZero: true,
          },
          x: { grid: { display: false } },
        },
      },
    });
  }
}

/* ---- GENRE SPOTLIGHT ---- */
function renderGenreSpotlight() {
  const genres = [
    { name: "Romance", pct: 45, color: "#c9a050" },
    { name: "Fantasy", pct: 30, color: "#3b82f6" },
    { name: "Action", pct: 15, color: "#10b981" },
    { name: "Comedy", pct: 6, color: "#a78bfa" },
    { name: "Drama", pct: 4, color: "#f472b6" },
  ];
  const container = document.getElementById("genreSpotlight");
  if (!container) return;
  container.innerHTML = genres
    .map(
      (g) => `
    <div class="genre-row">
      <div class="genre-row-head">
        <span class="genre-row-name">${g.name}</span>
        <span class="genre-row-pct">${g.pct}%</span>
      </div>
      <div class="genre-track">
        <div class="genre-fill" style="width:${g.pct}%;background:${g.color}"></div>
      </div>
    </div>
  `,
    )
    .join("");
}

/* ---- SESSIONS TABLE ---- */
let allSessions = [...SESSIONS_DATA];

function renderSessionsTable(filter = "") {
  const tbody = document.getElementById("sessionsTbody");
  if (!tbody) return;
  const rows = filter
    ? allSessions.filter(
        (s) =>
          s.reader.toLowerCase().includes(filter) ||
          s.title.toLowerCase().includes(filter),
      )
    : allSessions;

  tbody.innerHTML = rows
    .map(
      (s) => `
    <tr>
      <td><strong style="color:var(--text-primary)">${s.reader}</strong></td>
      <td>
        <span class="status-pill ${s.status}">
          <span class="status-dot"></span>${s.status.charAt(0).toUpperCase() + s.status.slice(1)}
        </span>
      </td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${s.title}</td>
      <td>
        <div class="progress-wrap">
          <div class="progress-track"><div class="progress-fill" style="width:${s.progress}%"></div></div>
          <span class="progress-label">${s.progress}%</span>
        </div>
      </td>
      <td>${s.time}</td>
      <td><span style="font-size:11px;color:var(--text-tertiary)">${s.device}</span></td>
    </tr>
  `,
    )
    .join("");
}

function filterSessions(val) {
  renderSessionsTable(val.toLowerCase());
}

function refreshSessions() {
  renderSessionsTable("");
}

/* ---- TOP TITLES ---- */
function renderTopTitles() {
  const container = document.getElementById("topTitlesList");
  if (!container) return;
  container.innerHTML = TOP_TITLES.map(
    (t, i) => `
    <div class="top-title-item">
      <span class="top-title-rank">#${i + 1}</span>
      <div class="top-title-cover" style="background-image:url('${t.cover}')"></div>
      <div class="top-title-meta">
        <div class="top-title-name">${t.name}</div>
        <div class="top-title-stats">${t.views} visits</div>
      </div>
      <span class="top-title-change up">↑${t.change}%</span>
    </div>
  `,
  ).join("");
}

/* ---- EVENT TICKER ---- */
function renderTicker() {
  const inner = document.getElementById("tickerInner");
  if (!inner) return;
  const doubled = [...TICKER_EVENTS, ...TICKER_EVENTS];
  inner.innerHTML = doubled
    .map((e) => `<span class="ticker-event">${e.text}</span>`)
    .join("");
}

/* ---- LIVE SIMULATION ---- */
let _liveUsers = 248,
  _liveSessions = 183,
  _liveTitles = 56,
  _livePurchases = 12;

function startLiveSim() {
  liveInterval = setInterval(() => {
    _liveUsers += Math.floor(Math.random() * 5) - 2;
    _liveSessions += Math.floor(Math.random() * 3) - 1;
    if (Math.random() > 0.8) _liveTitles += Math.floor(Math.random() * 3) - 1;
    if (Math.random() > 0.9) _livePurchases += 1;

    _liveUsers = Math.max(200, _liveUsers);
    _liveSessions = Math.max(150, _liveSessions);
    _liveTitles = Math.max(40, _liveTitles);

    const kpi7 = document.getElementById("kpiVal7");
    if (kpi7 && !ADMIN_DASHBOARD_DATA) kpi7.textContent = _liveUsers;

    updateLiveKpiRow();
  }, 3000);
}

function toggleAutoRefresh() {
  liveRunning = !liveRunning;
  const btn = document.getElementById("autoRefreshBtn");
  if (btn) btn.textContent = liveRunning ? "⏸ Pause" : "▶ Resume";
  if (liveRunning) startLiveSim();
  else {
    clearInterval(liveInterval);
  }
}

/* ---- LIVE PAGE ---- */
const STREAM_EVENTS = [
  {
    color: "#4ade80",
    text: `<strong>nova_reads</strong> opened Time is a Closet`,
  },
  {
    color: "#c9a050",
    text: `<strong>Purchase:</strong> k_reader22 bought Roommate Vol.1`,
  },
  {
    color: "#3b82f6",
    text: `<strong>MangaFan99</strong> resumed reading at chapter 4`,
  },
  { color: "#f472b6", text: `<strong>New signup:</strong> reader_829 joined` },
  {
    color: "#4ade80",
    text: `<strong>Sarah J.</strong> completed A Royal Rebound`,
  },
  {
    color: "#fbbf24",
    text: `<strong>Alert:</strong> Session spike detected +18%`,
  },
  { color: "#10b981", text: `<strong>Alice W.</strong> bookmarked page 42` },
];

let streamIdx = 0;

function initLivePage() {
  updateLiveKpiRow();
  renderLiveAlerts();
  renderStreamEvent();

  clearInterval(window._streamInterval);
  window._streamInterval = setInterval(() => {
    renderStreamEvent();
  }, 4000);
}

function updateLiveKpiRow() {
  const row = document.getElementById("liveKpiRow");
  if (!row) return;
  row.innerHTML = [
    { val: _liveUsers, label: "Online Users" },
    { val: _liveSessions, label: "Active Sessions" },
    { val: _liveTitles, label: "Titles Being Read" },
    { val: "12m", label: "Avg Session (live)" },
  ]
    .map(
      (d) => `
    <div class="live-kpi-card">
      <div class="live-kpi-val">${d.val}</div>
      <div class="live-kpi-label">${d.label}</div>
    </div>
  `,
    )
    .join("");
}

function renderStreamEvent() {
  const stream = document.getElementById("sessionStream");
  if (!stream) return;
  const ev = STREAM_EVENTS[streamIdx % STREAM_EVENTS.length];
  streamIdx++;

  const div = document.createElement("div");
  div.className = "stream-event";
  div.innerHTML = `
    <div class="stream-event-dot" style="background:${ev.color}"></div>
    <div class="stream-event-body">
      <div class="stream-event-text">${ev.text}</div>
      <div class="stream-event-time">just now</div>
    </div>
  `;
  stream.prepend(div);

  const items = stream.querySelectorAll(".stream-event");
  if (items.length > 12) items[items.length - 1].remove();

  stream.querySelectorAll(".stream-event-time").forEach((el, i) => {
    if (i === 0) el.textContent = "just now";
    else if (i < 4) el.textContent = i * 4 + "s ago";
    else el.textContent = Math.floor(i / 2) + "m ago";
  });
}

function renderLiveAlerts() {
  const list = document.getElementById("liveAlertsList");
  if (!list) return;
  const alerts = [
    {
      type: "warning",
      // icon: "⚠️",
      title: "High Concurrent Load",
      body: "Approaching 300 concurrent readers.",
    },
    {
      type: "info",
      // icon: "📈",
      title: "Trending Title",
      body: '"The Executioner of Grenimal" up 42%.',
    },
    {
      type: "success",
      // icon: "✅",
      title: "Auto-Report Generated",
      body: "Monthly report sent to admin.",
    },
    {
      type: "error",
      // icon: "🔴",
      title: "Failed Payment Attempt",
      body: "3 failed purchase retries in last hour.",
    },
  ];
  list.innerHTML = alerts
    .map(
      (a) => `
    <div class="live-alert-item ${a.type}">
      <div>
        <div class="live-alert-title">${a.title}</div>
        <div class="live-alert-body">${a.body}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

/* ---- REVENUE PAGE ---- */
let revBarChart, revPieChart;

function initRevCharts() {
  if (revBarChart) return;
  chartDefaults();

  const topSeries = [...SERIES_DATA]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  const ctxBar = document.getElementById("revBarChart");
  if (ctxBar) {
    revBarChart = new Chart(ctxBar.getContext("2d"), {
      type: "bar",
      data: {
        labels: topSeries.map((d) =>
          d.name.length > 22 ? d.name.slice(0, 22) + "…" : d.name,
        ),
        datasets: [
          {
            label: "Revenue ($)",
            data: topSeries.map((d) => d.revenue),
            backgroundColor: topSeries.map((_, i) =>
              i === 0 ? "#c9a050" : "rgba(201,160,80,0.35)",
            ),
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { color: gridColor() },
            border: { display: false },
            ticks: { callback: (v) => "$" + (v / 1000).toFixed(0) + "k" },
          },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      },
    });
  }

  const catRevenue = { manga: 0, glambeat: 0, blushclub: 0, novel: 0 };
  SERIES_DATA.forEach(
    (d) => (catRevenue[d.cat] = (catRevenue[d.cat] || 0) + d.revenue),
  );

  const ctxPie = document.getElementById("revPieChart");
  if (ctxPie) {
    revPieChart = new Chart(ctxPie.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Manga", "Glam Beat", "Blush Club", "Novel"],
        datasets: [
          {
            data: Object.values(catRevenue),
            backgroundColor: ["#c9a050", "#4ade80", "#f472b6", "#818cf8"],
            borderWidth: 0,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "65%",
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  renderRevKpis();
}

function renderRevKpis() {
  const row = document.getElementById("revKpiRow");
  if (!row) return;
  const totRev = SERIES_DATA.reduce((s, d) => s + d.revenue, 0);
  const totBuy = SERIES_DATA.reduce((s, d) => s + d.buyers, 0);
  const best = [...SERIES_DATA].sort((a, b) => b.revenue - a.revenue)[0];
  const avgRev = Math.round(totRev / SERIES_DATA.length);

  row.innerHTML = [
    {
      label: "Total Revenue",
      val: "$" + totRev.toLocaleString(),
      sub: "across all series",
    },
    {
      label: "Total Buyers",
      val: totBuy.toLocaleString(),
      sub: "avg " + Math.round(totBuy / SERIES_DATA.length) + " / series",
    },
    { label: "Active Series", val: SERIES_DATA.length, sub: "4 categories" },
    {
      label: "Best Seller",
      val: best.name.split(" ").slice(0, 3).join(" ") + "…",
      sub: "$" + best.revenue.toLocaleString(),
    },
  ]
    .map(
      (d) => `
    <div class="rev-kpi-card">
      <div class="rev-kpi-label">${d.label}</div>
      <div class="rev-kpi-val">${d.val}</div>
      <div class="rev-kpi-sub">${d.sub}</div>
    </div>
  `,
    )
    .join("");
}

/* ---- REVENUE TABLE ---- */
function getRevFiltered() {
  const q = (document.getElementById("revSearch")?.value || "").toLowerCase();
  const genre = (
    document.getElementById("revGenreFilter")?.value || "all"
  ).toLowerCase();

  return SERIES_DATA.filter((d) => {
    const matchQ =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.genre.toLowerCase().includes(q);
    const matchGenre = genre === "all" || d.cat === genre;
    return matchQ && matchGenre;
  }).sort((a, b) => {
    const av =
      revSortKey === "launch" ? new Date(a[revSortKey]) : a[revSortKey];
    const bv =
      revSortKey === "launch" ? new Date(b[revSortKey]) : b[revSortKey];
    return typeof av === "string"
      ? av.localeCompare(bv) * revSortDir
      : (av - bv) * revSortDir;
  });
}

function renderRevTable() {
  const rows = getRevFiltered();
  const total = Math.ceil(rows.length / REV_PER_PAGE) || 1;
  if (revPage > total) revPage = total;
  const paged = rows.slice(
    (revPage - 1) * REV_PER_PAGE,
    revPage * REV_PER_PAGE,
  );

  ["name", "launch", "buyers", "revenue"].forEach((k) => {
    const el = document.getElementById("rsa-" + k);
    if (el)
      el.textContent = revSortKey === k ? (revSortDir === -1 ? "↓" : "↑") : "";
  });

  const tbody = document.getElementById("revTbody");
  if (!tbody) return;

  tbody.innerHTML = paged
    .map((d) => {
      const barW = Math.round((d.revenue / REV_MAX) * 100);
      const tSign = d.trend >= 0 ? "+" : "";
      const tCls = d.trend >= 0 ? "trend-up" : "trend-down";
      const catCls = {
        manga: "cat-manga",
        glambeat: "cat-glambeat",
        blushclub: "cat-blushclub",
        novel: "cat-novel",
      }[d.cat];
      const catLbl = {
        manga: "Manga",
        glambeat: "Glam Beat",
        blushclub: "Blush Club",
        novel: "Novel",
      }[d.cat];
      const date = new Date(d.launch).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return `
      <tr>
        <td>
          <div style="font-weight:600;color:var(--text-primary);font-size:13px;max-width:200px;overflow:hidden;text-overflow:ellipsis">${d.name}</div>
          <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">${d.genre}</div>
        </td>
        <td><span class="cat-badge ${catCls}">${catLbl}</span></td>
        <td style="font-size:12px;color:var(--text-tertiary);white-space:nowrap">${date}</td>
        <td style="font-weight:600;color:var(--text-primary)">${d.buyers.toLocaleString()}</td>
        <td>
          <div class="rev-bar-wrap">
            <div class="rev-bar-bg"><div class="rev-bar-fill" style="width:${barW}%"></div></div>
            <span style="font-size:13px;font-weight:600;min-width:70px;text-align:right;color:var(--text-primary)">$${d.revenue.toLocaleString()}</span>
          </div>
        </td>
        <td><span class="${tCls}">${tSign}${d.trend}%</span></td>
      </tr>
    `;
    })
    .join("");

  const pagInfo = document.getElementById("revPagInfo");
  const pagBtns = document.getElementById("revPagBtns");
  if (pagInfo)
    pagInfo.textContent = `Showing ${Math.min((revPage - 1) * REV_PER_PAGE + 1, rows.length)}–${Math.min(revPage * REV_PER_PAGE, rows.length)} of ${rows.length} series`;

  if (pagBtns) {
    pagBtns.innerHTML = "";
    for (let p = 1; p <= total; p++) {
      const btn = document.createElement("button");
      btn.className = "pag-btn" + (p === revPage ? " active" : "");
      btn.textContent = p;
      const pp = p;
      btn.onclick = () => {
        revPage = pp;
        renderRevTable();
      };
      pagBtns.appendChild(btn);
    }
  }
}

function revSort(key) {
  if (revSortKey === key) revSortDir *= -1;
  else {
    revSortKey = key;
    revSortDir = -1;
  }
  renderRevTable();
}

function exportRevenueCSV() {
  const rows = getRevFiltered();
  const headers = [
    "Series",
    "Category",
    "Genre",
    "Launch Date",
    "Volumes",
    "Buyers",
    "Revenue (USD)",
    "30d Trend",
  ];
  const csv = [
    headers,
    ...rows.map((d) => [
      `"${d.name}"`,
      d.cat,
      `"${d.genre}"`,
      d.launch,
      d.volumes,
      d.buyers,
      d.revenue,
      (d.trend >= 0 ? "+" : "") + d.trend + "%",
    ]),
  ]
    .map((r) => r.join(","))
    .join("\n");

  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
  a.download = "crossed-hearts-revenue.csv";
  a.click();
}

/* ---- SWITCH TAB ---- */
function switchTab(btn, _chartId) {
  btn
    .closest(".panel-tabs")
    .querySelectorAll(".ptab")
    .forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
}

/* ---- INIT ---- */
document.addEventListener("DOMContentLoaded", () => {
  renderNotifications();
  loadAdminNotifications();
  connectAdminNotifications();
  initOverviewCharts();
  drawSparklines();
  animateCounters();
  renderGenreSpotlight();
  renderSessionsTable();
  renderTopTitles();
  renderTicker();
  startLiveSim();
  loadRealAdminDashboard();
});

/* ============================================================
   EXTENDED PAGE DATA & RENDERERS
   ============================================================ */

/* ---- READERS ANALYTICS ---- */
const COHORT_DATA = [
  { cohort: "Jan 2025", size: 980,  m: [100, 72, 61, 55, 50, 47] },
  { cohort: "Feb 2025", size: 1120, m: [100, 74, 63, 57, 52, 49] },
  { cohort: "Mar 2025", size: 1050, m: [100, 70, 59, 53, 48, null] },
  { cohort: "Apr 2025", size: 1280, m: [100, 76, 65, 59, null, null] },
  { cohort: "May 2025", size: 1340, m: [100, 75, 64, null, null, null] },
  { cohort: "Jun 2025", size: 1284, m: [100, 73, null, null, null, null] },
];

const COUNTRY_DATA = [
  { name: "United States",  pct: 32, readers: 3984 },
  { name: "Japan",          pct: 18, readers: 2241 },
  { name: "India",          pct: 12, readers: 1494 },
  { name: "South Korea",    pct: 9,  readers: 1120 },
  { name: "United Kingdom", pct: 7,  readers: 871  },
  { name: "Others",         pct: 22, readers: 2740 },
];

function renderCohortTable() {
  const tbody = document.getElementById("cohortTbody");
  if (!tbody) return;
  tbody.innerHTML = COHORT_DATA.map(row => {
    const cells = row.m.map(v => {
      if (v === null) return `<td style="color:var(--text-tertiary);font-size:11px">—</td>`;
      const alpha = Math.round((v / 100) * 0.7 * 255).toString(16).padStart(2,"0");
      return `<td style="background:rgba(201,160,80,${v/100*0.4});color:var(--text-primary);font-weight:600;font-size:12px">${v}%</td>`;
    }).join("");
    return `<tr>
      <td style="font-weight:600;color:var(--text-primary)">${row.cohort}</td>
      <td>${row.size.toLocaleString()}</td>
      ${cells}
    </tr>`;
  }).join("");
}

function renderCountryList() {
  const el = document.getElementById("countryList");
  if (!el) return;
  el.innerHTML = COUNTRY_DATA.map(c => `
    <div class="top-title-item">
      <div class="top-title-meta">
        <div class="top-title-name">${c.name}</div>
        <div class="genre-track" style="margin-top:4px">
          <div class="genre-fill" style="width:${c.pct}%;background:var(--gold)"></div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${c.pct}%</div>
        <div style="font-size:11px;color:var(--text-tertiary)">${c.readers.toLocaleString()}</div>
      </div>
    </div>
  `).join("");
}

let readerGrowthChart, readerSegChart;
function initReaderCharts() {
  if (readerGrowthChart) return;
  chartDefaults();

  const ctxG = document.getElementById("readerGrowthChart");
  if (ctxG) {
    readerGrowthChart = new Chart(ctxG.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"],
        datasets: [
          {
            label: "New Readers",
            data: [620,710,680,790,850,920,1100,980,1120,1050,1280,1284],
            backgroundColor: "rgba(201,160,80,0.7)",
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: "Churned",
            data: [-40,-55,-48,-62,-70,-80,-95,-88,-100,-92,-110,-105],
            backgroundColor: "rgba(248,113,113,0.5)",
            borderRadius: 5,
            borderSkipped: false,
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", align: "end" } },
        scales: {
          y: { grid: { color: gridColor() }, border: { display: false } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  const ctxS = document.getElementById("readerSegChart");
  if (ctxS) {
    readerSegChart = new Chart(ctxS.getContext("2d"), {
      type: "doughnut",
      data: {
        labels: ["Casual (1-2 titles)","Regular (3-5)","Power (6-10)","Super (11+)"],
        datasets: [{ data: [38,32,20,10], backgroundColor: ["#c9a050","#3b82f6","#10b981","#f472b6"], borderWidth: 0 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "68%",
        plugins: { legend: { position: "bottom", labels: { font: { size: 10 } } } }
      }
    });
  }
}

/* ---- TITLE PERFORMANCE ---- */
const TITLES_PERF_DATA = SERIES_DATA.map(d => ({
  ...d,
  reads: Math.round(d.buyers * (1.8 + Math.random())),
  completion: Math.round(45 + Math.random() * 40),
  rating: (3.5 + Math.random() * 1.4).toFixed(1),
  dropoff: Math.round(2 + Math.random() * 8),
  ongoing: Math.random() > 0.4,
}));

let titlesCatFilter = "all", titlesTitleFilter = "";
let titlesPage = 1;
const TITLES_PER_PAGE = 8;

function filterTitlesTable(val) { titlesTitleFilter = val.toLowerCase(); titlesPage=1; renderTitlesTable(); }
function filterTitlesCat(val) { titlesCatFilter = val; titlesPage=1; renderTitlesTable(); }

let activeTitleDropoffChart = null;

function renderTitlesTable() {
  const rows = TITLES_PERF_DATA.filter(d =>
    (titlesCatFilter === "all" || d.cat === titlesCatFilter) &&
    (!titlesTitleFilter || d.name.toLowerCase().includes(titlesTitleFilter))
  );
  const total = Math.ceil(rows.length / TITLES_PER_PAGE) || 1;
  if (titlesPage > total) titlesPage = total;
  const paged = rows.slice((titlesPage-1)*TITLES_PER_PAGE, titlesPage*TITLES_PER_PAGE);

  const tbody = document.getElementById("titlesPerfTbody");
  if (!tbody) return;

  const catCls = { manga:"cat-manga", glambeat:"cat-glambeat", blushclub:"cat-blushclub", novel:"cat-novel" };
  const catLbl = { manga:"Manga", glambeat:"Glam Beat", blushclub:"Blush Club", novel:"Novel" };

  tbody.innerHTML = paged.map(d => `
    <tr style="cursor:pointer" onclick="openTitleDetail('${d.id}')">
      <td><div style="font-weight:600;color:var(--text-primary);font-size:13px;max-width:200px;overflow:hidden;text-overflow:ellipsis">${d.name}</div></td>
      <td><span class="cat-badge ${catCls[d.cat]}">${catLbl[d.cat]}</span></td>
      <td style="color:var(--text-primary);font-weight:600">${d.volumes * 8}</td>
      <td style="color:var(--text-primary);font-weight:600">${d.reads.toLocaleString()}</td>
      <td>
        <div class="progress-wrap">
          <div class="progress-track"><div class="progress-fill" style="width:${d.completion}%"></div></div>
          <span class="progress-label">${d.completion}%</span>
        </div>
      </td>
      <td style="color:var(--gold);font-weight:600">${d.rating}★</td>
      <td style="color:var(--text-tertiary)">Ch. ${d.dropoff}</td>
      <td><span class="status-pill ${d.ongoing ? 'online' : 'idle'}">${d.ongoing ? 'Ongoing' : 'Completed'}</span></td>
      <td style="color:var(--gold);font-size:11px">View →</td>
    </tr>
  `).join("");

  const info = document.getElementById("titlesPagInfo");
  const btns = document.getElementById("titlesPagBtns");
  if (info) info.textContent = `Showing ${Math.min((titlesPage-1)*TITLES_PER_PAGE+1,rows.length)}–${Math.min(titlesPage*TITLES_PER_PAGE,rows.length)} of ${rows.length}`;
  if (btns) {
    btns.innerHTML = "";
    for (let p=1;p<=total;p++) {
      const b = document.createElement("button");
      b.className = "pag-btn" + (p===titlesPage?" active":"");
      b.textContent = p;
      const pp=p; b.onclick = (e)=>{ e.stopPropagation(); titlesPage=pp; renderTitlesTable(); };
      btns.appendChild(b);
    }
  }
}

/* ---- TITLE DETAIL VIEW ---- */

// Generates seeded-random chapter dropoff curve unique to each title
function generateDropoff(titleId, chapters, completion, dropoffCh) {
  // seed based on titleId string so same title always gets same curve
  let seed = titleId.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
  function seededRand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

  const pts = [100];
  for (let i = 1; i < chapters; i++) {
    const isDropoffZone = (i >= dropoffCh - 1 && i <= dropoffCh + 1);
    const baseDrop = isDropoffZone
      ? 4 + seededRand() * 8
      : 1 + seededRand() * 3;
    const prev = pts[i-1];
    pts.push(Math.max(completion - 5, prev - baseDrop));
  }
  // nudge last point close to completion %
  pts[pts.length-1] = completion + (seededRand() * 6 - 3);
  return pts.map(v => Math.round(Math.max(0, Math.min(100, v))));
}

function openTitleDetail(id) {
  const d = TITLES_PERF_DATA.find(t => t.id === id);
  if (!d) return;

  const chapters = d.volumes * 8;
  const dropoffData = generateDropoff(d.id, chapters, d.completion, d.dropoff);

  const catCls = { manga:"cat-manga", glambeat:"cat-glambeat", blushclub:"cat-blushclub", novel:"cat-novel" };
  const catLbl = { manga:"Manga", glambeat:"Glam Beat", blushclub:"Blush Club", novel:"Novel" };
  const trendCls = d.trend >= 0 ? "trend-up" : "trend-down";
  const trendSign = d.trend >= 0 ? "+" : "";

  // Revenue from SERIES_DATA
  const seriesRef = SERIES_DATA.find(s => s.id === id);
  const revenue = seriesRef ? seriesRef.revenue : 0;
  const buyers  = seriesRef ? seriesRef.buyers  : 0;

  // Remove any existing detail panel
  const existing = document.getElementById("titleDetailPanel");
  if (existing) existing.remove();

  // Build panel HTML
  const panel = document.createElement("div");
  panel.id = "titleDetailPanel";
  panel.style.cssText = `
    background:var(--bg-card);
    border:1px solid var(--border-md);
    border-radius:var(--r-xl);
    padding:0;
    margin-top:20px;
    overflow:hidden;
    animation: fadeIn 0.2s ease;
  `;

  panel.innerHTML = `
    <!-- Panel header -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border);background:var(--bg-elevated)">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:40px;height:56px;border-radius:6px;background:var(--bg-input);border:1px solid var(--border);background-image:url('${seriesRef && seriesRef.cover ? seriesRef.cover : ""}');background-size:cover;background-position:center;flex-shrink:0"></div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
            <span style="font-family:var(--font-display);font-size:16px;font-weight:700;color:var(--text-primary)">${d.name}</span>
            <span class="cat-badge ${catCls[d.cat]}">${catLbl[d.cat]}</span>
          </div>
          <div style="font-size:12px;color:var(--text-tertiary)">${d.genre} · ${d.volumes} vol${d.volumes>1?'s':''} · ${chapters} chapters · <span class="status-pill ${d.ongoing?'online':'idle'}" style="padding:1px 6px;font-size:10px">${d.ongoing?'Ongoing':'Completed'}</span></div>
        </div>
      </div>
      <button onclick="document.getElementById('titleDetailPanel').remove()"
        style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--r-md);color:var(--text-secondary);padding:6px 14px;cursor:pointer;font-size:12px;display:flex;align-items:center;gap:6px">
        ✕ Close
      </button>
    </div>

    <!-- KPI strip -->
    <div style="display:grid;grid-template-columns:repeat(6,1fr);border-bottom:1px solid var(--border)">
      ${[
        { label:"Total Reads",    val: d.reads.toLocaleString()               },
        { label:"Buyers",         val: buyers.toLocaleString()                 },
        { label:"Revenue",        val: "$"+revenue.toLocaleString()            },
        { label:"Completion",     val: d.completion+"%"                        },
        { label:"Avg Rating",     val: d.rating+"★"                           },
        { label:"30d Trend",      val: trendSign+d.trend+"%", cls: trendCls   },
      ].map(k=>`
        <div style="padding:14px 18px;border-right:1px solid var(--border);${k===5?'border-right:none':''}">
          <div style="font-size:10px;color:var(--text-tertiary);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">${k.label}</div>
          <div style="font-size:18px;font-weight:700;font-family:var(--font-display);color:var(--text-primary)" class="${k.cls||''}">${k.val}</div>
        </div>
      `).join("")}
    </div>

    <!-- Charts row -->
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr;gap:0;border-bottom:1px solid var(--border)">

      <!-- Dropoff chart -->
      <div style="padding:18px 20px;border-right:1px solid var(--border)">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px">Chapter-by-Chapter Reader Drop-off</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-bottom:12px">% of readers still active · biggest drop at Ch. ${d.dropoff}</div>
        <div style="height:180px;position:relative"><canvas id="dropoff_${d.id}"></canvas></div>
      </div>

      <!-- Rating breakdown -->
      <div style="padding:18px 20px;border-right:1px solid var(--border)">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px">Rating Breakdown</div>
        <div id="ratingBreakdown_${d.id}" style="display:flex;flex-direction:column;gap:8px"></div>
      </div>

      <!-- Device split -->
      <div style="padding:18px 20px">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px">Device Split</div>
        <div style="height:140px;position:relative"><canvas id="deviceSplit_${d.id}"></canvas></div>
        <div id="deviceSplitLegend_${d.id}" style="display:flex;justify-content:center;gap:12px;margin-top:8px"></div>
      </div>
    </div>

    <!-- Chapter engagement table -->
    <div style="padding:18px 20px">
      <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px">Chapter Engagement Breakdown</div>
      <div style="overflow-x:auto">
        <table class="data-table" style="min-width:600px">
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Readers Started</th>
              <th>Readers Finished</th>
              <th>Completion</th>
              <th>Avg Time Spent</th>
              <th>Drop-off Flag</th>
            </tr>
          </thead>
          <tbody id="chapterTbody_${d.id}"></tbody>
        </table>
      </div>
    </div>
  `;

  // Insert panel after the titles table data-card
  const titlesDataCard = document.querySelector("#page-titles .data-card");
  titlesDataCard.after(panel);

  // Scroll into view
  setTimeout(() => panel.scrollIntoView({ behavior:"smooth", block:"start" }), 50);

  // Now draw charts & fill data
  chartDefaults();

  // 1. Dropoff line chart
  const ctxDrop = document.getElementById(`dropoff_${d.id}`);
  if (ctxDrop) {
    if (activeTitleDropoffChart) { activeTitleDropoffChart.destroy(); activeTitleDropoffChart = null; }
    activeTitleDropoffChart = new Chart(ctxDrop.getContext("2d"), {
      type: "line",
      data: {
        labels: Array.from({length:chapters},(_,i)=>"Ch."+(i+1)),
        datasets: [{
          label: "Readers Active (%)",
          data: dropoffData,
          borderColor: "#c9a050",
          backgroundColor: "rgba(201,160,80,0.08)",
          fill: true, tension: 0.4, borderWidth: 2,
          pointRadius: dropoffData.map((_,i)=> i===d.dropoff-1 ? 5 : 0),
          pointBackgroundColor: "#f87171",
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{
          legend:{display:false},
          tooltip:{ callbacks:{ label: ctx => ctx.parsed.y.toFixed(0)+"% still reading" } }
        },
        scales:{
          y:{ beginAtZero:false, min: Math.max(0, d.completion-10), max:100,
              grid:{color:gridColor()}, border:{display:false},
              ticks:{callback:v=>v+"%"} },
          x:{ grid:{display:false}, ticks:{maxTicksLimit:chapters<=16?chapters:10} }
        }
      }
    });
  }

  // 2. Rating breakdown bars
  const rbEl = document.getElementById(`ratingBreakdown_${d.id}`);
  if (rbEl) {
    // Generate seeded rating dist that averages near d.rating
    let seed2 = d.id.split("").reduce((a,c)=>a+c.charCodeAt(0)*7,0);
    function sr2(){ seed2=(seed2*9301+49297)%233280; return seed2/233280; }
    const base = parseFloat(d.rating);
    // 5★ heavy if rating high, 1★ heavy if rating low
    const raw = [
      Math.round(sr2()*10 + (base > 4 ? 50 : 15)),
      Math.round(sr2()*15 + (base > 3.5 ? 25 : 20)),
      Math.round(sr2()*12 + 15),
      Math.round(sr2()*8  + (base < 3.5 ? 20 : 8)),
      Math.round(sr2()*6  + (base < 3 ? 15 : 3)),
    ];
    const total5 = raw.reduce((a,b)=>a+b,0);
    rbEl.innerHTML = [5,4,3,2,1].map((star,i)=>{
      const pct = Math.round(raw[i]/total5*100);
      return `
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:11px;color:var(--gold);min-width:20px">${star}★</span>
          <div class="genre-track" style="flex:1">
            <div class="genre-fill" style="width:${pct}%;background:${star>=4?'var(--gold)':star===3?'#fbbf24':'#f87171'}"></div>
          </div>
          <span style="font-size:11px;color:var(--text-tertiary);min-width:28px;text-align:right">${pct}%</span>
        </div>`;
    }).join("");
  }

  // 3. Device split doughnut
  let seed3 = d.id.split("").reduce((a,c)=>a+c.charCodeAt(0)*13,0);
  function sr3(){ seed3=(seed3*9301+49297)%233280; return seed3/233280; }
  const mob = Math.round(50 + sr3()*20);
  const desk = Math.round((100-mob)*0.6);
  const tab = 100-mob-desk;

  const ctxDev = document.getElementById(`deviceSplit_${d.id}`);
  if (ctxDev) {
    new Chart(ctxDev.getContext("2d"), {
      type:"doughnut",
      data:{
        labels:["Mobile","Desktop","Tablet"],
        datasets:[{ data:[mob,desk,tab], backgroundColor:["#c9a050","#3b82f6","#10b981"], borderWidth:0 }]
      },
      options:{ responsive:true, maintainAspectRatio:false, cutout:"68%", plugins:{legend:{display:false}} }
    });
    const legEl = document.getElementById(`deviceSplitLegend_${d.id}`);
    if (legEl) {
      legEl.innerHTML = [
        {color:"#c9a050",label:"Mobile",pct:mob},
        {color:"#3b82f6",label:"Desktop",pct:desk},
        {color:"#10b981",label:"Tablet",pct:tab},
      ].map(x=>`
        <div class="legend-item">
          <div class="legend-dot" style="background:${x.color}"></div>
          <span>${x.label}</span>
          <strong style="color:var(--text-primary);font-size:11px">${x.pct}%</strong>
        </div>`).join("");
    }
  }

  // 4. Chapter engagement table
  const chTbody = document.getElementById(`chapterTbody_${d.id}`);
  if (chTbody) {
    let seed4 = d.id.split("").reduce((a,c)=>a+c.charCodeAt(0)*17,0);
    function sr4(){ seed4=(seed4*9301+49297)%233280; return seed4/233280; }

    const baseReaders = d.reads;
    const rows = Array.from({length:chapters},(_,i)=>{
      const startPct = dropoffData[i] / 100;
      const endPct   = i+1 < chapters ? dropoffData[i+1]/100 : dropoffData[i]/100 * 0.97;
      const started  = Math.round(baseReaders * startPct);
      const finished = Math.round(baseReaders * endPct);
      const comp     = started > 0 ? Math.round(finished/started*100) : 0;
      const mins     = Math.round(8 + sr4()*12);
      const isBigDrop = i === d.dropoff-1;
      return { ch:i+1, started, finished, comp, mins, isBigDrop };
    });

    chTbody.innerHTML = rows.map(r=>`
      <tr style="${r.isBigDrop?'background:rgba(248,113,113,0.05)':''}">
        <td style="font-weight:600;color:var(--text-primary)">Chapter ${r.ch}${r.isBigDrop?' <span style="color:#f87171;font-size:10px">● Biggest drop</span>':''}</td>
        <td>${r.started.toLocaleString()}</td>
        <td>${r.finished.toLocaleString()}</td>
        <td>
          <div class="progress-wrap">
            <div class="progress-track"><div class="progress-fill" style="width:${r.comp}%;background:${r.comp>80?'#4ade80':r.comp>60?'var(--gold)':'#f87171'}"></div></div>
            <span class="progress-label">${r.comp}%</span>
          </div>
        </td>
        <td style="color:var(--text-tertiary)">${r.mins}m avg</td>
        <td>${r.isBigDrop?'<span style="color:#f87171;font-size:11px;font-weight:600">⚠ High drop-off</span>':'<span style="color:var(--text-tertiary);font-size:11px">—</span>'}</td>
      </tr>
    `).join("");
  }
}

let completionCatChart;
function initTitleCharts() {
  if (completionCatChart) return;
  chartDefaults();

  const ctxC = document.getElementById("completionCatChart");
  if (ctxC) {
    completionCatChart = new Chart(ctxC.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Manga","Glam Beat","Blush Club","Novel"],
        datasets: [{
          label: "Avg Completion %",
          data: [63, 58, 55, 71],
          backgroundColor: ["#c9a050","#4ade80","#f472b6","#818cf8"],
          borderRadius:6, borderSkipped:false
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{
          y:{ beginAtZero:true, max:100, grid:{color:gridColor()}, border:{display:false},
              ticks:{ callback:v=>v+"%" } },
          x:{ grid:{display:false} }
        }
      }
    });
  }
}

/* ---- ENGAGEMENT ---- */
const STREAK_DATA = [
  { name: "nova_reads",   days: 47, titles: 9  },
  { name: "MangaFan99",  days: 38, titles: 12 },
  { name: "k_reader22",  days: 31, titles: 6  },
  { name: "Sarah J.",    days: 28, titles: 8  },
  { name: "Alice W.",    days: 22, titles: 5  },
];

let engagementChart, sessionFreqChart;
function initEngagementCharts() {
  if (engagementChart) return;
  chartDefaults();

  const ctxE = document.getElementById("engagementChart");
  if (ctxE) {
    engagementChart = new Chart(ctxE.getContext("2d"), {
      type: "line",
      data: {
        labels: Array.from({length:30},(_,i)=>i+1),
        datasets: [
          {
            label: "DAU",
            data: [5200,5400,5100,5600,5800,5500,6000,6200,5900,6400,6600,6300,6800,7000,6700,7200,7400,7100,7600,7800,7500,8000,8200,7900,8400,8600,8300,8800,9000,8924],
            borderColor:"#c9a050", backgroundColor:"rgba(201,160,80,0.07)",
            fill:true, tension:0.4, borderWidth:2, pointRadius:0, yAxisID:"y"
          },
          {
            label: "Pages Read (k)",
            data: [72,78,74,81,84,80,88,91,86,94,97,92,100,103,98,106,109,104,112,115,110,118,122,117,124,128,122,131,135,132],
            borderColor:"#818cf8", backgroundColor:"transparent",
            borderDash:[4,4], tension:0.4, borderWidth:1.5, pointRadius:0, yAxisID:"y1"
          }
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:"top", align:"end" } },
        scales:{
          y:{ grid:{color:gridColor()}, border:{display:false}, position:"left" },
          y1:{ grid:{display:false}, border:{display:false}, position:"right" },
          x:{ grid:{display:false}, ticks:{maxTicksLimit:8} }
        },
        interaction:{ intersect:false, mode:"index" }
      }
    });
  }

  const ctxF = document.getElementById("sessionFreqChart");
  if (ctxF) {
    sessionFreqChart = new Chart(ctxF.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["1/week","2-3/week","Daily","2x Daily","3+/day"],
        datasets: [{
          label: "Users",
          data: [2100, 3400, 3800, 1600, 520],
          backgroundColor:"rgba(201,160,80,0.7)",
          borderRadius:5, borderSkipped:false
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{
          y:{ grid:{color:gridColor()}, border:{display:false} },
          x:{ grid:{display:false} }
        }
      }
    });
  }
}

function renderFunnel() {
  const el = document.getElementById("funnelContainer");
  if (!el) return;
  const steps = [
    { label: "Visited Platform",    val: 42800, pct: 100 },
    { label: "Registered Account",  val: 12450, pct: 29  },
    { label: "Read First Chapter",  val: 10820, pct: 25  },
    { label: "Completed 1 Title",   val: 7640,  pct: 18  },
    { label: "Made 1st Purchase",   val: 3842,  pct: 9   },
    { label: "Repeat Buyer",        val: 1920,  pct: 4.5 },
  ];
  el.innerHTML = steps.map((s,i) => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px">
        <span style="font-size:13px;color:var(--text-primary);font-weight:500">${s.label}</span>
        <span style="font-size:13px;color:var(--text-primary);font-weight:600">${s.val.toLocaleString()} <span style="color:var(--text-tertiary);font-weight:400;font-size:11px">(${s.pct}%)</span></span>
      </div>
      <div class="genre-track">
        <div class="genre-fill" style="width:${s.pct}%;background:${i===0?'var(--gold)':i===4?'#4ade80':'rgba(201,160,80,'+(0.9-i*0.12)+')'}"></div>
      </div>
    </div>
  `).join("");
}

function renderStreakList() {
  const el = document.getElementById("streakList");
  if (!el) return;
  el.innerHTML = STREAK_DATA.map((s,i) => `
    <div class="top-title-item">
      <span class="top-title-rank">#${i+1}</span>
      <div class="user-avatar" style="width:32px;height:32px;font-size:12px;flex-shrink:0">${s.name[0].toUpperCase()}</div>
      <div class="top-title-meta">
        <div class="top-title-name">${s.name}</div>
        <div class="top-title-stats">${s.titles} titles · ${s.days}-day streak</div>
      </div>
      <span class="top-title-change up">🔥${s.days}d</span>
    </div>
  `).join("");
}

/* ---- READING BEHAVIOUR ---- */
let deviceCompChart, scrollDepthChart, sessionLengthChart;
function initBehaviourCharts() {
  if (deviceCompChart) return;
  chartDefaults();

  const ctxDev = document.getElementById("deviceCompChart");
  if (ctxDev) {
    deviceCompChart = new Chart(ctxDev.getContext("2d"), {
      type: "radar",
      data: {
        labels: ["Session Length","Pages/Session","Return Rate","Completion","Purchase Rate","Rating Given"],
        datasets: [
          { label:"Mobile", data:[72,65,68,60,58,70], borderColor:"#c9a050", backgroundColor:"rgba(201,160,80,0.12)", pointRadius:3 },
          { label:"Desktop", data:[85,80,74,72,68,65], borderColor:"#3b82f6", backgroundColor:"rgba(59,130,246,0.12)", pointRadius:3 },
          { label:"Tablet", data:[78,70,65,68,55,72], borderColor:"#10b981", backgroundColor:"rgba(16,185,129,0.12)", pointRadius:3 },
        ]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:"bottom", labels:{ font:{size:10} } } },
        scales:{ r:{ grid:{color:gridColor()}, ticks:{display:false}, pointLabels:{font:{size:10}} } }
      }
    });
  }

  const ctxScr = document.getElementById("scrollDepthChart");
  if (ctxScr) {
    scrollDepthChart = new Chart(ctxScr.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["0-25%","25-50%","50-75%","75-90%","90-100%"],
        datasets: [{
          label:"Sessions",
          data:[8,14,22,29,27],
          backgroundColor:["rgba(248,113,113,0.7)","rgba(251,191,36,0.7)","rgba(201,160,80,0.7)","rgba(74,222,128,0.6)","rgba(74,222,128,0.9)"],
          borderRadius:5, borderSkipped:false
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{
          y:{ grid:{color:gridColor()}, border:{display:false}, ticks:{callback:v=>v+"%"} },
          x:{ grid:{display:false} }
        }
      }
    });
  }

  const ctxLen = document.getElementById("sessionLengthChart");
  if (ctxLen) {
    sessionLengthChart = new Chart(ctxLen.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["<5m","5-15m","15-30m","30-60m","1-2h",">2h"],
        datasets: [{
          label:"% of Sessions",
          data:[12,18,28,24,13,5],
          backgroundColor:"rgba(201,160,80,0.7)",
          borderRadius:5, borderSkipped:false
        }]
      },
      options: {
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{
          y:{ grid:{color:gridColor()}, border:{display:false}, ticks:{callback:v=>v+"%"} },
          x:{ grid:{display:false} }
        }
      }
    });
  }
}

function renderHeatmap() {
  const el = document.getElementById("heatmapContainer");
  if (!el) return;
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const hours = ["12am","3am","6am","9am","12pm","3pm","6pm","9pm"];
  const data = [
    [5,2,1,3,8,15,22,18],
    [6,2,1,4,9,16,24,20],
    [5,2,1,4,8,15,23,19],
    [6,3,2,5,10,17,25,21],
    [7,3,2,5,9,16,24,20],
    [10,5,4,8,20,30,35,28],
    [12,6,5,9,22,32,38,30],
  ];
  const max = 38;
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:40px repeat(8,1fr);gap:3px;padding:0 4px">
      <div></div>
      ${hours.map(h=>`<div style="font-size:10px;color:var(--text-tertiary);text-align:center;padding-bottom:4px">${h}</div>`).join("")}
      ${days.map((day,di)=>
        `<div style="font-size:11px;color:var(--text-tertiary);display:flex;align-items:center">${day}</div>` +
        data[di].map(v=>{
          const alpha = (v/max*0.85+0.05).toFixed(2);
          return `<div title="${v} sessions" style="height:28px;border-radius:4px;background:rgba(201,160,80,${alpha})"></div>`;
        }).join("")
      ).join("")}
    </div>
    <div style="display:flex;align-items:center;gap:6px;justify-content:flex-end;padding:8px 8px 0;font-size:10px;color:var(--text-tertiary)">
      Low
      ${[0.08,0.25,0.45,0.65,0.85].map(a=>`<div style="width:16px;height:10px;border-radius:2px;background:rgba(201,160,80,${a})"></div>`).join("")}
      High
    </div>
  `;
}

/* ---- SYSTEM MONITORING ---- */
const INCIDENT_DATA = [
  { time: "May 24, 02:14", severity: "warning", service: "CDN", desc: "Elevated latency in Asia-Pacific region", status: "resolved", duration: "18 min" },
  { time: "May 22, 14:32", severity: "error",   service: "Payments API", desc: "Payment gateway timeout — 3 retries", status: "resolved", duration: "4 min" },
  { time: "May 20, 09:05", severity: "info",    service: "Database", desc: "Scheduled maintenance window", status: "resolved", duration: "45 min" },
  { time: "May 18, 17:48", severity: "warning", service: "Auth Service", desc: "Token refresh rate spike", status: "resolved", duration: "7 min" },
  { time: "May 15, 11:20", severity: "error",   service: "Image CDN", desc: "Cover images failing to load for 0.4% of users", status: "resolved", duration: "12 min" },
];

const SERVICE_STATUS = [
  { name: "Content API",     status: "operational", latency: "112ms" },
  { name: "Auth Service",    status: "operational", latency: "48ms"  },
  { name: "Payment Gateway", status: "operational", latency: "220ms" },
  { name: "Image CDN",       status: "operational", latency: "38ms"  },
  { name: "Database",        status: "operational", latency: "38ms"  },
  { name: "Search Service",  status: "degraded",    latency: "380ms" },
  { name: "Email Service",   status: "operational", latency: "95ms"  },
];

let apiResponseChart, errorDistChart;
function initSystemCharts() {
  if (apiResponseChart) return;
  chartDefaults();

  const ctxA = document.getElementById("apiResponseChart");
  if (ctxA) {
    apiResponseChart = new Chart(ctxA.getContext("2d"), {
      type:"line",
      data:{
        labels: Array.from({length:24},(_,i)=>i+":00"),
        datasets:[
          { label:"Avg (ms)", data:[130,125,120,118,115,122,145,162,158,148,142,138,135,140,145,150,148,155,162,158,152,148,142,138],
            borderColor:"#c9a050", backgroundColor:"rgba(201,160,80,0.07)", fill:true, tension:0.4, borderWidth:2, pointRadius:0 },
          { label:"P95 (ms)", data:[210,200,195,190,185,198,235,265,258,240,230,225,220,228,235,242,240,250,262,255,248,240,232,225],
            borderColor:"#f87171", backgroundColor:"transparent", borderDash:[4,4], tension:0.4, borderWidth:1.5, pointRadius:0 }
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:"top", align:"end" } },
        scales:{
          y:{ grid:{color:gridColor()}, border:{display:false}, ticks:{ callback:v=>v+"ms" } },
          x:{ grid:{display:false}, ticks:{maxTicksLimit:8} }
        },
        interaction:{ intersect:false, mode:"index" }
      }
    });
  }

  const ctxE = document.getElementById("errorDistChart");
  if (ctxE) {
    errorDistChart = new Chart(ctxE.getContext("2d"), {
      type:"doughnut",
      data:{
        labels:["404 Not Found","500 Server Error","429 Rate Limit","401 Auth Failed","503 Timeout"],
        datasets:[{ data:[42,18,24,10,6], backgroundColor:["#fbbf24","#f87171","#818cf8","#f472b6","#94a3b8"], borderWidth:0 }]
      },
      options:{ responsive:true, maintainAspectRatio:false, cutout:"62%", plugins:{ legend:{ position:"bottom", labels:{ font:{size:10} } } } }
    });
  }
}

function renderIncidents() {
  const tbody = document.getElementById("incidentTbody");
  if (!tbody) return;
  const sevColor = { warning:"#fbbf24", error:"#f87171", info:"#3b82f6" };
  const sevLabel = { warning:"Warning", error:"Critical", info:"Info" };
  tbody.innerHTML = INCIDENT_DATA.map(d=>`
    <tr>
      <td style="font-size:11px;color:var(--text-tertiary);white-space:nowrap">${d.time}</td>
      <td><span style="color:${sevColor[d.severity]};font-size:11px;font-weight:600">${sevLabel[d.severity]}</span></td>
      <td style="color:var(--text-primary);font-weight:500">${d.service}</td>
      <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis">${d.desc}</td>
      <td><span class="status-pill online">Resolved</span></td>
      <td style="color:var(--text-tertiary);font-size:12px">${d.duration}</td>
    </tr>
  `).join("");
}

function renderServiceStatus() {
  const el = document.getElementById("serviceStatusList");
  if (!el) return;
  el.innerHTML = SERVICE_STATUS.map(s=>`
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-size:13px;font-weight:500;color:var(--text-primary)">${s.name}</div>
        <div style="font-size:11px;color:var(--text-tertiary);margin-top:1px">${s.latency}</div>
      </div>
      <span class="status-pill ${s.status==='operational'?'online':'idle'}" style="font-size:10px">
        <span class="status-dot"></span>${s.status==='operational'?'Operational':'Degraded'}
      </span>
    </div>
  `).join("");
}

let PHYSICAL_ORDERS_CACHE = [];

function physicalStatusSelect(orderId, field, value, options) {
  return `
    <select class="table-select" style="min-width:120px" onchange="updatePhysicalOrder('${orderId}', '${field}', this.value)">
      ${options
        .map(
          (option) =>
            `<option value="${option}" ${option === value ? "selected" : ""}>${option}</option>`,
        )
        .join("")}
    </select>
  `;
}

function physicalOrderNoteButton(orderId, currentNote = "") {
  return `
    <button class="btn-ghost" style="padding:4px 10px;font-size:11px;margin-top:8px"
      onclick="editPhysicalOrderNote('${orderId}')">
      ${currentNote ? "Edit Note" : "Add Note"}
    </button>
  `;
}

function formatPhysicalOrderMoney(order, value) {
  const currency = String(order.currency || "USD").toUpperCase();
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (_) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function physicalOrderPaymentLabel(status) {
  const clean = String(status || "pending").toLowerCase();
  if (clean === "paid") return "Paid";
  if (clean === "failed") return "Failed";
  if (clean === "refunded") return "Refunded";
  return "Not paid yet";
}

function physicalOrderAddressText(address = {}) {
  return physicalOrderAddressRaw(address)
    .split(", ")
    .filter(Boolean)
    .map(escapeAdminHtml)
    .join(", ");
}

function physicalOrderAddressRaw(address = {}) {
  return [
    address.addressLine1 || address.line1,
    address.addressLine2 || address.line2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function renderPhysicalOrders(orders = []) {
  const el = document.getElementById("physicalOrdersContent");
  if (!el) return;
  if (!orders.length) {
    el.innerHTML = `
      <div class="data-card">
        <div style="padding:22px 24px;color:var(--text-tertiary)">No physical book orders yet.</div>
      </div>
    `;
    return;
  }

  el.innerHTML = `
    <div class="data-card">
      <div class="data-card-head">
        <h3 class="panel-title">All Physical Orders</h3>
        <span style="font-size:11px;color:var(--text-tertiary)">${orders.length} latest orders, newest first</span>
      </div>
      <div style="display:grid;gap:14px;padding:16px">
        ${orders
          .map((order) => {
            const address = order.shippingAddress || {};
            const customer = order.customer || {};
            const items = order.items || [];
            const addressText = physicalOrderAddressText(address);
            const paymentStatus = String(order.paymentStatus || "pending").toLowerCase();
            const paymentColor =
              paymentStatus === "paid"
                ? "#4ade80"
                : paymentStatus === "failed"
                  ? "#f87171"
                  : paymentStatus === "refunded"
                    ? "#facc15"
                    : "var(--text-tertiary)";
            const paymentIds = [
              order.paymentProvider ? `Provider: ${order.paymentProvider}` : "",
              order.paymentReference ? `Reference: ${order.paymentReference}` : "",
              order.razorpayOrderId ? `Razorpay order: ${order.razorpayOrderId}` : "",
              order.razorpayPaymentId ? `Razorpay payment: ${order.razorpayPaymentId}` : "",
            ].filter(Boolean);
            const itemRows = items.length
              ? items
                  .map(
                    (item) => `
                      <div style="display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.06)">
                        <div>
                          <div style="color:var(--text-primary);font-weight:600">${escapeAdminHtml(item.title || "Untitled book")}</div>
                          <div style="font-size:11px;color:var(--text-tertiary)">${escapeAdminHtml(item.format || item.edition || "Print")} · Qty ${Number(item.quantity || 1)}</div>
                        </div>
                        <div style="color:var(--gold);font-weight:700;white-space:nowrap">${formatPhysicalOrderMoney(order, item.unitPrice ?? item.price)}</div>
                      </div>
                    `,
                  )
                  .join("")
              : `<div style="font-size:12px;color:var(--text-tertiary)">No item details stored.</div>`;

            return `
              <div style="border:1px solid var(--border);border-radius:8px;padding:16px;background:rgba(255,255,255,.02)">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:14px">
                  <div>
                    <div style="font-size:12px;color:var(--text-tertiary)">Order</div>
                    <strong style="color:var(--text-primary);font-size:15px">${escapeAdminHtml(order.orderNumber || order._id)}</strong>
                    <div style="font-size:11px;color:var(--text-tertiary);margin-top:3px">${order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}</div>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:12px;color:var(--text-tertiary)">Total</div>
                    <div style="color:var(--gold);font-weight:800;font-size:17px">${formatPhysicalOrderMoney(order, order.total)}</div>
                    <div style="font-size:11px;color:var(--text-tertiary)">Subtotal ${formatPhysicalOrderMoney(order, order.subtotal)} · Shipping ${formatPhysicalOrderMoney(order, order.shippingFee)}</div>
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px">
                  <div>
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:8px">Customer</div>
                    <div style="color:var(--text-primary);font-weight:700">${escapeAdminHtml(customer.name || address.fullName || order.userId?.name || "Customer")}</div>
                    <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px">${escapeAdminHtml(customer.email || address.email || order.userId?.email || "")}</div>
                    <div style="font-size:12px;color:var(--text-tertiary);margin-top:4px">${escapeAdminHtml(customer.phone || address.phone || "")}</div>
                    <div style="font-size:11px;color:var(--text-tertiary);margin-top:8px">User ID: ${escapeAdminHtml(order.userId?._id || order.userId || "-")}</div>
                  </div>

                  <div>
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:8px">Shipping Address</div>
                    <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">${addressText || "-"}</div>
                    <div style="margin-top:10px">${physicalStatusSelect(order._id, "fulfillmentStatus", order.fulfillmentStatus, ["received", "processing", "packed", "shipped", "delivered", "cancelled"])}</div>
                    <div style="font-size:11px;color:var(--text-tertiary);margin-top:8px">Tracking: ${escapeAdminHtml(order.trackingNumber || "Not added")}</div>
                  </div>

                  <div>
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:8px">Payment</div>
                    <div style="color:${paymentColor};font-weight:800;margin-bottom:8px">${physicalOrderPaymentLabel(order.paymentStatus)}</div>
                    ${physicalStatusSelect(order._id, "paymentStatus", order.paymentStatus, ["pending", "paid", "failed", "refunded"])}
                    <div style="font-size:11px;color:var(--text-tertiary);line-height:1.6;margin-top:8px">${paymentIds.map(escapeAdminHtml).join("<br>") || "No payment reference stored."}</div>
                  </div>

                  <div>
                    <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-tertiary);margin-bottom:8px">Ordered Books</div>
                    ${itemRows}
                  </div>
                </div>

                <div style="margin-top:14px;border-top:1px solid rgba(255,255,255,.06);padding-top:12px">
                  <div style="font-size:11px;color:var(--text-tertiary);white-space:normal">${escapeAdminHtml(order.notes || "No admin note")}</div>
                  ${physicalOrderNoteButton(order._id, order.notes || "")}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

async function loadPhysicalOrders() {
  const el = document.getElementById("physicalOrdersContent");
  if (el) {
    el.innerHTML = `
      <div class="data-card">
        <div style="padding:22px 24px;color:var(--text-tertiary)">Loading physical orders...</div>
      </div>
    `;
  }
  try {
    const data = await adminApi("/physical-orders?limit=100");
    PHYSICAL_ORDERS_CACHE = data.orders || [];
    renderPhysicalOrders(PHYSICAL_ORDERS_CACHE);
  } catch (err) {
    if (el) {
      el.innerHTML = `
        <div class="data-card">
          <div style="padding:22px 24px;color:#f87171">Could not load physical orders: ${escapeAdminHtml(err.message)}</div>
        </div>
      `;
    }
  }
}

async function updatePhysicalOrder(orderId, field, value) {
  try {
    await adminApi(`/physical-orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ [field]: value }),
    });
    showAdminOrderToast("Physical order updated.");
  } catch (err) {
    alert("Could not update order: " + err.message);
  } finally {
    loadPhysicalOrders();
  }
}

async function editPhysicalOrderNote(orderId) {
  const order = PHYSICAL_ORDERS_CACHE.find((item) => String(item._id) === String(orderId));
  const nextNote = prompt("Admin note for this physical order:", order?.notes || "");
  if (nextNote === null) return;
  try {
    await adminApi(`/physical-orders/${orderId}`, {
      method: "PATCH",
      body: JSON.stringify({ notes: nextNote }),
    });
    showAdminOrderToast("Order note saved.");
  } catch (err) {
    alert("Could not save note: " + err.message);
  } finally {
    loadPhysicalOrders();
  }
}

function exportPhysicalOrdersCSV() {
  const rows = (PHYSICAL_ORDERS_CACHE || []).map((order) => {
    const address = order.shippingAddress || {};
    const customer = order.customer || {};
    const items = (order.items || [])
      .map((item) => `${item.title || "Untitled"} x ${Number(item.quantity || 1)}`)
      .join("; ");
    return [
      order.orderNumber || order._id || "",
      order.createdAt ? new Date(order.createdAt).toLocaleString() : "",
      customer.name || address.fullName || order.userId?.name || "",
      customer.email || address.email || order.userId?.email || "",
      customer.phone || address.phone || "",
      physicalOrderAddressRaw(address),
      items,
      order.currency || "",
      order.subtotal || 0,
      order.shippingFee || 0,
      order.total || 0,
      order.paymentStatus || "",
      order.paymentProvider || "",
      order.paymentReference || "",
      order.razorpayOrderId || "",
      order.razorpayPaymentId || "",
      order.fulfillmentStatus || "",
      order.trackingNumber || "",
      order.notes || "",
    ];
  });

  if (!rows.length) {
    alert("No physical orders are loaded yet.");
    return;
  }

  adminDownloadCsv(
    "physical-orders.csv",
    [
      "Order Number",
      "Created At",
      "Customer Name",
      "Customer Email",
      "Customer Phone",
      "Shipping Address",
      "Items",
      "Currency",
      "Subtotal",
      "Shipping Fee",
      "Total",
      "Payment Status",
      "Payment Provider",
      "Payment Reference",
      "Razorpay Order ID",
      "Razorpay Payment ID",
      "Shipping Status",
      "Tracking Number",
      "Admin Note",
    ],
    rows,
  );
}

function showAdminOrderToast(message) {
  const el = document.getElementById("physicalOrdersContent");
  if (!el) return;
  const toast = document.createElement("div");
  toast.style.cssText = "position:fixed;right:24px;bottom:24px;z-index:50;background:var(--bg-elevated);border:1px solid var(--border);color:var(--text-primary);padding:12px 16px;border-radius:10px;box-shadow:0 12px 28px rgba(0,0,0,.24);font-size:13px";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

/* ---- REPORTS ---- */
const REPORTS_DATA = [
  { name:"Monthly Overview — May 2025", type:"PDF", date:"May 1, 2025", size:"2.4 MB" },
  { name:"Revenue by Series Q1 2025",  type:"CSV", date:"Apr 1, 2025", size:"124 KB" },
  { name:"Reader Cohort Analysis",      type:"PDF", date:"Mar 15, 2025", size:"1.8 MB" },
  { name:"Title Performance Report",    type:"CSV", date:"Mar 1, 2025",  size:"88 KB"  },
  { name:"Monthly Overview — Feb 2025", type:"PDF", date:"Mar 1, 2025",  size:"2.1 MB" },
];

const SCHEDULED_DATA = [
  { name:"Weekly KPI Summary",     freq:"Every Monday",     next:"Jun 2"   },
  { name:"Monthly Revenue Report", freq:"1st of Month",     next:"Jun 1"   },
  { name:"Reader Growth Report",   freq:"Every 2 weeks",    next:"Jun 5"   },
];

const TEMPLATE_DATA = [
  { name:"Executive Summary",  desc:"High-level KPIs, revenue and reader growth",       icon:"📊" },
  { name:"Revenue Deep-Dive",  desc:"Full financial breakdown by series and category",  icon:"💰" },
  { name:"Reader Analytics",   desc:"Cohort retention, growth, churn and segments",     icon:"👥" },
  { name:"Title Performance",  desc:"Completion, drop-off and engagement per title",    icon:"📚" },
  { name:"Engagement Report",  desc:"Session stats, streaks and funnel analysis",       icon:"📈" },
  { name:"System Health",      desc:"API uptime, errors and incident history",          icon:"🖥️" },
];

function downloadAdminReport(index = 0) {
  const report = REPORTS_DATA[index] || REPORTS_DATA[0];
  if (!report) {
    alert("No report is available to download.");
    return;
  }

  const slug = report.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (report.type === "CSV") {
    adminDownloadCsv(
      `${slug || "admin-report"}.csv`,
      ["Report", "Type", "Date", "Size", "Generated From"],
      [[report.name, report.type, report.date, report.size, "HeartsReader Admin Dashboard"]],
    );
    return;
  }

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeAdminHtml(report.name)}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:32px;color:#111}
    h1{margin:0 0 8px}
    table{border-collapse:collapse;margin-top:24px;width:100%}
    td,th{border:1px solid #ddd;padding:10px;text-align:left}
  </style>
</head>
<body>
  <h1>${escapeAdminHtml(report.name)}</h1>
  <p>Generated from HeartsReader Admin Dashboard.</p>
  <table>
    <tr><th>Type</th><td>${escapeAdminHtml(report.type)}</td></tr>
    <tr><th>Date</th><td>${escapeAdminHtml(report.date)}</td></tr>
    <tr><th>Listed Size</th><td>${escapeAdminHtml(report.size)}</td></tr>
  </table>
</body>
</html>`;
  adminDownloadText(`${slug || "admin-report"}.html`, html, "text/html;charset=utf-8");
}

function downloadAdminInvoice(invoiceLabel = "Admin invoice") {
  const slug = invoiceLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeAdminHtml(invoiceLabel)}</title>
  <style>
    body{font-family:Arial,sans-serif;padding:32px;color:#111}
    h1{margin:0 0 8px}
    table{border-collapse:collapse;margin-top:24px;width:100%}
    td,th{border:1px solid #ddd;padding:10px;text-align:left}
  </style>
</head>
<body>
  <h1>${escapeAdminHtml(invoiceLabel)}</h1>
  <p>Generated from HeartsReader Admin Dashboard billing records.</p>
  <table>
    <tr><th>Plan</th><td>Enterprise</td></tr>
    <tr><th>Invoice</th><td>${escapeAdminHtml(invoiceLabel)}</td></tr>
  </table>
</body>
</html>`;
  adminDownloadText(`${slug || "admin-invoice"}.html`, html, "text/html;charset=utf-8");
}

function renderReportsPage() {
  const tbody = document.getElementById("reportsTbody");
  if (tbody) {
    tbody.innerHTML = REPORTS_DATA.map((r, index)=>`
      <tr>
        <td style="color:var(--text-primary);font-weight:500">${r.name}</td>
        <td><span class="cat-badge ${r.type==='PDF'?'cat-blushclub':'cat-glambeat'}">${r.type}</span></td>
        <td style="color:var(--text-tertiary);font-size:12px">${r.date}</td>
        <td style="color:var(--text-tertiary);font-size:12px">${r.size}</td>
        <td>
          <button class="btn-ghost" style="padding:3px 10px;font-size:11px" onclick="downloadAdminReport(${index})">Download</button>
        </td>
      </tr>
    `).join("");
  }

  const sched = document.getElementById("scheduledList");
  if (sched) {
    sched.innerHTML = SCHEDULED_DATA.map(s=>`
      <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:2px">${s.name}</div>
        <div style="font-size:11px;color:var(--text-tertiary)">${s.freq} · Next: ${s.next}</div>
      </div>
    `).join("");
  }

  const grid = document.getElementById("templateGrid");
  if (grid) {
    grid.innerHTML = TEMPLATE_DATA.map(t=>`
      <div style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px;cursor:pointer;transition:border-color var(--transition)"
           onmouseover="this.style.borderColor='rgba(201,160,80,0.4)'" onmouseout="this.style.borderColor='var(--border)'"
           onclick="alert('Generating ${t.name}…')">
        <div style="font-size:20px;margin-bottom:8px">${t.icon}</div>
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px">${t.name}</div>
        <div style="font-size:11px;color:var(--text-tertiary);line-height:1.5">${t.desc}</div>
      </div>
    `).join("");
  }
}

/* ---- TITLE REVENUE REPORTS ---- */
const COUNTRY_REV = [
  { name:"United States", rev:202184, pct:32 },
  { name:"Japan",         rev:113728, pct:18 },
  { name:"India",         rev:75819,  pct:12 },
  { name:"South Korea",   rev:56864,  pct:9  },
  { name:"UK",            rev:44228,  pct:7  },
  { name:"Others",        rev:139002, pct:22 },
];

let titleRevTrendChart;
function initTitleRevCharts() {
  if (titleRevTrendChart) return;
  chartDefaults();
  const ctx = document.getElementById("titleRevTrendChart");
  if (ctx) {
    titleRevTrendChart = new Chart(ctx.getContext("2d"), {
      type:"line",
      data:{
        labels:["Nov","Dec","Jan","Feb","Mar","Apr","May"],
        datasets:[
          { label:"Manga",     data:[38000,42000,45000,48000,51000,55000,58000], borderColor:"#c9a050", backgroundColor:"rgba(201,160,80,0.08)", fill:true, tension:0.4, borderWidth:2, pointRadius:0 },
          { label:"Glam Beat", data:[14000,15500,16000,17000,18000,19000,20000], borderColor:"#4ade80", backgroundColor:"transparent", tension:0.4, borderWidth:2, pointRadius:0 },
          { label:"Blush Club",data:[10000,12000,14000,16000,18000,20000,22000], borderColor:"#f472b6", backgroundColor:"transparent", tension:0.4, borderWidth:2, pointRadius:0 },
          { label:"Novel",     data:[20000,22000,24000,26000,28000,30000,32000], borderColor:"#818cf8", backgroundColor:"transparent", tension:0.4, borderWidth:2, pointRadius:0 },
        ]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ position:"top", align:"end" } },
        scales:{
          y:{ grid:{color:gridColor()}, border:{display:false}, ticks:{ callback:v=>"$"+(v/1000).toFixed(0)+"k" } },
          x:{ grid:{display:false} }
        },
        interaction:{ intersect:false, mode:"index" }
      }
    });
  }
}

function renderCountryRevList() {
  const el = document.getElementById("countryRevList");
  if (!el) return;
  el.innerHTML = COUNTRY_REV.map(c=>`
    <div class="top-title-item">
      <div class="top-title-meta">
        <div class="top-title-name">${c.name}</div>
        <div class="genre-track" style="margin-top:4px">
          <div class="genre-fill" style="width:${c.pct}%;background:var(--gold)"></div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;margin-left:12px">
        <div style="font-size:13px;font-weight:600;color:var(--text-primary)">$${c.rev.toLocaleString()}</div>
        <div style="font-size:11px;color:var(--text-tertiary)">${c.pct}%</div>
      </div>
    </div>
  `).join("");
}

function renderTitleRevTable() {
  const tbody = document.getElementById("titleRevTbody");
  if (!tbody) return;
  const catCls = { manga:"cat-manga", glambeat:"cat-glambeat", blushclub:"cat-blushclub", novel:"cat-novel" };
  const catLbl = { manga:"Manga", glambeat:"Glam Beat", blushclub:"Blush Club", novel:"Novel" };
  tbody.innerHTML = SERIES_DATA.map(d=>{
    const refundAmt = Math.round(d.revenue * 0.014);
    const net = d.revenue - refundAmt;
    const conv = (d.buyers / (d.buyers * 3.2) * 100).toFixed(1);
    const forecast = Math.round(d.revenue * (1 + d.trend/100) * 0.3);
    const tCls = d.trend>=0?"trend-up":"trend-down";
    return `<tr>
      <td><div style="font-weight:600;color:var(--text-primary);font-size:13px;max-width:180px;overflow:hidden;text-overflow:ellipsis">${d.name}</div></td>
      <td><span class="cat-badge ${catCls[d.cat]}">${catLbl[d.cat]}</span></td>
      <td style="color:var(--text-primary);font-weight:600">$${d.revenue.toLocaleString()}</td>
      <td style="color:#f87171;font-size:12px">-$${refundAmt.toLocaleString()}</td>
      <td style="color:#4ade80;font-weight:600">$${net.toLocaleString()}</td>
      <td style="color:var(--text-secondary)">${conv}%</td>
      <td style="color:var(--gold);font-weight:500">$${forecast.toLocaleString()}</td>
      <td><span class="${tCls}">${d.trend>=0?"+":""}${d.trend}%</span></td>
    </tr>`;
  }).join("");
}

/* ---- SETTINGS ---- */
const SETTINGS_TABS = {
  general: `
    <div class="data-card">
      <div class="data-card-head"><h3 class="panel-title">General Preferences</h3></div>
      <div style="padding:20px 24px;display:flex;flex-direction:column;gap:20px">
        ${[
          { label:"Platform Name", val:"Crossed Hearts" },
          { label:"Admin Email", val:"admin@crossedhearts.io" },
          { label:"Default Currency", val:"USD" },
          { label:"Timezone", val:"Asia/Kolkata (IST)" },
        ].map(f=>`
          <div style="display:grid;grid-template-columns:200px 1fr;align-items:center;gap:16px">
            <label style="font-size:13px;color:var(--text-secondary)">${f.label}</label>
            <input style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--r-md);padding:8px 12px;color:var(--text-primary);font-size:13px;outline:none" value="${f.val}" onfocus="this.style.borderColor='var(--gold)'" onblur="this.style.borderColor='var(--border)'" />
          </div>
        `).join("")}
        <div style="display:grid;grid-template-columns:200px 1fr;align-items:center;gap:16px">
          <label style="font-size:13px;color:var(--text-secondary)">Default Theme</label>
          <select style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--r-md);padding:8px 12px;color:var(--text-primary);font-size:13px;outline:none">
            <option>Dark</option><option>Light</option><option>System</option>
          </select>
        </div>
      </div>
    </div>`,

  notifications: `
    <div class="data-card">
      <div class="data-card-head"><h3 class="panel-title">Notification Preferences</h3></div>
      <div style="padding:8px 0">
        ${[
          { label:"Revenue milestone alerts",  on:true  },
          { label:"New reader signups",         on:false },
          { label:"Trending title alerts",      on:true  },
          { label:"System health warnings",     on:true  },
          { label:"Weekly summary email",       on:true  },
          { label:"Failed payment alerts",      on:true  },
          { label:"New review notifications",   on:false },
        ].map(n=>`
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-primary)">${n.label}</span>
            <div onclick="this.classList.toggle('tog-on');this.querySelector('.tog-knob').style.left=this.classList.contains('tog-on')?'18px':'2px'"
                 style="width:36px;height:20px;border-radius:999px;background:${n.on?'var(--gold)':'var(--bg-input)'};border:1px solid var(--border);position:relative;cursor:pointer;transition:background 0.2s"
                 class="${n.on?'tog-on':''}">
              <div class="tog-knob" style="position:absolute;top:2px;left:${n.on?'18':'2'}px;width:14px;height:14px;border-radius:50%;background:#fff;transition:left 0.2s"></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>`,

  users: `
    <div class="data-card">
      <div class="data-card-head">
        <h3 class="panel-title">User Roles</h3>
        <button class="btn-primary" style="font-size:11px;padding:5px 12px" onclick="alert('Invite user coming soon')">+ Invite User</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Last Active</th><th>Actions</th></tr></thead>
          <tbody>
            ${[
              { name:"Admin User",   email:"admin@crossedhearts.io", role:"Platform Manager", last:"Just now" },
              { name:"Priya Sharma", email:"priya@crossedhearts.io",  role:"Analytics Editor", last:"2h ago"  },
              { name:"James Lee",    email:"james@crossedhearts.io",   role:"Viewer",           last:"1d ago"  },
              { name:"Aiko Tanaka",  email:"aiko@crossedhearts.io",    role:"Viewer",           last:"3d ago"  },
            ].map(u=>`
              <tr>
                <td><div style="display:flex;align-items:center;gap:8px">
                  <div class="user-avatar" style="width:28px;height:28px;font-size:11px;flex-shrink:0">${u.name[0]}</div>
                  <span style="color:var(--text-primary);font-weight:500">${u.name}</span>
                </div></td>
                <td style="font-size:12px">${u.email}</td>
                <td><span class="cat-badge cat-manga">${u.role}</span></td>
                <td style="font-size:12px;color:var(--text-tertiary)">${u.last}</td>
                <td><button class="btn-ghost" style="padding:2px 8px;font-size:11px" onclick="alert('Edit role')">Edit</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>`,

  integrations: `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      ${[
        { name:"Stripe Payments",   desc:"Payment processing & billing",  status:"connected",    icon:"💳" },
        { name:"Google Analytics",  desc:"Web traffic & conversion data",  status:"connected",    icon:"📊" },
        { name:"Mailchimp",         desc:"Email campaigns & automation",   status:"disconnected", icon:"📧" },
        { name:"Slack",             desc:"Team alerts & notifications",    status:"connected",    icon:"💬" },
        { name:"AWS S3",            desc:"Asset & image storage",          status:"connected",    icon:"☁️" },
        { name:"Zapier",            desc:"Workflow automation",            status:"disconnected", icon:"⚡" },
      ].map(i=>`
        <div style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px 18px;display:flex;align-items:center;gap:12px">
          <div style="font-size:24px;width:44px;height:44px;background:var(--bg-elevated);border-radius:var(--r-md);display:flex;align-items:center;justify-content:center;flex-shrink:0">${i.icon}</div>
          <div style="flex:1">
            <div style="font-size:13px;font-weight:600;color:var(--text-primary)">${i.name}</div>
            <div style="font-size:11px;color:var(--text-tertiary);margin-top:2px">${i.desc}</div>
          </div>
          <span class="status-pill ${i.status==='connected'?'online':'idle'}" style="font-size:10px;flex-shrink:0">
            <span class="status-dot"></span>${i.status==='connected'?'Connected':'Connect'}
          </span>
        </div>
      `).join("")}
    </div>`,

  billing: `
    <div class="data-card">
      <div class="data-card-head"><h3 class="panel-title">Billing & Plan</h3></div>
      <div style="padding:20px 24px">
        <div style="background:var(--bg-elevated);border:1px solid rgba(201,160,80,0.3);border-radius:var(--r-lg);padding:16px 20px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:11px;color:var(--gold);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">Current Plan</div>
            <div style="font-size:20px;font-weight:700;color:var(--text-primary)">Enterprise</div>
            <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px">Renews June 1, 2026 · $499/month</div>
          </div>
          <button class="btn-ghost" onclick="alert('Plan management coming soon')">Manage Plan</button>
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:12px">Recent Invoices</div>
        ${["May 2025 · $499","Apr 2025 · $499","Mar 2025 · $499"].map(inv=>`
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px;color:var(--text-secondary)">${inv}</span>
            <button class="btn-ghost" style="padding:2px 8px;font-size:11px" onclick="downloadAdminInvoice('${inv.replace(/'/g, "\\'")}')">PDF</button>
          </div>
        `).join("")}
      </div>
    </div>`,
};

function showSettingsTab(tab, btn) {
  document.querySelectorAll("#page-settings .nav-item").forEach(b=>b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  const el = document.getElementById("settingsContent");
  if (el) el.innerHTML = SETTINGS_TABS[tab] || "";
}

/* ---- HOOK INTO NAVIGATE ---- */
const _originalNavigate = navigate;
window.navigate = function(page, linkEl) {
  _originalNavigate(page, linkEl);

  if (page === "readers") {
    initReaderCharts();
    renderCohortTable();
    renderCountryList();
  }
  if (page === "titles") {
    renderTitlesTable();
    initTitleCharts();
  }
  if (page === "engagement") {
    initEngagementCharts();
    renderFunnel();
    renderStreakList();
  }
  if (page === "behaviour") {
    initBehaviourCharts();
    renderHeatmap();
  }
  if (page === "system") {
    initSystemCharts();
    renderIncidents();
    renderServiceStatus();
  }
  if (page === "reports") {
    renderReportsPage();
  }
  if (page === "title-revenue") {
    initTitleRevCharts();
    renderCountryRevList();
    renderTitleRevTable();
  }
  if (page === "physical-orders") {
    loadPhysicalOrders();
  }
  if (page === "settings") {
    showSettingsTab("general", document.querySelector("#page-settings .nav-item"));
  }
};
