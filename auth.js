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

/* Return the full record of the logged-in user (or null). */
function getCurrentUserObject() {
  const email = getCurrentUser();
  if (!email) return null;
  return getUsers().find(function (u) { return u.email === email; }) || null;
}

/* First letter to show inside the round profile avatar. */
function getInitial(user) {
  const text = (user && user.name) ? user.name : (user && user.email) || "?";
  return text.charAt(0).toUpperCase();
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

  const user = getCurrentUserObject();
  if (user) {
    const name = user.name || user.email;
    authArea.innerHTML =
      '<span class="user-greeting">Hi, ' + name.split(" ")[0] + '</span>' +
      '<a href="profile.html" class="avatar-sm" title="View profile">' + getInitial(user) + '</a>' +
      '<button class="nav-link logout-btn" id="logoutBtn">Log out</button>';
    document.getElementById("logoutBtn").addEventListener("click", function () {
      logout();
    });
  } else {
    authArea.innerHTML = '<a href="login.html" class="nav-link">Log in</a>';
  }
}

/* Small toast message in the corner (nicer than alert for success). */
function toast(message) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(function () { el.classList.remove("show"); }, 2600);
}

/* ===== Shared UI behaviour ===== */
function initUI() {
  updateNav();

  // Highlight the nav link for the current page.
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav .nav-link").forEach(function (a) {
    const href = a.getAttribute("href");
    if (href === here) a.classList.add("active");
  });

  // Mobile nav dropdown toggle.
  const toggle = document.getElementById("navToggle");
  const nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () { nav.classList.toggle("open"); });
  }

  // Footer year.
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", initUI);
