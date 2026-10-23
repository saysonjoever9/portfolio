/* ============================================================
   JOEVER L. SAYSON — PORTFOLIO v2 (Vanilla JS)
   ============================================================ */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isFinePointer = window.matchMedia(
    "(hover: hover) and (pointer: fine)",
  ).matches;

  /* ============================================================
       1. SPLIT TEXT
       ============================================================ */
  function initSplitText() {
    const el = document.querySelector(".split-text");
    if (!el) return;
    const text = el.dataset.text || el.textContent;
    el.textContent = "";
    Array.from(text).forEach((ch, i) => {
      const span = document.createElement("span");
      span.className = "letter";
      span.textContent = ch === " " ? "\u00A0" : ch;
      span.style.animationDelay = `${0.2 + i * 0.03}s`;
      el.appendChild(span);
    });
  }

  /* ============================================================
       2. TYPEWRITER
       ============================================================ */
  function initTypewriter() {
    const typedEl = document.getElementById("typed");
    if (!typedEl) return;

    const roles = [
      "AI & Machine Learning Developer",
      "Full-Stack Web Developer",
      "Mobile App Developer",
      "Hardware–Software Integrator",
      "Computer Engineering Graduate",
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId;

    const tick = () => {
      const current = roles[roleIndex];

      if (!deleting) {
        typedEl.textContent = current.slice(0, ++charIndex);
        if (charIndex === current.length) {
          deleting = true;
          timeoutId = setTimeout(tick, 1600);
          return;
        }
      } else {
        typedEl.textContent = current.slice(0, --charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
        }
      }
      timeoutId = setTimeout(tick, deleting ? 40 : 90);
    };

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) clearTimeout(timeoutId);
      else tick();
    });

    tick();
  }

  /* ============================================================
       3. THEME
       ============================================================ */
  function initTheme() {
    const toggle = document.getElementById("themeToggle");
    const icon = toggle ? toggle.querySelector("i") : null;
    const root = document.documentElement;

    const syncIcon = () => {
      if (!icon) return;
      const isLight = root.getAttribute("data-theme") === "light";
      icon.classList.toggle("fa-moon", !isLight);
      icon.classList.toggle("fa-sun", isLight);
    };

    syncIcon();

    if (toggle) {
      toggle.addEventListener("click", () => {
        const isLight = root.getAttribute("data-theme") === "light";
        const next = isLight ? "dark" : "light";
        toggle.classList.add("rotating");

        setTimeout(() => {
          if (next === "light") root.setAttribute("data-theme", "light");
          else root.removeAttribute("data-theme");
          localStorage.setItem("theme", next);
          syncIcon();
          toggle.classList.remove("rotating");
        }, 200);
      });
    }

    window
      .matchMedia("(prefers-color-scheme: light)")
      .addEventListener("change", (e) => {
        if (localStorage.getItem("theme")) return;
        if (e.matches) root.setAttribute("data-theme", "light");
        else root.removeAttribute("data-theme");
        syncIcon();
      });
  }

  /* ============================================================
       4. NAV
       ============================================================ */
  function initNav() {
    const navbar = document.getElementById("navbar");
    const progress = document.getElementById("scrollProgress");
    const sections = document.querySelectorAll("section[id]");
    const links = document.querySelectorAll(".nav-link");

    let ticking = false;

    const update = () => {
      const y = window.scrollY;

      if (navbar) navbar.classList.toggle("scrolled", y > 40);

      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (y / max) * 100 : 0;
        progress.style.width = `${pct}%`;
      }

      const scrollPos = y + 120;
      sections.forEach((sec) => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        const id = sec.getAttribute("id");
        const link = document.querySelector(`.nav-link[href="#${id}"]`);
        if (!link) return;
        if (scrollPos >= top && scrollPos < top + height) {
          links.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        }
      });

      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true },
    );

    update();
  }

  /* ============================================================
       5. MOBILE MENU
       ============================================================ */
  function initMenu() {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");
    const navClose = document.getElementById("navClose");
    const navOverlay = document.getElementById("navOverlay");

    if (!menuToggle || !navLinks) return;

    const icon = menuToggle.querySelector("i");

    const open = () => {
      navLinks.classList.add("open");
      if (navOverlay) navOverlay.classList.add("active");
      menuToggle.setAttribute("aria-expanded", "true");
      if (icon) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-xmark");
      }
      document.body.classList.add("no-scroll");
    };

    const close = () => {
      navLinks.classList.remove("open");
      if (navOverlay) navOverlay.classList.remove("active");
      menuToggle.setAttribute("aria-expanded", "false");
      if (icon) {
        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");
      }
      document.body.classList.remove("no-scroll");
    };

    const toggle = () => {
      if (navLinks.classList.contains("open")) close();
      else open();
    };

    menuToggle.addEventListener("click", toggle);
    if (navClose) navClose.addEventListener("click", close);
    if (navOverlay) navOverlay.addEventListener("click", close);

    document.querySelectorAll(".nav-link").forEach((l) => {
      l.addEventListener("click", close);
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("open")) close();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 968 && navLinks.classList.contains("open"))
        close();
    });
  }

  /* ============================================================
       6. REVEAL ON SCROLL
       ============================================================ */
  function initReveal() {
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (prefersReducedMotion) {
      els.forEach((el) => el.classList.add("active"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    els.forEach((el) => observer.observe(el));
  }

  /* ============================================================
       7. 3D TILT
       ============================================================ */
  function initTilt() {
    if (!isFinePointer || prefersReducedMotion) return;

    const cards = document.querySelectorAll(".tilt");
    const MAX = 6;

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-y * MAX}deg) rotateY(${x * MAX}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ============================================================
       8. CURSOR GLOW
       ============================================================ */
  function initCursorGlow() {
    const glow = document.getElementById("cursorGlow");
    if (!glow || !isFinePointer || prefersReducedMotion) return;

    let raf = null;
    let mx = 0;
    let my = 0;

    window.addEventListener(
      "mousemove",
      (e) => {
        mx = e.clientX;
        my = e.clientY;
        if (!raf) {
          raf = requestAnimationFrame(() => {
            glow.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
            raf = null;
          });
        }
      },
      { passive: true },
    );
  }

  /* ============================================================
       9. SCROLL BUTTONS
       ============================================================ */
  function initScrollButtons() {
    const top = document.getElementById("scrollTop");
    const down = document.getElementById("scrollDown");

    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (top) top.classList.toggle("visible", y > 400);
        if (down) down.classList.toggle("visible", y < 200);
      },
      { passive: true },
    );

    if (top) {
      top.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    if (down) {
      down.addEventListener("click", () => {
        const next = document.getElementById("about");
        if (next) next.scrollIntoView({ behavior: "smooth" });
        else
          window.scrollBy({
            top: window.innerHeight * 0.9,
            behavior: "smooth",
          });
      });
    }
  }

  /* ============================================================
       10. FOOTER YEAR
       ============================================================ */
  function initYear() {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ============================================================
       BOOT
       ============================================================ */
  const boot = () => {
    initSplitText();
    initTypewriter();
    initTheme();
    initNav();
    initMenu();
    initReveal();
    initTilt();
    initCursorGlow();
    initScrollButtons();
    initYear();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
