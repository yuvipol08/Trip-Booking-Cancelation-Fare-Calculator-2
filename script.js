/* =========================================================
   TravelEase - Trip Booking, Cancellation & Fare Calculator
   Plain JavaScript - no frameworks or libraries used.
   ========================================================= */

/* Approximate distances (in km) between cities.
   Used by the fare calculator to estimate the trip cost. */
const distances = {
  "Delhi-Mumbai": 1400,
  "Delhi-Bangalore": 2150,
  "Delhi-Kolkata": 1500,
  "Delhi-Chennai": 2200,
  "Delhi-Jaipur": 280,
  "Mumbai-Bangalore": 980,
  "Mumbai-Kolkata": 2000,
  "Mumbai-Chennai": 1330,
  "Mumbai-Jaipur": 1150,
  "Bangalore-Kolkata": 1870,
  "Bangalore-Chennai": 350,
  "Bangalore-Jaipur": 2000,
  "Kolkata-Chennai": 1670,
  "Kolkata-Jaipur": 1500,
  "Chennai-Jaipur": 2100
};

/* Price multiplier for each travel class. */
const classRates = {
  economy: 1,
  business: 1.6,
  luxury: 2.2
};

/* Base fare per km in rupees. */
const BASE_RATE = 2.5;

/* Store the latest booking so the summary can be shown. */
let currentBooking = null;

/* ----- Helper: look up distance between two cities ----- */
function getDistance(source, destination) {
  // Try both key orders since the route is the same either way.
  const key1 = source + "-" + destination;
  const key2 = destination + "-" + source;
  return distances[key1] || distances[key2] || 0;
}

/* ----- Calculate total fare ----- */
function calculateFare(source, destination, travelClass, passengers) {
  const distance = getDistance(source, destination);
  const rate = classRates[travelClass] || 1;
  // fare = distance * base rate * class multiplier * passengers
  const fare = distance * BASE_RATE * rate * passengers;
  return Math.round(fare);
}

/* ----- Read and validate form values ----- */
function getFormData() {
  return {
    name: document.getElementById("name").value.trim(),
    source: document.getElementById("source").value,
    destination: document.getElementById("destination").value,
    date: document.getElementById("date").value,
    passengers: parseInt(document.getElementById("passengers").value, 10),
    travelClass: document.getElementById("travelClass").value
  };
}

function validateForm(data) {
  if (data.name === "") {
    alert("Please enter your full name.");
    return false;
  }
  if (data.source === "" || data.destination === "") {
    alert("Please select both source and destination cities.");
    return false;
  }
  if (data.source === data.destination) {
    alert("Source and destination cannot be the same city.");
    return false;
  }
  if (data.date === "") {
    alert("Please choose a travel date.");
    return false;
  }
  if (!data.passengers || data.passengers < 1) {
    alert("Please enter a valid number of passengers (at least 1).");
    return false;
  }
  if (data.travelClass === "") {
    alert("Please select a travel class.");
    return false;
  }
  return true;
}

/* ----- Update the live fare estimate box ----- */
function updateFareEstimate() {
  const data = getFormData();
  const fareEl = document.getElementById("fareEstimate");

  if (
    data.source &&
    data.destination &&
    data.source !== data.destination &&
    data.travelClass &&
    data.passengers >= 1
  ) {
    const fare = calculateFare(
      data.source,
      data.destination,
      data.travelClass,
      data.passengers
    );
    fareEl.textContent = "₹" + fare.toLocaleString("en-IN");
  } else {
    fareEl.textContent = "₹0";
  }
}

/* ----- Generate a simple random booking ID ----- */
function generateBookingId() {
  const num = Math.floor(10000 + Math.random() * 90000);
  return "TE" + num;
}

/* ----- Format date nicely (e.g. 28 Jun 2026) ----- */
function formatDate(dateStr) {
  const options = { day: "numeric", month: "short", year: "numeric" };
  return new Date(dateStr).toLocaleDateString("en-IN", options);
}

/* ----- Capitalize the first letter (for travel class) ----- */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/* ----- Show the booking summary on screen ----- */
function showSummary(booking) {
  document.getElementById("emptyNote").classList.add("hidden");
  document.getElementById("summaryDetails").classList.remove("hidden");

  document.getElementById("sBookingId").textContent = booking.id;
  document.getElementById("sName").textContent = booking.name;
  document.getElementById("sRoute").textContent =
    booking.source + " → " + booking.destination;
  document.getElementById("sDate").textContent = formatDate(booking.date);
  document.getElementById("sPassengers").textContent = booking.passengers;
  document.getElementById("sClass").textContent = capitalize(booking.travelClass);
  document.getElementById("sFare").textContent =
    "₹" + booking.fare.toLocaleString("en-IN");
}

/* ===== Event Listeners ===== */

// Recalculate the estimate whenever an input changes.
["source", "destination", "travelClass", "passengers"].forEach(function (id) {
  document.getElementById(id).addEventListener("change", updateFareEstimate);
  document.getElementById(id).addEventListener("keyup", updateFareEstimate);
});

// "Calculate Fare" button.
document.getElementById("calcBtn").addEventListener("click", function () {
  const data = getFormData();
  if (data.source === "" || data.destination === "" || data.travelClass === "") {
    alert("Please select source, destination and travel class to calculate fare.");
    return;
  }
  if (data.source === data.destination) {
    alert("Source and destination cannot be the same city.");
    return;
  }
  updateFareEstimate();
});

// Booking form submit.
document.getElementById("bookingForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const data = getFormData();
  if (!validateForm(data)) {
    return;
  }

  const fare = calculateFare(
    data.source,
    data.destination,
    data.travelClass,
    data.passengers
  );

  currentBooking = {
    id: generateBookingId(),
    name: data.name,
    source: data.source,
    destination: data.destination,
    date: data.date,
    passengers: data.passengers,
    travelClass: data.travelClass,
    fare: fare
  };

  showSummary(currentBooking);

  alert(
    "Booking confirmed! 🎉\n\nYour Booking ID is " +
      currentBooking.id +
      ".\nPlease save it to manage or cancel your trip later."
  );

  // Scroll down to the summary section.
  document.getElementById("summary").scrollIntoView({ behavior: "smooth" });
});

// Cancellation button.
document.getElementById("cancelBtn").addEventListener("click", function () {
  const cancelId = document.getElementById("cancelId").value.trim();
  const refundMsg = document.getElementById("refundMsg");

  if (cancelId === "") {
    alert("Please enter a Booking ID to cancel.");
    return;
  }

  // Simulated cancellation: any non-empty ID is treated as valid.
  let refundText;
  if (currentBooking && cancelId.toUpperCase() === currentBooking.id) {
    // Refund 80% of the actual fare for the known booking.
    const refund = Math.round(currentBooking.fare * 0.8);
    refundText =
      "Booking " +
      currentBooking.id +
      " cancelled successfully. A refund of ₹" +
      refund.toLocaleString("en-IN") +
      " (80% of fare) will be credited within 5-7 working days.";
  } else {
    refundText =
      "Booking " +
      cancelId.toUpperCase() +
      " cancelled successfully. Your refund will be processed within 5-7 working days.";
  }

  refundMsg.textContent = refundText;
  refundMsg.classList.remove("hidden");

  alert("Trip cancelled successfully. Refund is being processed.");
});
