/* =========================================================
   bookings.js - Shows the logged-in user's bookings and
   lets them cancel a trip directly from each ticket.
   ========================================================= */

requireLogin();

/* ----- Format a date like 28 Jun 2026 ----- */
function formatDate(dateStr) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-IN", options);
}

/* ----- How many full days until the travel date ----- */
function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const departure = new Date(dateStr);
  departure.setHours(0, 0, 0, 0);
  return Math.round((departure - today) / (1000 * 60 * 60 * 24));
}

/* ----- Refund percentage based on how early the trip is
   cancelled before the departure date:
     7+ days  -> 90%
     3-6 days -> 60%
     1-2 days -> 30%
     under 24 hours / same day / past -> 0% ----- */
function getRefundPercent(dateStr) {
  const days = daysUntil(dateStr);
  if (days >= 7) return 90;
  if (days >= 3) return 60;
  if (days >= 1) return 30;
  return 0;
}

/* ----- Build the list of bookings on screen ----- */
function renderBookings() {
  const listEl = document.getElementById("bookingList");
  const emptyNote = document.getElementById("emptyNote");
  const user = getCurrentUser();

  // Only show the current user's bookings, newest first.
  const myBookings = getBookings()
    .filter(function (b) { return b.user === user; })
    .reverse();

  if (myBookings.length === 0) {
    emptyNote.classList.remove("hidden");
    listEl.innerHTML = "";
    return;
  }

  emptyNote.classList.add("hidden");

  listEl.innerHTML = myBookings.map(function (b) {
    const isCancelled = b.status === "Cancelled";
    const modeLabel = modes[b.mode] ? modes[b.mode].label : b.mode;

    // Footer area: either a cancel button or a refund note.
    let footer;
    if (isCancelled) {
      footer =
        '<span class="refund-note">Cancelled · Refund: Rs ' +
        (b.refund || 0).toLocaleString("en-IN") + "</span>";
    } else {
      const percent = getRefundPercent(b.date);
      footer =
        '<span class="refund-note">Cancel now &rarr; ' + percent +
        '% refund</span>' +
        '<button class="btn btn-danger btn-sm cancel-btn" data-id="' + b.id +
        '">Cancel Booking</button>';
    }

    return (
      '<div class="booking-item' + (isCancelled ? " cancelled" : "") + '">' +
        '<div class="booking-head">' +
          "<h3>" + b.source + " &rarr; " + b.destination + "</h3>" +
          '<span class="badge' + (isCancelled ? " cancelled" : "") + '">' +
            b.status + "</span>" +
        "</div>" +
        '<div class="booking-grid">' +
          "<div><span>Booking ID</span>" + b.id + "</div>" +
          "<div><span>Mode</span>" + modeLabel + "</div>" +
          "<div><span>Class</span>" + b.travelClass + "</div>" +
          "<div><span>Travel Date</span>" + formatDate(b.date) + "</div>" +
          "<div><span>Passengers</span>" + b.passengers + "</div>" +
          "<div><span>Total Fare</span>Rs " + b.fare.toLocaleString("en-IN") + "</div>" +
        "</div>" +
        '<div class="booking-footer">' + footer + "</div>" +
      "</div>"
    );
  }).join("");

  attachCancelHandlers();
}

/* ----- Wire up the Cancel button on each ticket ----- */
function attachCancelHandlers() {
  document.querySelectorAll(".cancel-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      cancelBooking(this.getAttribute("data-id"));
    });
  });
}

/* ----- Cancel a single booking by its ID ----- */
function cancelBooking(id) {
  const all = getBookings();
  const booking = all.find(function (b) { return b.id === id; });
  if (!booking) return;

  const percent = getRefundPercent(booking.date);
  const refund = Math.round(booking.fare * percent / 100);

  // Ask the user to confirm before cancelling.
  const ok = confirm(
    "Cancel booking " + booking.id + "?\n\n" +
    "Refund: " + percent + "% of Rs " +
    booking.fare.toLocaleString("en-IN") +
    " = Rs " + refund.toLocaleString("en-IN") +
    (percent === 0 ? "\n(No refund within 24 hours of departure.)" : "")
  );
  if (!ok) return;

  booking.status = "Cancelled";
  booking.refund = refund;
  saveBookings(all);

  alert(
    "Booking " + booking.id + " cancelled.\n" +
    (refund > 0
      ? "A refund of Rs " + refund.toLocaleString("en-IN") +
        " will be credited within 5-7 working days."
      : "No refund is applicable for this cancellation.")
  );

  renderBookings();
}

renderBookings();
