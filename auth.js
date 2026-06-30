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
    // Round profile avatar (links to the profile page) + Logout button.
    authArea.innerHTML =
      '<a href="profile.html" class="avatar" title="' +
        (user.name || user.email) + '">' + getInitial(user) + '</a>' +
      '<a href="#" id="logoutBtn" class="nav-logout">Logout</a>';
    document.getElementById("logoutBtn").addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });
  } else {
    authArea.innerHTML = '<a href="login.html" class="nav-logout">Login</a>';
  }
}

/* ===== Shared UI behaviour (theme, menu, reveals) ===== */

const THEME_KEY = "te.theme";

function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
}

function initUI() {
  updateNav();

  // Light / dark theme toggle.
  const toggle = document.getElementById("themeToggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  // Mobile nav menu.
  const burger = document.getElementById("navBurger");
  const links = document.querySelector(".nav-links");
  if (burger && links) {
    burger.addEventListener("click", function () {
      const open = links.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
    });
  }

  // Subtle shadow on the navbar once the page is scrolled.
  const nav = document.querySelector(".nav");
  if (nav) {
    window.addEventListener("scroll", function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    }, { passive: true });
  }

  // Reveal elements as they scroll into view.
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { obs.observe(el); });
    // Safety net: make sure nothing stays hidden if the observer misbehaves.
    setTimeout(function () {
      revealEls.forEach(function (el) { el.classList.add("is-in"); });
    }, 1600);
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  // Footer year.
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

document.addEventListener("DOMContentLoaded", initUI);
