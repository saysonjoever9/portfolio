/* ============================================================
   JOEVER L. SAYSON — PORTFOLIO SCRIPT
   Handles: sidebar iframe navigation, theme toggle, mobile menu,
            typing effect, reveal animations, cursor glow, tilt,
            3D particle network animation.
   ============================================================ */

(function () {
  "use strict";

  /* ---------- Detect if we're the SHELL (index.html) or a FRAME PAGE ---------- */
  const IS_SHELL = !!document.getElementById("content-frame");

  /* ============================================================
                   SHELL LOGIC (index.html)
                   ============================================================ */
  if (IS_SHELL) {
    const frame = document.getElementById("content-frame");
    const navLinks = document.querySelectorAll("[data-frame-link]");
    const sidebar = document.getElementById("sidebar");
    const navOverlay = document.getElementById("navOverlay");
    const menuToggle = document.getElementById("menuToggle");
    const mobileClose = document.getElementById("mobileClose");
    const themeToggle = document.getElementById("themeToggle");
    const themeToggleMobile = document.getElementById("themeToggleMobile");
    const cursorGlow = document.getElementById("cursorGlow");

    /* ---- Track current page for active nav ---- */
    let currentPage = "home.html";

    function setActiveLink(page) {
      document.querySelectorAll(".nav-link").forEach((link) => {
        const target = link.getAttribute("data-frame-link");
        const isActive = target === page;
        link.classList.toggle("active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    /* ---- Load a page inside iframe ---- */
    function loadPage(page, pushState = true) {
      if (!page) return;
      currentPage = page;

      frame.style.opacity = "0";
      frame.style.transition = "opacity 0.25s ease";

      setTimeout(() => {
        frame.src = page;
        if (pushState) {
          history.pushState({ page }, "", "#" + page.replace(".html", ""));
        }
      }, 180);

      frame.addEventListener("load", function onLoad() {
        frame.style.opacity = "1";
        frame.removeEventListener("load", onLoad);
      });

      setActiveLink(page);
      closeMobileMenu();
    }

    /* ---- Nav link clicks ---- */
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.getAttribute("data-frame-link");
        loadPage(page);
      });
    });

    /* ---- Listen to messages from iframe pages ---- */
    window.addEventListener("message", (event) => {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "navigate" && data.page) {
        loadPage(data.page);
      }

      if (data.type === "theme-change" && data.theme) {
        applyTheme(data.theme, false);
      }

      if (data.type === "frame-ready") {
        const theme =
          document.documentElement.getAttribute("data-theme") || "dark";
        frame.contentWindow.postMessage({ type: "theme-sync", theme }, "*");
      }

      if (data.type === "page-loaded" && data.page) {
        setActiveLink(data.page);
      }
    });

    /* ---- Theme toggle ---- */
    function applyTheme(theme, broadcast = true) {
      if (theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      localStorage.setItem("theme", theme);

      const isLight = theme === "light";
      const iconClass = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
      const textLabel = isLight ? "Light Mode" : "Dark Mode";

      document.querySelectorAll(".theme-toggle i").forEach((icon) => {
        icon.className = iconClass;
      });

      const sidebarText = document.querySelector(
        ".sidebar-bottom .theme-toggle span",
      );
      if (sidebarText) sidebarText.textContent = textLabel;

      if (broadcast && frame.contentWindow) {
        frame.contentWindow.postMessage({ type: "theme-sync", theme }, "*");
      }
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);

      document.querySelectorAll(".theme-toggle").forEach((btn) => {
        btn.classList.add("rotating");
        setTimeout(() => btn.classList.remove("rotating"), 500);
      });
    }

    if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
    if (themeToggleMobile)
      themeToggleMobile.addEventListener("click", toggleTheme);

    /* ---- Initialize theme icons on load ---- */
    (function initTheme() {
      const isLight =
        document.documentElement.getAttribute("data-theme") === "light";
      const iconClass = isLight ? "fa-solid fa-sun" : "fa-solid fa-moon";
      const textLabel = isLight ? "Light Mode" : "Dark Mode";

      document.querySelectorAll(".theme-toggle i").forEach((icon) => {
        icon.className = iconClass;
      });

      const sidebarText = document.querySelector(
        ".sidebar-bottom .theme-toggle span",
      );
      if (sidebarText) sidebarText.textContent = textLabel;
    })();

    /* ---- Mobile sidebar ---- */
    function openMobileMenu() {
      if (sidebar) sidebar.classList.add("open");
      if (navOverlay) navOverlay.classList.add("active");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    }

    function closeMobileMenu() {
      if (sidebar) sidebar.classList.remove("open");
      if (navOverlay) navOverlay.classList.remove("active");
      if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }

    if (menuToggle) menuToggle.addEventListener("click", openMobileMenu);
    if (mobileClose) mobileClose.addEventListener("click", closeMobileMenu);
    if (navOverlay) navOverlay.addEventListener("click", closeMobileMenu);

    /* ---- Browser back/forward ---- */
    window.addEventListener("popstate", (e) => {
      const page = (e.state && e.state.page) || "home.html";
      loadPage(page, false);
    });

    /* ---- Init from hash ---- */
    (function initFromHash() {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const page = hash + ".html";
        const validPages = [
          "home",
          "about",
          "experience",
          "skills",
          "projects",
          "research",
          "qa",
          "approach",
          "contact",
        ];
        if (validPages.includes(hash)) {
          loadPage(page, false);
          return;
        }
      }
      setActiveLink("home.html");
    })();

    /* ---- Cursor glow ---- */
    if (cursorGlow) {
      let mouseX = 0,
        mouseY = 0;
      let glowX = 0,
        glowY = 0;

      document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function animateGlow() {
        glowX += (mouseX - glowX) * 0.12;
        glowY += (mouseY - glowY) * 0.12;
        cursorGlow.style.left = glowX + "px";
        cursorGlow.style.top = glowY + "px";
        requestAnimationFrame(animateGlow);
      }
      animateGlow();

      if ("ontouchstart" in window) {
        cursorGlow.style.display = "none";
      }
    }

    return; // stop here for shell
  }

  /* ============================================================
                   FRAME PAGE LOGIC (home.html, about.html, etc.)
                   ============================================================ */

  /* ---- Notify parent that frame is ready ---- */
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "frame-ready" }, "*");

    const currentPath =
      window.location.pathname.split("/").pop() || "home.html";
    window.parent.postMessage({ type: "page-loaded", page: currentPath }, "*");
  }

  /* ---- Listen for theme sync from parent ---- */
  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "theme-sync" && data.theme) {
      if (data.theme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.removeAttribute("data-theme");
      }
      localStorage.setItem("theme", data.theme);
    }
  });

  /* ---- Intercept internal links -> tell parent to navigate ---- */
  document.querySelectorAll("[data-frame-link]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-frame-link");
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "navigate", page }, "*");
      } else {
        window.location.href = page;
      }
    });
  });

  /* ---- Also intercept any .html links ---- */
  document.querySelectorAll('a[href$=".html"]').forEach((link) => {
    if (link.hasAttribute("data-frame-link")) return;
    link.addEventListener("click", (e) => {
      if (link.target === "_blank") return;
      e.preventDefault();
      const page = link.getAttribute("href");
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "navigate", page }, "*");
      } else {
        window.location.href = page;
      }
    });
  });

  /* ---- Typing effect (hero page only) ---- */
  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const roles = [
      "AI & Machine Learning Developer",
      "Full-Stack Web Developer",
      "Mobile App Developer",
      "QA Evaluator",
      "Hardware-Software Integrator",
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typeSpeed = 70;
    const deleteSpeed = 40;
    const pauseEnd = 1800;

    function typeLoop() {
      const current = roles[roleIndex];
      if (!isDeleting) {
        typedEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(typeLoop, pauseEnd);
          return;
        }
        setTimeout(typeLoop, typeSpeed);
      } else {
        typedEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(typeLoop, 400);
          return;
        }
        setTimeout(typeLoop, deleteSpeed);
      }
    }
    typeLoop();
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("active");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -40px 0px",
        },
      );
      revealEls.forEach((el) => observer.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add("active"));
    }
  }

  /* ---- Tilt effect (Generic for .tilt elements) ---- */
  const tiltEls = document.querySelectorAll(".tilt");
  if (tiltEls.length && window.matchMedia("(hover: hover)").matches) {
    tiltEls.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
      });
    });
  }

  /* ---- Fade-in on first load + 3D hero tilt ---- */
  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".reveal-fade").forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
      el.style.transition = "opacity 0.7s ease, transform 0.7s ease";
      setTimeout(
        () => {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
        },
        100 + i * 120,
      );
    });

    const heroContent = document.querySelector(".hero-content");
    const heroCard = document.getElementById("heroCard");

    if (
      heroContent &&
      heroCard &&
      window.matchMedia("(hover: hover)").matches
    ) {
      heroContent.addEventListener("mousemove", (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 30;

        heroCard.style.animation = "none";
        heroCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      heroContent.addEventListener("mouseleave", () => {
        heroCard.style.transform = "";
        heroCard.style.animation = "floatImage 6s ease-in-out infinite";
      });
    }
  });

  /* ============================================================
       3D ANIMATED PARTICLE NETWORK (Hero Background)
       ============================================================ */
  const canvas = document.getElementById("hero-canvas");

  if (
    canvas &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const ctx = canvas.getContext("2d");
    let width = 0,
      height = 0;
    let particles = [];
    let rafId = null;

    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 28 : 70;
    const MAX_DISTANCE = isMobile ? 110 : 150;
    const SPEED = 0.45;

    function getPrimaryColor() {
      return (
        getComputedStyle(document.documentElement)
          .getPropertyValue("--primary")
          .trim() || "#06b6d4"
      );
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * SPEED;
        this.vy = (Math.random() - 0.5) * SPEED;
        this.r = Math.random() * 1.6 + 0.8;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
      draw(color) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      const color = getPrimaryColor();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        p.draw(color);

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.hypot(dx, dy);

          if (dist < MAX_DISTANCE) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = (1 - dist / MAX_DISTANCE) * 0.45;
            ctx.lineWidth = 0.8;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(animate);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafId);
        init();
        animate();
      }, 200);
    });

    init();
    animate();

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        animate();
      }
    });
  }
})();
