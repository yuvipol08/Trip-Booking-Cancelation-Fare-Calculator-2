/* =========================================================
   booking.js - Trip booking + fare + Carbon-Smart Advisor.
   ========================================================= */

requireLogin();

let currentMode = "flight"; // selected transport mode

/* ----- Today's date as YYYY-MM-DD (for the date input) ----- */
function todayString() {
  const t = new Date();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return t.getFullYear() + "-" + mm + "-" + dd;
}

/* ----- Fill the city dropdowns ----- */
function fillCityDropdowns() {
  const sourceSel = document.getElementById("source");
  const destSel = document.getElementById("destination");
  Object.keys(cities).sort().forEach(function (city) {
    sourceSel.innerHTML += '<option value="' + city + '">' + city + "</option>";
    destSel.innerHTML += '<option value="' + city + '">' + city + "</option>";
  });
}

/* ----- Fill the class dropdown for the chosen mode ----- */
function fillClassDropdown(mode) {
  const classSel = document.getElementById("travelClass");
  classSel.innerHTML = '<option value="">-- Select class --</option>';
  Object.keys(modes[mode].classes).forEach(function (cls) {
    classSel.innerHTML += '<option value="' + cls + '">' + cls + "</option>";
  });
}

/* ----- Great-circle distance (Haversine) between two cities ----- */
function getDistance(source, destination) {
  const a = cities[source], b = cities[destination];
  const toRad = function (d) { return (d * Math.PI) / 180; };
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

/* ----- Fare for a given mode ----- */
function fareFor(mode, distance, travelClass, passengers) {
  const setup = modes[mode];
  const mult = setup.classes[travelClass] || 1;
  return Math.round((distance * setup.rate * mult + setup.base) * passengers);
}

/* ----- CO2 (kg) for a given mode ----- */
function co2For(mode, distance, passengers) {
  return Math.round(distance * passengers * EMISSION[mode]);
}

/* ----- Read the form ----- */
function getFormData() {
  return {
    mode: currentMode,
    source: document.getElementById("source").value,
    destination: document.getElementById("destination").value,
    date: document.getElementById("date").value,
    passengers: parseInt(document.getElementById("passengers").value, 10) || 0,
    travelClass: document.getElementById("travelClass").value
  };
}

/* ----- Money formatting ----- */
function money(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }

/* ----- Show / refresh the results (fare + carbon) ----- */
function refresh() {
  const d = getFormData();
  const results = document.getElementById("results");

  const ready = d.source && d.destination && d.source !== d.destination &&
    d.travelClass && d.passengers >= 1;
  if (!ready) { results.hidden = true; return; }

  const distance = getDistance(d.source, d.destination);
  const fare = fareFor(d.mode, distance, d.travelClass, d.passengers);
  const co2 = co2For(d.mode, distance, d.passengers);

  results.hidden = false;

  // Fare cards
  document.getElementById("distAmt").textContent = distance.toLocaleString("en-IN") + " km";
  document.getElementById("perAmt").textContent = money(fare / d.passengers);
  document.getElementById("fareEstimate").textContent = money(fare);

  // Carbon dial
  document.getElementById("carbonKg").innerHTML =
    co2.toLocaleString("en-IN") + "<small> kg CO₂</small>";

  // Compare all three modes for this route
  const compare = document.getElementById("carbonCompare");
  const icons = { flight: "✈️", train: "🚆", bus: "🚌" };
  const allCo2 = {};
  ["flight", "train", "bus"].forEach(function (m) { allCo2[m] = co2For(m, distance, d.passengers); });
  const greenest = Object.keys(allCo2).sort(function (a, b) { return allCo2[a] - allCo2[b]; })[0];

  compare.innerHTML = ["flight", "train", "bus"].map(function (m) {
    const best = m === greenest ? " best" : "";
    return '<span class="carbon-chip' + best + '">' + icons[m] + " " +
      modes[m].label + " · " + allCo2[m] + " kg</span>";
  }).join("");

  // Headline + greener nudge
  const head = document.getElementById("carbonHead");
  const text = document.getElementById("carbonText");
  const nudge = document.getElementById("ecoNudge");
  const nudgeText = document.getElementById("ecoNudgeText");
  const savedVsFlight = co2For("flight", distance, d.passengers) - co2;

  if (d.mode === greenest) {
    head.textContent = "Greenest choice — nice one! 🌿";
    text.textContent = "This is the lowest-carbon way to make this trip.";
    nudge.className = "banner banner-ok eco-nudge";
    nudge.hidden = false;
    nudgeText.innerHTML = savedVsFlight > 0
      ? "You're saving <b>" + savedVsFlight + " kg CO₂</b> versus flying this route."
      : "A clean, low-carbon trip.";
  } else {
    head.textContent = "There's a greener way to go";
    text.textContent = "Your " + modes[d.mode].label.toLowerCase() +
      " emits " + co2 + " kg CO₂ for this trip.";
    const altFare = fareFor(greenest, distance, d.travelClass in modes[greenest].classes
      ? d.travelClass : Object.keys(modes[greenest].classes)[0], d.passengers);
    const co2Saved = co2 - allCo2[greenest];
    const fareDiff = fare - altFare;
    nudge.className = "banner banner-info eco-nudge";
    nudge.hidden = false;
    nudgeText.innerHTML = "Switch to <b>" + modes[greenest].label + "</b> and cut <b>" +
      co2Saved + " kg CO₂</b>" +
      (fareDiff > 0 ? " while saving <b>" + money(fareDiff) + "</b>." : ".");
  }
}

/* ----- Validation ----- */
function validate(d) {
  const err = document.getElementById("formError");
  err.textContent = "";
  if (!d.source || !d.destination) { err.textContent = "Please pick both source and destination."; return false; }
  if (d.source === d.destination) { err.textContent = "Source and destination can't be the same."; return false; }
  if (!d.date) { err.textContent = "Please choose a travel date."; return false; }
  if (d.date < todayString()) { err.textContent = "Travel date can't be in the past."; return false; }
  if (!d.travelClass) { err.textContent = "Please select a travel class."; return false; }
  if (d.passengers < 1) { err.textContent = "At least one traveller is required."; return false; }
  if (d.passengers > 10) { err.textContent = "You can book for a maximum of 10 travellers at a time."; return false; }
  return true;
}

function generateBookingId() { return "TE" + Math.floor(10000 + Math.random() * 90000); }

/* ===== Setup ===== */
fillCityDropdowns();
fillClassDropdown("flight");
document.getElementById("date").min = todayString();

// Mode buttons
document.querySelectorAll("#modeGrid .mode-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll("#modeGrid .mode-btn").forEach(function (b) { b.classList.remove("selected"); });
    btn.classList.add("selected");
    currentMode = btn.getAttribute("data-mode");
    fillClassDropdown(currentMode);
    refresh();
  });
});

