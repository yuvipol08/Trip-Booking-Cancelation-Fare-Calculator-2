/* =========================================================
   data.js - City list, coordinates and fare settings.
   Kept in one place so adding a new city is easy: just add
   one line to the `cities` object below.
   ========================================================= */

/* City -> [latitude, longitude].
   Distances are worked out from these in booking.js, so we
   don't have to type out every city-to-city distance. */
const cities = {
  "Delhi": [28.61, 77.21],
  "Mumbai": [19.08, 72.88],
  "Bangalore": [12.97, 77.59],
  "Kolkata": [22.57, 88.36],
  "Chennai": [13.08, 80.27],
  "Hyderabad": [17.39, 78.49],
  "Pune": [18.52, 73.86],
  "Ahmedabad": [23.03, 72.58],
  "Surat": [21.17, 72.83],
  "Jaipur": [26.91, 75.79],
  "Lucknow": [26.85, 80.95],
  "Kanpur": [26.45, 80.33],
  "Nagpur": [21.15, 79.09],
  "Indore": [22.72, 75.86],
  "Bhopal": [23.26, 77.41],
  "Patna": [25.59, 85.14],
  "Chandigarh": [30.73, 76.78],
  "Kochi": [9.93, 76.27],
  "Goa": [15.30, 74.12],
  "Varanasi": [25.32, 82.97],
  "Amritsar": [31.63, 74.87],
  "Guwahati": [26.14, 91.74],
  "Coimbatore": [11.02, 76.96],
  "Visakhapatnam": [17.69, 83.22],
  "Bhubaneswar": [20.30, 85.82],
  "Dehradun": [30.32, 78.03],
  "Ranchi": [23.34, 85.31],
  "Raipur": [21.25, 81.63],
  "Madurai": [9.93, 78.12],
  "Srinagar": [34.08, 74.80]
};

/* Settings for each travel mode:
   - rate: price per km in rupees
   - base: a small fixed booking fee
   - classes: the seat/coach classes with their price multipliers */
const modes = {
  flight: {
    label: "Flight",
    rate: 5.0,
    base: 800,
    classes: {
      "Economy": 1,
      "Premium Economy": 1.4,
      "Business": 1.8,
      "First Class": 2.5
    }
  },
  train: {
    label: "Train",
    rate: 1.2,
    base: 60,
    classes: {
      "Sleeper": 1,
      "AC 3-Tier": 1.6,
      "AC 2-Tier": 2.0,
      "First AC": 2.6
    }
  },
  bus: {
    label: "Bus",
    rate: 0.9,
    base: 40,
    classes: {
      "Seater": 1,
      "AC Seater": 1.4,
      "Sleeper": 1.8
    }
  }
};

/* Where all bookings are stored in localStorage. */
const BOOKINGS_KEY = "te_bookings";

function getBookings() {
  return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
}

function saveBookings(list) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
}
