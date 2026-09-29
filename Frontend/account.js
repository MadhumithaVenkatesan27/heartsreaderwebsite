// ---- TAB SWITCHING ----
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-panel")
      .forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.add("active");
  });
});

// ---- SAMPLE DATA (replace with real API data) ----
// const sampleData = {
//   digitalPurchases: [
//     { title: "The Silent Orchard", date: "2026-05-12", link: "#" },
//     { title: "Whispers of the Coast", date: "2026-06-02", link: "#" },
//   ],
//   printPurchases: [
//     {
//       title: "The Silent Orchard (Hardcover)",
//       date: "2026-05-14",
//       orderStatus: "Delivered",
//     },
//   ],
//   subscription: {
//     active: true,
//     plan: "Hearts Reader Plus",
//     renews: "2026-08-01",
//   },
//   wishlist: [
//     { title: "Letters from Ashwood", price: "$14.99" },
//     { title: "The Last Bloom", price: "$9.99" },
//   ],
// };

const sampleData = {
  digitalPurchases: [
    {
      title: "You're Way Too Cheeky, Chigaya-kun! Vol.1",
      date: "2026-05-12",
      link: "reader.html?title=chigaya-v1&ch=ch1",
    },
    {
      title: "The Executioner of Grenimal Vol.1",
      date: "2026-06-02",
      link: "reader.html?title=grenimal-v1&ch=ch1",
    },
    {
      title: "Borrowing Your Textbook 175160",
      date: "2026-06-20",
      link: "reader.html?title=borrowing&ch=ch1",
    },
    {
      title: "The Abandoned Villainess Became a Zombie Vol.1",
      date: "2026-07-03",
      link: "reader.html?title=zombie-v1&ch=ch1",
    },
  ],
  printPurchases: [
    {
      title: "A Gaze Like Lightning Vol.1 (Paperback)",
      date: "2026-05-14",
      orderStatus: "Delivered",
    },
    {
      title: "The King of Owls and His Troubled Attendant Vol.1 (Paperback)",
      date: "2026-06-25",
      orderStatus: "Shipped",
    },
  ],
  subscription: {
    active: true,
    plan: "Hearts Reader Plus",
    renews: "2026-08-01",
  },
  wishlist: [
    { title: "Octopiece Vol.1", price: "$2.99" },
    { title: "Until We Fall in Love Vol.1", price: "$6.99" },
    {
      title: "Why Raeliana Ended Up at the Duke's Mansion Vol.1",
      price: "From $0.99",
    },
    { title: "The Bird in the Cage Dreams Vol.1", price: "$6.99" },
  ],
};
// ---- RENDER FUNCTIONS ----
function renderDigital(items) {
  const container = document.getElementById("digital-list");
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">No digital purchases yet.</div>`;
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
    <div class="item-card">
      <div class="item-info">
        <h3>${item.title}</h3>
        <span>Purchased ${item.date}</span>
      </div>
      <div class="item-action">
        <a href="${item.link}">Read Now</a>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderPrint(items) {
  const container = document.getElementById("print-list");
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">No print purchases yet.</div>`;
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
    <div class="item-card">
      <div class="item-info">
        <h3>${item.title}</h3>
        <span>Ordered ${item.date} · ${item.orderStatus}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderSubscription(sub) {
  const container = document.getElementById("subscription-status");
  container.innerHTML = `
    <div class="status-card">
      <h3>${sub.plan}</h3>
      <p>
        Status: <span class="badge ${sub.active ? "active" : "inactive"}">
          ${sub.active ? "Active" : "Inactive"}
        </span>
      </p>
      ${sub.active ? `<p>Renews on ${sub.renews}</p>` : `<p>Reactivate your subscription to keep reading.</p>`}
    </div>
  `;
}

function renderWishlist(items) {
  const container = document.getElementById("wishlist-list");
  if (!items.length) {
    container.innerHTML = `<div class="empty-state">Your wishlist is empty.</div>`;
    return;
  }
  container.innerHTML = items
    .map(
      (item) => `
    <div class="item-card">
      <div class="item-info">
        <h3>${item.title}</h3>
        <span>${item.price}</span>
      </div>
      <div class="item-action">
        <button onclick="alert('Add to cart logic goes here')">Add to Cart</button>
      </div>
    </div>
  `,
    )
    .join("");
}

// ---- INITIAL LOAD ----
// Replace this block with a real fetch() call to your backend once ready, e.g.:
// fetch('/api/account/summary').then(res => res.json()).then(data => { ... render with real data ... });

renderDigital(sampleData.digitalPurchases);
renderPrint(sampleData.printPurchases);
renderSubscription(sampleData.subscription);
renderWishlist(sampleData.wishlist);
