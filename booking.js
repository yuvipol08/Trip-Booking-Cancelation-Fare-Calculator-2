/* =========================================================
   booking.js - Trip booking form, fare calculation and
   saving the booking. Works for Flight, Train and Bus.
   ========================================================= */

// This page needs a logged-in user.
requireLogin();

/* ----- Today's date as YYYY-MM-DD (for the date input) ----- */
function todayString() {
  const t = new Date();
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return t.getFullYear() + "-" + mm + "-" + dd;
}

/* ----- Fill the city dropdowns from data.js ----- */
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
  classSel.innerHTML = '<option value="">-- Select Class --</option>';

  const classes = modes[mode].classes;
  Object.keys(classes).forEach(function (cls) {
    classSel.innerHTML += '<option value="' + cls + '">' + cls + "</option>";
  });
}

/* ----- Distance between two cities using the Haversine
   formula (great-circle distance from lat/long). ----- */
function getDistance(source, destination) {
  const [lat1, lon1] = cities[source];
  const [lat2, lon2] = cities[destination];

  const toRad = function (deg) { return (deg * Math.PI) / 180; };
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/* ----- Calculate the total fare ----- */
function calculateFare(mode, source, destination, travelClass, passengers) {
  const distance = getDistance(source, destination);
  const setup = modes[mode];
  const multiplier = setup.classes[travelClass] || 1;

  // (distance * per-km rate * class multiplier + base fee) * passengers
  const fare = (distance * setup.rate * multiplier + setup.base) * passengers;
  return Math.round(fare);
}

/* ----- Read the current form values ----- */
function getFormData() {
  const modeInput = document.querySelector('input[name="mode"]:checked');
  return {
    mode: modeInput ? modeInput.value : "",
    source: document.getElementById("source").value,
    destination: document.getElementById("destination").value,
    date: document.getElementById("date").value,
    passengers: parseInt(document.getElementById("passengers").value, 10),
    travelClass: document.getElementById("travelClass").value
  };
}

/* ----- Update the live fare estimate box ----- */
function updateFareEstimate() {
  const data = getFormData();
  const fareEl = document.getElementById("fareEstimate");

  if (
    data.mode &&
    data.source &&
    data.destination &&
    data.source !== data.destination &&
    data.travelClass &&
    data.passengers >= 1
  ) {
    const fare = calculateFare(
      data.mode, data.source, data.destination, data.travelClass, data.passengers
    );
    fareEl.textContent = "Rs " + fare.toLocaleString("en-IN");
  } else {
    fareEl.textContent = "Rs 0";
  }
}

/* ----- Validation ----- */
function validateForm(data) {
  if (!data.mode) {
    alert("Please choose a travel mode (Flight, Train or Bus).");
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
  // Block past dates as a backup to the date picker's min attribute.
  if (data.date < todayString()) {
    alert("Travel date cannot be in the past. Please choose today or a future date.");
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

/* ----- Make a random booking ID ----- */
function generateBookingId() {
  return "TE" + Math.floor(10000 + Math.random() * 90000);
}

/* ===== Set up the page ===== */
fillCityDropdowns();
fillClassDropdown("flight"); // default mode is flight

// Stop users from picking a past travel date.
document.getElementById("date").min = todayString();

// When the travel mode changes, refresh the class list + fare.
document.querySelectorAll('input[name="mode"]').forEach(function (radio) {
  radio.addEventListener("change", function () {
    fillClassDropdown(this.value);
    updateFareEstimate();
  });
});

// Recalculate the estimate whenever a field changes.
["source", "destination", "travelClass", "passengers"].forEach(function (id) {
  document.getElementById(id).addEventListener("change", updateFareEstimate);
  document.getElementById(id).addEventListener("keyup", updateFareEstimate);
});

// "Calculate Fare" button.
document.getElementById("calcBtn").addEventListener("click", function () {
  const data = getFormData();
  if (!data.source || !data.destination || !data.travelClass) {
    alert("Please select route and travel class to calculate the fare.");
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
  if (!validateForm(data)) return;

  const fare = calculateFare(
    data.mode, data.source, data.destination, data.travelClass, data.passengers
  );

  const booking = {
    id: generateBookingId(),
    user: getCurrentUser(),
    mode: data.mode,
    source: data.source,
    destination: data.destination,
    date: data.date,
    passengers: data.passengers,
    travelClass: data.travelClass,
    fare: fare,
    status: "Confirmed"
  };

  // Save the booking to localStorage.
  const all = getBookings();
  all.push(booking);
  saveBookings(all);

  alert(
    "Booking confirmed! 🎉\n\n" +
    modes[data.mode].label + " from " + data.source + " to " + data.destination +
    "\nBooking ID: " + booking.id +
    "\nTotal Fare: Rs " + fare.toLocaleString("en-IN") +
    "\n\nYou can view it under 'My Bookings'."
  );

  window.location.href = "bookings.html";
});
