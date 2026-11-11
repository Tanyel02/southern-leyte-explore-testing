const $ = id => document.getElementById(id);
const main = $("app"), page = document.body.dataset.page;
const peso = n => "₱" + Number(n).toLocaleString();
const today = () => new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
const load = k => JSON.parse(localStorage.getItem(k) || "[]");
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const mkRef = p => p + "-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(10 + Math.random() * 90);
const head = (t, s) => `<h2 class="section-title">${t}</h2><p class="section-sub">${s}</p>`;
const searchBox = (id, ph) => `<input id="${id}" class="form-control rounded-pill mb-4" type="search" placeholder="${ph}">`;
const note = (el, ok, t) => { el.innerHTML = `<div class="alert alert-${ok ? "success" : "danger"} py-2 mb-0">${esc(t)}</div>`; };

/* ================= HOTELS ================= */
let cur = null;
function initHotels() {
  main.innerHTML = head("Hotels & Resorts", "DEMO listings let you try the booking flow. Real listings come from OpenStreetMap and show no prices until verified.") + `
  <h4>Try the booking system <span class="badge text-bg-danger">DEMO</span></h4>
  <div class="row g-4 mb-5" id="demo-hotels"></div>
  <h4>Real places (OpenStreetMap)</h4>${searchBox("hotel-search", "Search real hotels and resorts...")}
  <div class="row g-4 mb-5" id="real-hotels"></div>
  <h4>My demo bookings</h4><div id="my-bookings" class="mb-5"></div>
  <div class="modal fade" id="bookModal" tabindex="-1"><div class="modal-dialog modal-dialog-scrollable"><div class="modal-content">
    <div class="modal-header"><h5 id="bk_title" class="modal-title"></h5><button class="btn-close" data-bs-dismiss="modal"></button></div>
    <div class="modal-body">
      <label class="form-label">Room type</label><select id="bk_room" class="form-select mb-2"></select>
      <div class="row g-2 mb-2"><div class="col"><label class="form-label">Check-in</label><input type="date" id="bk_in" class="form-control"></div>
      <div class="col"><label class="form-label">Check-out</label><input type="date" id="bk_out" class="form-control"></div></div>
      <label class="form-label">Guests</label><input type="number" id="bk_guests" class="form-control mb-2" min="1" value="1">
      <input id="bk_name" class="form-control mb-2" placeholder="Full name"><input id="bk_phone" class="form-control mb-2" placeholder="Phone number">
      <p class="small text-secondary">Demo cancellation policy: free cancellation before the check-in date.</p>
      <div id="bk_msg"></div></div>
    <div class="modal-footer"><button class="btn btn-outline-secondary" id="bk_check">Check availability</button>
      <button class="btn btn-ocean" id="bk_confirm">Reserve (demo)</button></div>
  </div></div></div>`;
  $("demo-hotels").innerHTML = DEMO_HOTELS.map(h => `<div class="col-md-6 col-lg-4"><div class="card card-lite">
    <div class="card-banner">🏨</div><div class="card-body">
    <span class="badge text-bg-danger mb-2">DEMO listing</span><h5>${esc(h.name)}</h5>
    <p class="small text-secondary mb-1">📍 ${esc(h.municipality)}</p><p class="small">${esc(h.description)}</p>
    <p class="small mb-1">Facilities: ${h.facilities.map(esc).join(", ")}</p>
    <p class="small mb-1">Check-in ${esc(h.checkIn)} · Check-out ${esc(h.checkOut)}</p>
    <p class="small">From <strong>${peso(Math.min(...h.rooms.map(r => r.price)))}</strong>/night (sample price)</p>
    <button class="btn btn-ocean btn-sm" onclick="openBooking(${h.id})">Book (demo)</button></div></div></div>`).join("");
  listOSM("real-hotels", ['["tourism"~"hotel|resort|guest_house|hostel|motel"]'], "🏨", "hotel-search");
  $("bk_check").onclick = () => { const r = checkBooking();
    note($("bk_msg"), r.ok, r.ok ? `Available (demo). ${r.n} night(s) × ${peso(r.room.price)} = ${peso(r.total)} (sample price)` : r.msg); };
  $("bk_confirm").onclick = confirmBooking;
  renderBookings();
}
function openBooking(id) {
  cur = DEMO_HOTELS.find(h => h.id === id);
  $("bk_title").textContent = cur.name;
  $("bk_room").innerHTML = cur.rooms.map((r, i) => `<option value="${i}">${esc(r.type)} - ${peso(r.price)}/night (sleeps ${r.sleeps})</option>`).join("");
  $("bk_in").min = $("bk_out").min = today();
  $("bk_msg").innerHTML = "";
  new bootstrap.Modal($("bookModal")).show();
}
function checkBooking() {
  const room = cur.rooms[$("bk_room").value], a = $("bk_in").value, b = $("bk_out").value, g = +$("bk_guests").value;
  if (!a || !b) return { msg: "Choose check-in and check-out dates." };
  if (a < today()) return { msg: "Check-in cannot be in the past." };
  const n = Math.round((new Date(b) - new Date(a)) / 864e5);
  if (n < 1) return { msg: "Check-out must be after check-in." };
  if (!g || g < 1 || g > room.sleeps) return { msg: `This room sleeps ${room.sleeps} guest(s).` };
  const used = load("sle-bookings").filter(x => x.hotelId === cur.id && x.room === room.type && a < x.out && b > x.in).length;
  if (used >= room.units) return { msg: "No rooms left for those dates (demo availability)." };
  return { ok: true, n, total: n * room.price, room };
}
function confirmBooking() {
  const r = checkBooking(), m = $("bk_msg"), name = $("bk_name").value.trim(), phone = $("bk_phone").value.trim();
  if (!r.ok) return note(m, false, r.msg);
  if (!name || !/^[0-9+\-\s]{7,15}$/.test(phone)) return note(m, false, "Enter your name and a valid phone number.");
  const b = { ref: mkRef("SLE"), hotelId: cur.id, hotel: cur.name, room: r.room.type, in: $("bk_in").value, out: $("bk_out").value,
    guests: +$("bk_guests").value, name, phone, total: r.total, status: "Pending (demo)" };
  save("sle-bookings", [b, ...load("sle-bookings")]);
  note(m, true, `DEMO reservation saved. Reference: ${b.ref}. Total ${peso(b.total)}. This is NOT a real hotel booking.`);
  renderBookings();
}
function renderBookings() {
  const b = load("sle-bookings");
  $("my-bookings").innerHTML = b.length ? `<div class="table-responsive"><table class="table"><thead><tr><th>Ref</th><th>Hotel</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>
    ${b.map(x => `<tr><td>${esc(x.ref)}</td><td>${esc(x.hotel)}</td><td>${esc(x.room)}</td><td>${x.in} → ${x.out}</td><td>${peso(x.total)}</td><td>${esc(x.status)}</td>
    <td><button class="btn btn-sm btn-outline-danger" onclick="cancelBooking('${x.ref}')">Cancel</button></td></tr>`).join("")}</tbody></table></div>`
    : '<div class="empty-state">No bookings yet.</div>';
}
function cancelBooking(ref) {
  const b = load("sle-bookings"), x = b.find(y => y.ref === ref);
  if (x.in <= today()) { alert("Demo policy: bookings can only be cancelled before the check-in date."); return; }
  save("sle-bookings", b.filter(y => y.ref !== ref)); renderBookings();
}

