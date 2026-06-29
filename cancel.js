/* =========================================================
   cancel.js - Cancel a booking by its ID and show refund.
   ========================================================= */

requireLogin();

document.getElementById("cancelBtn").addEventListener("click", function () {
  const cancelId = document.getElementById("cancelId").value.trim().toUpperCase();
  const refundMsg = document.getElementById("refundMsg");
  const user = getCurrentUser();

  refundMsg.classList.remove("hidden", "error");

  if (cancelId === "") {
    alert("Please enter a Booking ID to cancel.");
    refundMsg.classList.add("hidden");
    return;
  }

  const all = getBookings();
  // Find a booking with this ID that belongs to the logged-in user.
  const booking = all.find(function (b) {
    return b.id === cancelId && b.user === user;
  });

  if (!booking) {
    refundMsg.classList.add("error");
    refundMsg.textContent =
      "No booking found with ID " + cancelId + " under your account. " +
      "Please check the ID and try again.";
    return;
  }

  if (booking.status === "Cancelled") {
    refundMsg.classList.add("error");
    refundMsg.textContent =
      "Booking " + cancelId + " has already been cancelled.";
    return;
  }

  // Mark the booking as cancelled and save.
  booking.status = "Cancelled";
  saveBookings(all);

  // Refund 80% of the fare (20% cancellation charge).
  const refund = Math.round(booking.fare * 0.8);

  refundMsg.textContent =
    "Booking " + cancelId + " cancelled successfully. A refund of Rs " +
    refund.toLocaleString("en-IN") +
    " (80% of fare) will be credited within 5-7 working days.";

  alert("Trip cancelled successfully. Your refund is being processed.");
});
