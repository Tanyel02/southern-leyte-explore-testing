const OSM_BOX = [9.85, 124.65, 10.55, 125.3];

async function fetchOSM(selectors) {
  const key = "osm:" + selectors.join("");
  try { const c = JSON.parse(sessionStorage.getItem(key)); if (c) return c; } catch (e) {}
  const [s, w, n, e] = OSM_BOX;
  const q = `[out:json][timeout:25];(${selectors.map(x => `nwr${x}(${s},${w},${n},${e});`).join("")});out center tags 400;`;
  const r = await fetch("https://overpass-api.de/api/interpreter", { method: "POST", body: "data=" + encodeURIComponent(q) });
  if (!r.ok) throw new Error("osm");
  const list = (await r.json()).elements.map(el => {
    const t = el.tags || {};
    return { name: t.name, type: t.tourism || t.amenity || t.natural || t.waterway || "",
      address: [t["addr:street"], t["addr:city"] || t["addr:municipality"]].filter(Boolean).join(", "),
      phone: t.phone || t["contact:phone"], site: t.website || t["contact:website"],
      lat: el.lat ?? el.center?.lat, lon: el.lon ?? el.center?.lon };
  }).filter(x => x.name && x.lat);
  try { sessionStorage.setItem(key, JSON.stringify(list)); } catch (e) {}
  return list;
}

function osmCard(x, icon) {
  const site = x.site && /^https?:\/\//i.test(x.site) ? x.site : null;
  const url = `explore.html?lat=${x.lat}&lon=${x.lon}&name=${encodeURIComponent(x.name)}`;
  return `<div class="card card-lite"><div class="card-body"><div class="fs-3">${icon}</div>
    <h6>${esc(x.name)}</h6>
    <p class="small text-secondary mb-1">${esc(x.type)}${x.address ? " · " + esc(x.address) : ""}</p>
    ${x.phone ? `<p class="small mb-1">📞 ${esc(x.phone)}</p>` : ""}
    <span class="badge text-bg-warning mb-2">Prices &amp; hours: not verified</span><br>
    <a class="btn btn-ocean btn-sm" href="${url}">View on map</a>
    ${site ? `<a class="btn btn-outline-secondary btn-sm" href="${esc(site)}" target="_blank" rel="noopener">Website</a>` : ""}
  </div></div>`;
}

async function listOSM(boxId, selectors, icon, searchId) {
  const box = document.getElementById(boxId);
  box.innerHTML = '<p class="text-secondary">Loading real places from OpenStreetMap...</p>';
  let data;
  try { data = await fetchOSM(selectors); }
  catch (e) { box.innerHTML = '<div class="empty-state">Could not load data. Check your internet and refresh.</div>'; return; }
  const input = document.getElementById(searchId);
  const draw = () => {
    const q = (input?.value || "").toLowerCase();
    const f = data.filter(x => (x.name + x.address + x.type).toLowerCase().includes(q));
    box.innerHTML = f.length
      ? f.map(x => `<div class="col-sm-6 col-lg-4">${osmCard(x, icon)}</div>`).join("")
      : '<div class="col-12"><div class="empty-state">No matching places found in OpenStreetMap.</div></div>';
  };
  draw();
  input?.addEventListener("input", draw);
}