/* =========================================================
   bookings.js - Ticket list, cancellation, and the
   Carbon-Smart "Green Score" summary.
   ========================================================= */

requireLogin();

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function money(n) { return "₹" + Math.round(n).toLocaleString("en-IN"); }

/* Days from today until the travel date. */
function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dep = new Date(dateStr); dep.setHours(0, 0, 0, 0);
  return Math.round((dep - today) / 86400000);
}

/* Refund %: 7+ days 90, 3-6 days 60, 1-2 days 30, else 0. */
function refundPercent(dateStr) {
  const days = daysUntil(dateStr);
  if (days >= 7) return 90;
  if (days >= 3) return 60;
  if (days >= 1) return 30;
  return 0;
}

function myBookings() {
  const user = getCurrentUser();
  return getBookings().filter(function (b) { return b.user === user; });
}

/* ----- Green Score: total CO2 saved vs flying, across live trips ----- */
function renderGreenScore() {
  const el = document.getElementById("greenScore");
  const active = myBookings().filter(function (b) { return b.status !== "Cancelled"; });
  const saved = active.reduce(function (sum, b) { return sum + (b.savedVsFlight || 0); }, 0);

  if (active.length === 0) { el.hidden = true; return; }
  el.hidden = false;

  const tier = greenTier(saved);
  const idx = GREEN_TIERS.indexOf(tier);
  const next = GREEN_TIERS[idx + 1];
  let sub, pct;
  if (next) {
    sub = saved.toLocaleString("en-IN") + " kg CO₂ saved vs flying · " +
      (next.min - saved) + " kg to " + next.name;
    pct = Math.round(((saved - tier.min) / (next.min - tier.min)) * 100);
  } else {
    sub = saved.toLocaleString("en-IN") + " kg CO₂ saved vs flying · top tier reached!";
    pct = 100;
  }

  el.innerHTML =
    '<div class="gs-label">Your Green Score</div>' +
    '<div class="gs-tier">' + tier.icon + " " + tier.name + "</div>" +
    '<div class="gs-saved">' + sub + "</div>" +
    '<div class="gs-bar"><div class="gs-fill" style="width:' + Math.max(4, Math.min(100, pct)) + '%"></div></div>';
}

/* ----- Booking tickets ----- */
function renderBookings() {
  const listEl = document.getElementById("bookingList");
  const emptyNote = document.getElementById("emptyNote");
  const list = myBookings().reverse();

  if (list.length === 0) {
    emptyNote.classList.remove("hidden");
    listEl.innerHTML = "";
    return;
  }
  emptyNote.classList.add("hidden");

  listEl.innerHTML = list.map(function (b) {
    const cancelled = b.status === "Cancelled";
    const modeLabel = modes[b.mode] ? modes[b.mode].label : b.mode;
    const co2 = (b.co2 != null) ? b.co2 + " kg" : "—";

    let footer;
    if (cancelled) {
      footer =
        '<span class="eco-row">↩︎ Refunded ' + money(b.refund || 0) + '</span>' +
        '<span class="pill pill-cancelled">Cancelled</span>';
    } else {
      const pct = refundPercent(b.date);
      const eco = (b.savedVsFlight)
        ? '<span class="eco-row">🌿 Saved ' + b.savedVsFlight + ' kg CO₂ vs flying</span>'
        : '<span class="eco-row">✈️ Lowest-carbon isn\'t flying — try train next time</span>';
      footer = eco +
        '<button class="btn btn-danger btn-sm cancel-btn" data-id="' + b.id + '">Cancel · ' + pct + '% back</button>';
    }

    return (
      '<div class="ticket' + (cancelled ? " cancelled" : "") + '">' +
        '<div class="ticket-header">' +
          '<div><div class="ticket-route">' + b.source + " → " + b.destination + "</div>" +
          '<div class="ticket-id">' + b.id + "</div></div>" +
          '<span class="pill ' + (cancelled ? "pill-cancelled" : "pill-active") + '">' + b.status + "</span>" +
        "</div>" +
        '<div class="ticket-grid">' +
          '<div><span class="k">Mode</span><span class="v">' + modeLabel + "</span></div>" +
          '<div><span class="k">Class</span><span class="v">' + b.travelClass + "</span></div>" +
          '<div><span class="k">Date</span><span class="v">' + formatDate(b.date) + "</span></div>" +
          '<div><span class="k">Travellers</span><span class="v">' + b.passengers + "</span></div>" +
          '<div><span class="k">Distance</span><span class="v mono">' + (b.distance != null ? b.distance + " km" : "—") + "</span></div>" +
          '<div><span class="k">CO₂</span><span class="v mono">' + co2 + "</span></div>" +
          '<div><span class="k">Total fare</span><span class="v mono">' + money(b.fare) + "</span></div>" +
        "</div>" +
        '<div class="ticket-footer">' + footer + "</div>" +
      "</div>"
    );
  }).join("");

  document.querySelectorAll(".cancel-btn").forEach(function (btn) {
    btn.addEventListener("click", function () { cancelBooking(this.getAttribute("data-id")); });
  });
}

/* ----- Cancel a booking ----- */
function cancelBooking(id) {
  const all = getBookings();
  const booking = all.find(function (b) { return b.id === id; });
  if (!booking || booking.status === "Cancelled") return;

  const pct = refundPercent(booking.date);
  const refund = Math.round(booking.fare * pct / 100);

  const ok = confirm(
    "Cancel booking " + booking.id + "?\n\n" +
    "Refund: " + pct + "% of " + money(booking.fare) + " = " + money(refund) +
    (pct === 0 ? "\n(No refund within 24 hours of departure.)" : "")
  );
  if (!ok) return;

  booking.status = "Cancelled";
  booking.refund = refund;
  saveBookings(all);

  toast(refund > 0 ? "Cancelled · " + money(refund) + " refunded" : "Cancelled · no refund applies");
  renderGreenScore();
  renderBookings();
}

renderGreenScore();
renderBookings();