// Number stepper
document.querySelectorAll(".num-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const input = document.getElementById(btn.getAttribute("data-target"));
    let val = parseInt(input.value, 10) || 1;
    val += btn.getAttribute("data-action") === "inc" ? 1 : -1;
    val = Math.min(10, Math.max(1, val));
    input.value = val;
    refresh();
  });
});

// Recalculate on any change
["source", "destination", "travelClass", "passengers", "date"].forEach(function (id) {
  document.getElementById(id).addEventListener("change", refresh);
});
document.getElementById("calcBtn").addEventListener("click", refresh);

// Confirm booking
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const d = getFormData();
  if (!validate(d)) return;

  const distance = getDistance(d.source, d.destination);
  const fare = fareFor(d.mode, distance, d.travelClass, d.passengers);
  const co2 = co2For(d.mode, distance, d.passengers);
  const savedVsFlight = co2For("flight", distance, d.passengers) - co2;

  const booking = {
    id: generateBookingId(),
    user: getCurrentUser(),
    mode: d.mode,
    source: d.source,
    destination: d.destination,
    date: d.date,
    passengers: d.passengers,
    travelClass: d.travelClass,
    fare: fare,
    distance: distance,
    co2: co2,
    savedVsFlight: savedVsFlight,
    status: "Confirmed"
  };

  const all = getBookings();
  all.push(booking);
  saveBookings(all);

  toast("Booking " + booking.id + " confirmed 🎉");
  setTimeout(function () { window.location.href = "bookings.html"; }, 900);
});
