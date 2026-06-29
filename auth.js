/* =========================================================
   auth.js - Shared login / session helpers for all pages.
   Uses the browser's localStorage to simulate accounts.
   NOTE: passwords are stored in plain text here only because
   this is a learning project with no real backend.
   ========================================================= */

const USERS_KEY = "te_users"; // list of registered accounts
const SESSION_KEY = "te_current_user"; // email of the logged-in user

/* ----- Read / write the list of registered users ----- */
function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ----- Session helpers ----- */
function getCurrentUser() {
  return localStorage.getItem(SESSION_KEY);
}

function setCurrentUser(email) {
  localStorage.setItem(SESSION_KEY, email);
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

/* Redirect to the login page if no user is logged in.
   Call this at the top of any page that needs a login. */
function requireLogin() {
  if (!getCurrentUser()) {
    alert("Please login first to access this page.");
    window.location.href = "login.html";
  }
}

/* Show the correct buttons in the header depending on
   whether someone is logged in or not. */
function updateNav() {
  const authArea = document.getElementById("authArea");
  if (!authArea) return;

  const user = getCurrentUser();
  if (user) {
    const name = user.split("@")[0]; // friendly name from the email
    authArea.innerHTML =
      '<span class="nav-user">Hi, ' + name + '</span>' +
      '<a href="#" id="logoutBtn" class="nav-logout">Logout</a>';
    document.getElementById("logoutBtn").addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  } else {
    authArea.innerHTML = '<a href="login.html" class="nav-logout">Login</a>';
  }
}

// Build the header state as soon as the page loads.
document.addEventListener("DOMContentLoaded", updateNav);
