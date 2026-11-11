/* ---------- Helpers ---------- */
function esc(s) { // prevents HTML injection
  return String(s ?? "").replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/* ---------- Theme (light / dark) ---------- */
function applyTheme(t) {
  document.documentElement.setAttribute("data-bs-theme", t);
  localStorage.setItem("sle-theme", t);
  const btn = document.getElementById("themeBtn");
  if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
}

/* ---------- Navbar and footer ---------- */
const PAGES = [
  ["index.html", "Home"], ["explore.html", "Explore Map"], ["hotels.html", "Hotels"],
  ["restaurants.html", "Restaurants"], ["destinations.html", "Tourist Spots"],
  ["schools.html", "Schools"], ["about.html", "About Us"]
];

function renderNav() {
  const current = location.pathname.split("/").pop() || "index.html";
  const links = PAGES.map(([href, label]) =>
    `<li class="nav-item"><a class="nav-link ${href === current ? "active" : ""}" href="${href}">${label}</a></li>`
  ).join("");
  document.getElementById("site-nav").innerHTML = `
    <nav class="navbar navbar-expand-lg sticky-top bg-body">
      <div class="container">
        <a class="navbar-brand brand-logo" href="index.html">🌴 Southern Leyte Explore</a>
        <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#navMenu"
                aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
        <div class="collapse navbar-collapse" id="navMenu">
          <ul class="navbar-nav mx-auto">${links}</ul>
          <button id="themeBtn" class="btn btn-sm btn-outline-secondary rounded-pill me-2"
                  aria-label="Toggle dark mode"></button>
          <a href="login.html" class="btn btn-ocean btn-sm">Login / Register</a>
        </div>
      </div>
    </nav>`;
  document.getElementById("themeBtn").addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-bs-theme") === "dark" ? "light" : "dark");
  });
  applyTheme(localStorage.getItem("sle-theme") || "light");
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML = `
    <footer><div class="container">
      <div class="row g-4">
        <div class="col-md-5">
          <h5 class="text-white">🌴 Southern Leyte Explore</h5>
          <p>Discover destinations, accommodations, food and schools across Southern Leyte, Philippines.</p>
        </div>
        <div class="col-md-3"><h6 class="text-white">Explore</h6>
          <a href="explore.html">Interactive Map</a><br><a href="destinations.html">Tourist Spots</a><br>
          <a href="schools.html">Schools</a></div>
        <div class="col-md-4"><h6 class="text-white">Data &amp; Credits</h6>
          <p class="small">Map data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>.
          This is a student prototype. Listings are unverified unless marked otherwise.</p></div>
      </div>
      <hr><p class="small mb-0">© ${new Date().getFullYear()} Southern Leyte Explore</p>
    </div></footer>`;
}

/* ---------- Homepage sections ---------- */
function renderGrid(containerId, items, emptyText, builder) {
  const box = document.getElementById(containerId);
  if (!box) return;
  box.innerHTML = items.length
    ? items.map(i => `<div class="col-sm-6 col-lg-3">${builder(i)}</div>`).join("")
    : `<div class="col-12"><div class="empty-state">${emptyText}</div></div>`;
}

function destinationCard(d) {
  const q = encodeURIComponent(`${d.name}, Southern Leyte`);
  return `<div class="card card-lite">
    <div class="card-banner">${d.icon}</div>
    <div class="card-body">
      <h5 class="card-title">${esc(d.name)}</h5>
      <p class="small text-secondary mb-1">📍 ${esc(d.municipality || "Municipality to be verified")}</p>
      <p class="small">${esc(d.description)}</p>
      <span class="badge text-bg-warning mb-2">Fees &amp; hours: not verified</span><br>
      <a class="btn btn-ocean btn-sm" href="explore.html?q=${q}">View on map</a>
    </div></div>`;
}

function simpleCard(i) {
  return `<div class="card card-lite"><div class="card-banner">${i.icon || "📍"}</div><div class="card-body">
    ${i.demo ? '<span class="badge text-bg-danger mb-2">DEMO</span>' : ""}
    <h5>${esc(i.name)}</h5><p class="small">${esc(i.description || "")}</p>
    <a class="btn btn-ocean btn-sm" href="${i.link}">Open</a></div></div>`;}

function setupHomePage() {
    renderGrid("destinations-grid", DESTINATIONS, "No destinations yet.", destinationCard);
    renderGrid("hotels-grid", DEMO_HOTELS.map(h => ({ ...h, icon: "🏨", demo: true, link: "hotels.html" })), "", simpleCard);
    renderGrid("restaurants-grid", DEMO_RESTAURANTS.map(r => ({ ...r, icon: "🍽️", demo: true, description: r.municipality, link: "restaurants.html" })), "", simpleCard);
    renderGrid("schools-grid", [{ name: "School Directory", icon: "🎓", description: "Browse real schools mapped in OpenStreetMap.", link: "schools.html" }], "", simpleCard);
  const form = document.getElementById("hero-search");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const q = document.getElementById("hero-input").value.trim();
    if (!q) { document.getElementById("hero-input").focus(); return; }
    location.href = "explore.html?q=" + encodeURIComponent(q);
  });
}

/* ---------- Start ---------- */
renderNav();
renderFooter();
if (document.getElementById("destinations-grid")) setupHomePage();