/* ================= RESTAURANTS ================= */
let rest, cart = {};
function initRestaurants() {
  main.innerHTML = head("Restaurants & Food", "DEMO menus let you try ordering. Real restaurants come from OpenStreetMap with no menu prices until verified.") + `
  <div class="row g-4 mb-5"><div class="col-lg-7">
    <h4>Order food <span class="badge text-bg-danger">DEMO menu</span></h4>
    <div id="rest-tabs" class="d-flex flex-wrap gap-2 mb-2"></div><div id="rest-info" class="small text-secondary mb-2"></div><div id="menu"></div></div>
  <div class="col-lg-5"><div class="card card-lite"><div class="card-body"><h5>Your order</h5><div id="cart"></div>
    <div class="mb-2"><label class="me-3"><input type="radio" name="mode" value="Pickup" checked> Pickup</label>
    <label><input type="radio" name="mode" value="Delivery"> Delivery</label></div>
    <input id="or_name" class="form-control mb-2" placeholder="Full name"><input id="or_phone" class="form-control mb-2" placeholder="Phone number">
    <button id="or_submit" class="btn btn-ocean w-100">Place order (demo)</button><div id="or_msg" class="mt-2"></div></div></div></div></div>
  <h4>My demo orders</h4><div id="orders" class="mb-5"></div>
  <h4>Real places (OpenStreetMap)</h4>${searchBox("rest-search", "Search real restaurants and cafes...")}<div class="row g-4 mb-5" id="real-rest"></div>`;
  $("or_submit").onclick = submitOrder;
  listOSM("real-rest", ['["amenity"~"restaurant|cafe|fast_food"]'], "🍽️", "rest-search");
  pickRest(DEMO_RESTAURANTS[0].id); renderOrders();
}
function pickRest(id) {
  rest = DEMO_RESTAURANTS.find(r => r.id === id); cart = {};
  $("rest-tabs").innerHTML = DEMO_RESTAURANTS.map(r => `<button class="chip ${r.id === id ? "active" : ""}" onclick="pickRest(${r.id})">${esc(r.name)}</button>`).join("");
  $("rest-info").textContent = `${rest.municipality} · Hours: ${rest.hours} (sample data)`;
  $("menu").innerHTML = rest.menu.map((m, i) => `<div class="d-flex justify-content-between align-items-center border-bottom py-2">
    <div><strong>${esc(m.name)}</strong><div class="small text-secondary">${esc(m.desc)}</div></div>
    <div class="text-nowrap">${peso(m.price)} <button class="btn btn-ocean btn-sm ms-2" onclick="chg(${i},1)">Add</button></div></div>`).join("");
  drawCart();
}
function chg(i, d) { cart[i] = (cart[i] || 0) + d; if (cart[i] <= 0) delete cart[i]; drawCart(); }
function cartTotal() { return Object.entries(cart).reduce((s, [i, q]) => s + rest.menu[i].price * q, 0); }
function drawCart() {
  const rows = Object.entries(cart).map(([i, q]) => `<div class="d-flex justify-content-between align-items-center mb-1"><span>${esc(rest.menu[i].name)}</span>
    <span class="text-nowrap"><button class="btn btn-sm btn-outline-secondary" onclick="chg(${i},-1)">−</button> ${q}
    <button class="btn btn-sm btn-outline-secondary" onclick="chg(${i},1)">+</button> ${peso(rest.menu[i].price * q)}</span></div>`).join("");
  $("cart").innerHTML = (rows || '<p class="text-secondary small">Cart is empty.</p>') +
    `<hr><div class="d-flex justify-content-between"><strong>Total</strong><strong>${peso(cartTotal())}</strong></div>
     <p class="small text-secondary">Delivery fees are set by the restaurant and are not included.</p>`;
}
function submitOrder() {
  const name = $("or_name").value.trim(), phone = $("or_phone").value.trim(), m = $("or_msg");
  if (!Object.keys(cart).length) return note(m, false, "Add at least one item.");
  if (!name || !/^[0-9+\-\s]{7,15}$/.test(phone)) return note(m, false, "Enter your name and a valid phone number.");
  const o = { ref: mkRef("ORD"), restaurant: rest.name, mode: document.querySelector("input[name=mode]:checked").value, name, phone,
    total: cartTotal(), items: Object.entries(cart).map(([i, q]) => q + "× " + rest.menu[i].name).join(", "), status: "Received (demo)" };
  save("sle-orders", [o, ...load("sle-orders")]);
  cart = {}; drawCart(); renderOrders();
  note(m, true, `DEMO order saved. Reference: ${o.ref}. No real restaurant received it.`);
}
function renderOrders() {
  const o = load("sle-orders").slice(0, 5);
  $("orders").innerHTML = o.length ? o.map(x => `<div class="border rounded-3 p-2 mb-2 small"><strong>${esc(x.ref)}</strong> · ${esc(x.restaurant)} · ${esc(x.mode)} ·
    ${peso(x.total)} · <em>${esc(x.status)}</em><br>${esc(x.items)}</div>`).join("") : '<div class="empty-state">No orders yet.</div>';
}

