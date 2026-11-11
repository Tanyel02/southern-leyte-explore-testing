/* ---------- Map setup ---------- */
// Rough area of Southern Leyte (used only as a starting view and search area)
const BOUNDS = L.latLngBounds([9.85, 124.65], [10.55, 125.3]);

const map = L.map("map").fitBounds(BOUNDS);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const statusEl = document.getElementById("status");
const layers = {};   // one marker group per category
const loaded = {};   // remembers categories already downloaded

/* ---------- Category chips ---------- */
const chipBox = document.getElementById("chips");
CATEGORIES.forEach(cat => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.style.setProperty("--c", cat.color);
  b.textContent = `${cat.icon} ${cat.label}`;
  b.addEventListener("click", () => toggleCategory(cat, b));
  chipBox.appendChild(b);
});

async function toggleCategory(cat, btn) {
  if (layers[cat.key] && map.hasLayer(layers[cat.key])) {       // turn off
    map.removeLayer(layers[cat.key]);
    btn.classList.remove("active");
    statusEl.textContent = "";
    return;
  }
  btn.classList.add("active");                                   // turn on
  if (!loaded[cat.key]) {
    statusEl.textContent = `Loading ${cat.label} from OpenStreetMap...`;
    try {
      layers[cat.key] = await loadCategory(cat);
      loaded[cat.key] = true;
    } catch (err) {
      btn.classList.remove("active");
      statusEl.textContent = "Could not load data right now. Please try again in a moment.";
      return;
    }
  }
  layers[cat.key].addTo(map);
  const n = layers[cat.key].getLayers().length;
  statusEl.textContent = n
    ? `${n} place(s) found in ${cat.label}.`
    : `No ${cat.label} are mapped in OpenStreetMap for this area yet.`;
}

/* ---------- Fetch real places (Overpass API) ---------- */
async function loadCategory(cat) {
  const [s, w, n, e] = [BOUNDS.getSouth(), BOUNDS.getWest(), BOUNDS.getNorth(), BOUNDS.getEast()];
  const parts = cat.selectors.map(sel => `nwr${sel}(${s},${w},${n},${e});`).join("");
  const query = `[out:json][timeout:25];(${parts});out center tags 300;`;
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: "data=" + encodeURIComponent(query)
  });
  if (!res.ok) throw new Error("Overpass error");
  const data = await res.json();

  const group = L.layerGroup();
  data.elements.forEach(el => {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null) return;
    const icon = L.divIcon({
      className: "",
      html: `<div class="pin" style="background:${cat.color}"><span>${cat.icon}</span></div>`,
      iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -28]
    });
    L.marker([lat, lon], { icon }).bindPopup(popupHTML(el, cat)).addTo(group);
  });
  return group;
}

function popupHTML(el, cat) {
  const t = el.tags || {};
  const name = t.name || "Unnamed place";
  const address = [t["addr:street"], t["addr:city"] || t["addr:municipality"]].filter(Boolean).join(", ");
  const phone = t.phone || t["contact:phone"];
  const site = t.website || t["contact:website"];
  const safeSite = site && /^https?:\/\//i.test(site) ? site : null;
  return `
    <strong>${esc(name)}</strong><br>
    <span class="text-secondary">${cat.icon} ${esc(cat.label)}</span><br>
    ${address ? `📍 ${esc(address)}<br>` : ""}
    ${phone ? `📞 ${esc(phone)}<br>` : ""}
    ${safeSite ? `🌐 <a href="${esc(safeSite)}" target="_blank" rel="noopener">Website</a><br>` : ""}
    <em class="small">Prices, hours &amp; ratings: not verified</em><br>
    <a class="small" href="https://www.openstreetmap.org/${el.type}/${el.id}" target="_blank" rel="noopener">
      View on OpenStreetMap</a>`;
}

/* ---------- Search and municipality jump (Nominatim) ---------- */
let searchMarker = null;

async function goToPlace(text) {
  statusEl.textContent = "Searching...";
  try {
    const url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=ph&q="
      + encodeURIComponent(text);
    const res = await fetch(url);
    const results = await res.json();
    if (!results.length) { statusEl.textContent = `No result found for "${text}".`; return; }
    const r = results[0];
    const pos = [parseFloat(r.lat), parseFloat(r.lon)];
    map.flyTo(pos, 14);
    if (searchMarker) map.removeLayer(searchMarker);
    searchMarker = L.marker(pos).addTo(map).bindPopup(esc(r.display_name)).openPopup();
    statusEl.textContent = "";
  } catch (e) {
    statusEl.textContent = "Search failed. Make sure you are online and try again.";
  }
}

const muniSelect = document.getElementById("muni-select");
MUNICIPALITIES.forEach(m => muniSelect.add(new Option(m, m)));
muniSelect.addEventListener("change", () => {
  if (muniSelect.value) goToPlace(`${muniSelect.value}, Southern Leyte, Philippines`);
});

document.getElementById("search-form").addEventListener("submit", e => {
  e.preventDefault();
  const q = document.getElementById("search-input").value.trim();
  if (!q) { statusEl.textContent = "Please type a place to search."; return; }
  goToPlace(q.toLowerCase().includes("leyte") ? q : `${q}, Southern Leyte, Philippines`);
});

/* ---------- My location ---------- */
let meMarker = null;
document.getElementById("locate-btn").addEventListener("click", () => {
  if (!navigator.geolocation) { statusEl.textContent = "Your browser does not support location."; return; }
  statusEl.textContent = "Finding your location...";
  navigator.geolocation.getCurrentPosition(
    p => {
      const pos = [p.coords.latitude, p.coords.longitude];
      if (meMarker) map.removeLayer(meMarker);
      meMarker = L.circleMarker(pos, { radius: 9, color: "#fff", weight: 3, fillColor: "#0077b6", fillOpacity: 1 })
        .addTo(map).bindPopup("You are here").openPopup();
      map.flyTo(pos, 14);
      statusEl.textContent = "";
    },
    () => { statusEl.textContent = "Location permission was denied or unavailable."; }
  );
});

/* ---------- Open with ?q=... from homepage ---------- */
const startQuery = new URLSearchParams(location.search).get("q");
if (startQuery) {
  document.getElementById("search-input").value = startQuery;
  goToPlace(startQuery.toLowerCase().includes("leyte") ? startQuery : `${startQuery}, Southern Leyte, Philippines`);
  const P = new URLSearchParams(location.search);
if (P.get("lat")) {
  const pos = [parseFloat(P.get("lat")), parseFloat(P.get("lon"))];
  map.setView(pos, 16);
  L.marker(pos).addTo(map).bindPopup(esc(P.get("name") || "Selected place")).openPopup();
}
}