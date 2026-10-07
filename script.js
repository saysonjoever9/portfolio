/* ============================================================
   JOEVER L. SAYSON — PORTFOLIO SCRIPTS
   ============================================================ */

/* ============ TYPING EFFECT ============ */
const roles = [
  "AI & Machine Learning Developer",
  "Full-Stack Web Developer",
  "Mobile App Developer",
  "Hardware–Software Integrator",
  "Computer Engineering Graduate",
];

const typedEl = document.getElementById("typed");
let roleIndex = 0;
let charIndex = 0;
let deleting = false;

function typeLoop() {
  if (!typedEl) return;

  const current = roles[roleIndex];

  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIndex);
    if (charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 1600);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIndex);
    if (charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }
  }

  setTimeout(typeLoop, deleting ? 40 : 90);
}

typeLoop();

/* ============ THEME TOGGLE ============ */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;
const root = document.documentElement;

function syncThemeIcon() {
  if (!themeIcon) return;
  const isLight = root.getAttribute("data-theme") === "light";
  themeIcon.classList.remove("fa-moon", "fa-sun");
  themeIcon.classList.add(isLight ? "fa-sun" : "fa-moon");
}

syncThemeIcon();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const isLight = root.getAttribute("data-theme") === "light";
    const newTheme = isLight ? "dark" : "light";

    themeToggle.classList.add("rotating");

    setTimeout(() => {
      if (newTheme === "light") {
        root.setAttribute("data-theme", "light");
      } else {
        root.removeAttribute("data-theme");
      }

      localStorage.setItem("theme", newTheme);

      themeIcon.classList.remove("fa-moon", "fa-sun");
      themeIcon.classList.add(newTheme === "light" ? "fa-sun" : "fa-moon");

      themeToggle.classList.remove("rotating");
    }, 200);
  });
}

window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => {
    if (localStorage.getItem("theme")) return;
    if (e.matches) {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    syncThemeIcon();
  });

/* ============ NAVBAR SCROLL EFFECT ============ */
const navbar = document.getElementById("navbar");
const scrollTopBtn = document.getElementById("scrollTop");
const scrollDownBtn = document.getElementById("scrollDown");

window.addEventListener("scroll", () => {
  const y = window.scrollY;

  if (navbar) navbar.classList.toggle("scrolled", y > 40);
  if (scrollTopBtn) scrollTopBtn.classList.toggle("visible", y > 400);
  if (scrollDownBtn) scrollDownBtn.classList.toggle("visible", y < 200);

  updateActiveLink();
});

/* ============ MOBILE MENU (with close button + overlay) ============ */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navClose = document.getElementById("navClose");
const navOverlay = document.getElementById("navOverlay");

function openMenu() {
  if (!navLinks) return;
  navLinks.classList.add("open");
  if (navOverlay) navOverlay.classList.add("active");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "true");
    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-bars");
      icon.classList.add("fa-xmark");
    }
  }
  document.body.classList.add("no-scroll");
}

function closeMenu() {
  if (!navLinks) return;
  navLinks.classList.remove("open");
  if (navOverlay) navOverlay.classList.remove("active");
  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", "false");
    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.classList.add("fa-bars");
      icon.classList.remove("fa-xmark");
    }
  }
  document.body.classList.remove("no-scroll");
}

function toggleMenu() {
  if (!navLinks) return;
  if (navLinks.classList.contains("open")) {
    closeMenu();
  } else {
    openMenu();
  }
}

if (menuToggle && navLinks) {
  // Hamburger toggle
  menuToggle.addEventListener("click", toggleMenu);

  // Close button
  if (navClose) {
    navClose.addEventListener("click", closeMenu);
  }

  // Close on nav-link click
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on overlay click
  if (navOverlay) {
    navOverlay.addEventListener("click", closeMenu);
  }

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      closeMenu();
    }
  });

  // Close on window resize to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 968 && navLinks.classList.contains("open")) {
      closeMenu();
    }
  });
}

/* ============ ACTIVE LINK ON SCROLL ============ */
const sections = document.querySelectorAll("section[id]");
const links = document.querySelectorAll(".nav-link");

function updateActiveLink() {
  const scrollY = window.scrollY + 120;

  sections.forEach((sec) => {
    const top = sec.offsetTop;
    const height = sec.offsetHeight;
    const id = sec.getAttribute("id");
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;

    if (scrollY >= top && scrollY < top + height) {
      links.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");
    }
  });
}

/* ============ REVEAL ON SCROLL ============ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

document
  .querySelectorAll(".reveal")
  .forEach((el) => revealObserver.observe(el));

/* ============ SCROLL TO TOP ============ */
if (scrollTopBtn) {
  scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ============ SCROLL DOWN BUTTON ============ */
if (scrollDownBtn) {
  scrollDownBtn.addEventListener("click", () => {
    const nextSection = document.getElementById("about");
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
    }
  });
}

/* ============ FOOTER YEAR ============ */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