/* ================= SCHOOLS, TOURIST SPOTS, ABOUT ================= */
function initSchools() {
  main.innerHTML = head("School Directory", "Real schools, colleges and universities mapped in OpenStreetMap. Programs and contacts show only when listed.") +
    searchBox("school-search", "Search by school name, type or street...") + '<div class="row g-4" id="schools-list"></div>';
  listOSM("schools-list", ['["amenity"~"school|college|university"]'], "🎓", "school-search");
}
function initDestinations() {
  main.innerHTML = head("Tourist Spots", "Fees and opening hours are shown only once verified from official sources.") +
    '<div class="row g-4 mb-5" id="dest-grid"></div><h4>More places from OpenStreetMap</h4>' +
    searchBox("dest-search", "Search attractions, beaches, waterfalls...") + '<div class="row g-4" id="osm-dest"></div>';
  renderGrid("dest-grid", DESTINATIONS, "No destinations yet.", destinationCard);
  listOSM("osm-dest", ['["tourism"~"attraction|viewpoint|museum"]', '["natural"~"beach|cave_entrance"]', '["waterway"="waterfall"]'], "📸", "dest-search");
}
function initAbout() {
  main.innerHTML = head("About Us", "Southern Leyte Explore is a student project to help people discover Southern Leyte, Philippines.") + `
  <div class="row g-4"><div class="col-md-6"><div class="card card-lite"><div class="card-body"><h5>What you can do</h5>
    <p>Explore an interactive map, browse tourist spots, hotels, restaurants and schools, and try the demo booking and ordering flow.</p></div></div></div>
  <div class="col-md-6"><div class="card card-lite"><div class="card-body"><h5>Data and honesty</h5>
    <p>Places come from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>. Prices, hours and ratings are
    shown only when verified. DEMO items are samples, and bookings or orders are saved on your own device only.</p></div></div></div>
  <div class="col-12"><div class="card card-lite"><div class="card-body"><h5>Prototype notice</h5>
    <p class="mb-0">This site uses LocalStorage and has no real backend. It cannot make real reservations or take payments, and a public version would need a secure server and database.</p></div></div></div></div>`;
}

/* ---------- Start ---------- */
({ hotels: initHotels, restaurants: initRestaurants, schools: initSchools, destinations: initDestinations, about: initAbout })[page]?.();