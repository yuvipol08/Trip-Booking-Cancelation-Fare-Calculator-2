/* =========================================================
   profile.js - View and save the logged-in user's details.
   Details are stored inside the user's record in localStorage.
   ========================================================= */

requireLogin();

const user = getCurrentUserObject();

/* ----- Fill the home-city dropdown from data.js ----- */
function fillCityDropdown() {
  const citySel = document.getElementById("pCity");
  Object.keys(cities).sort().forEach(function (city) {
    citySel.innerHTML += '<option value="' + city + '">' + city + "</option>";
  });
}

/* ----- Show the avatar + name + saved values on screen ----- */
function loadProfile() {
  document.getElementById("profileAvatar").textContent = getInitial(user);
  document.getElementById("profileName").textContent = user.name || "Your Name";
  document.getElementById("profileEmail").textContent = user.email;

  document.getElementById("pName").value = user.name || "";
  document.getElementById("pEmail").value = user.email;
  document.getElementById("pPhone").value = user.phone || "";
  document.getElementById("pGender").value = user.gender || "";
  document.getElementById("pCity").value = user.city || "";
  document.getElementById("pAddress").value = user.address || "";
}

fillCityDropdown();
loadProfile();

/* ----- Save the form back into the user's record ----- */
document.getElementById("profileForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("pName").value.trim();
  const phone = document.getElementById("pPhone").value.trim();

  if (name === "") {
    alert("Please enter your name.");
    return;
  }
  // Phone is optional, but if given it must be 10 digits.
  if (phone !== "" && !/^\d{10}$/.test(phone)) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }

  // Update the matching user inside the stored users list.
  const users = getUsers();
  const record = users.find(function (u) { return u.email === user.email; });
  if (!record) return;

  record.name = name;
  record.phone = phone;
  record.gender = document.getElementById("pGender").value;
  record.city = document.getElementById("pCity").value;
  record.address = document.getElementById("pAddress").value.trim();
  saveUsers(users);

  // Refresh the avatar/name shown on the page and in the header.
  document.getElementById("profileAvatar").textContent = name.charAt(0).toUpperCase();
  document.getElementById("profileName").textContent = name;
  updateNav();

  alert("Your profile details have been saved successfully!");
});
