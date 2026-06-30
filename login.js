/* =========================================================
   login.js - Handles the Login and Registration forms.
   ========================================================= */

// If already logged in, no need to be on this page.
if (getCurrentUser()) {
  window.location.href = "booking.html";
}

const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

/* ----- Switch between the two tabs ----- */
function showLogin() {
  loginTab.classList.add("active");
  registerTab.classList.remove("active");
  loginForm.classList.remove("hidden");
  registerForm.classList.add("hidden");
}

function showRegister() {
  registerTab.classList.add("active");
  loginTab.classList.remove("active");
  registerForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
}

loginTab.addEventListener("click", showLogin);
registerTab.addEventListener("click", showRegister);

/* ----- Simple email check ----- */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ----- 10-digit mobile number check ----- */
function isValidMobile(mobile) {
  return /^\d{10}$/.test(mobile);
}

/* ----- Strong password check -----
   At least 8 characters and must contain an uppercase letter, a
   lowercase letter, a number and a special (non-alphanumeric) character. */
function isStrongPassword(pass) {
  return (
    pass.length >= 8 &&
    /[A-Z]/.test(pass) &&
    /[a-z]/.test(pass) &&
    /[0-9]/.test(pass) &&
    /[^A-Za-z0-9]/.test(pass)
  );
}

/* ----- Registration ----- */
registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("regName").value.trim();
  const mobile = document.getElementById("regMobile").value.trim();
  const email = document.getElementById("regEmail").value.trim().toLowerCase();
  const pass = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;

  // Name, mobile and email are all compulsory.
  if (name === "") {
    alert("Please enter your name.");
    return;
  }
  if (!isValidMobile(mobile)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }
  if (!isValidEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }
  if (!isStrongPassword(pass)) {
    alert(
      "Password must be at least 8 characters long and include:\n" +
      "• an uppercase letter (A-Z)\n" +
      "• a lowercase letter (a-z)\n" +
      "• a number (0-9)\n" +
      "• a special character (e.g. ! @ # $ %)"
    );
    return;
  }
  if (pass !== confirm) {
    alert("Passwords do not match. Please try again.");
    return;
  }

  const users = getUsers();
  if (users.some(function (u) { return u.email === email; })) {
    alert("An account with this email already exists. Please login.");
    showLogin();
    return;
  }

  // Store the mobile as `phone` so the Profile page picks it up automatically.
  users.push({ name: name, email: email, phone: mobile, password: pass });
  saveUsers(users);

  alert("Registration successful! Please login to continue.");
  registerForm.reset();
  showLogin();
});

/* ----- Login ----- */
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const pass = document.getElementById("loginPassword").value;

  if (!isValidEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  const users = getUsers();
  const found = users.find(function (u) {
    return u.email === email && u.password === pass;
  });

  if (!found) {
    alert("Invalid email or password. If you are new, please register first.");
    return;
  }

  setCurrentUser(email);
  alert("Welcome back, " + found.name + "!");
  window.location.href = "booking.html";
});
