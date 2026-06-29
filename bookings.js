/* =========================================================
   bookings.js - Shows the logged-in user's bookings.
   ========================================================= */

requireLogin();

/* ----- Format a date like 28 Jun 2026 ----- */
function formatDate(dateStr) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-IN", options);
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
      "</div>"
    );
  }).join("");
}

renderBookings();
