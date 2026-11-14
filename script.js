/* ============================================================
   JOEVER L. SAYSON — PORTFOLIO SCRIPT (UPDATED & OPTIMIZED)
   ============================================================ */

(function () {
  "use strict";

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

    function setActiveLink(page) {
      document.querySelectorAll(".nav-link").forEach((link) => {
        const target = link.getAttribute("data-frame-link");
        const isActive = target === page;
        link.classList.toggle("active", isActive);
        if (isActive) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    }

    function loadPage(page, pushState = true) {
      if (!page) return;

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

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const page = link.getAttribute("data-frame-link");
        loadPage(page);
      });
    });

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

    window.addEventListener("popstate", (e) => {
      const page = (e.state && e.state.page) || "home.html";
      loadPage(page, false);
    });

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
          "certificates",
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

    if (cursorGlow) {
      let mouseX = 0,
        mouseY = 0,
        glowX = 0,
        glowY = 0;
      document.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      function animateGlow() {
        glowX += (mouseX - glowX) * 0.12;
        glowY += (mouseY - glowY) * 0.12;
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
        requestAnimationFrame(animateGlow);
      }
      animateGlow();

      if ("ontouchstart" in window) cursorGlow.style.display = "none";
    }

    return;
  }

  /* ============================================================
                       FRAME PAGE LOGIC
                       ============================================================ */

  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type: "frame-ready" }, "*");
    const currentPath =
      window.location.pathname.split("/").pop() || "home.html";
    window.parent.postMessage({ type: "page-loaded", page: currentPath }, "*");
  }

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

  const typedEl = document.getElementById("typed");
  if (typedEl) {
    const roles = [
      "AI & Machine Learning Developer",
      "Full-Stack Web Developer",
      "Mobile App Developer",
      "QA Evaluator",
      "Hardware-Software Integrator",
    ];
    let roleIndex = 0,
      charIndex = 0,
      isDeleting = false;
    const typeSpeed = 70,
      deleteSpeed = 40,
      pauseEnd = 1800;

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
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      typedEl.textContent = roles[0];
    } else {
      typeLoop();
    }
  }

  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("active"));
  }

  // OPTIMIZED TILT EFFECT
  const tiltEls = document.querySelectorAll(".tilt");
  if (tiltEls.length && window.matchMedia("(hover: hover)").matches) {
    tiltEls.forEach((el) => {
      let rafId;
      el.addEventListener("mousemove", (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -3;
          const rotateY = ((x - centerX) / centerX) * 3;
          el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        });
      });

      el.addEventListener("mouseleave", () => {
        if (rafId) cancelAnimationFrame(rafId);
        el.style.transform = "";
      });
    });
  }

  // CERTIFICATES PAGE LOGIC (Lightbox & Filters)
  const certLightbox = document.getElementById("certLightbox");
  if (certLightbox) {
    const lightboxImg = certLightbox.querySelector(".lightbox-image");
    const closeBtn = certLightbox.querySelector(".lightbox-close");

    document.querySelectorAll(".cert-zoom-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const img = btn.closest(".cert-card").querySelector(".cert-image");
        if (!img) return;
        lightboxImg.src = img.src;
        certLightbox.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    function closeLightbox() {
      certLightbox.classList.remove("active");
      document.body.style.overflow = "";
      setTimeout(() => {
        lightboxImg.src = "";
      }, 300);
    }

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    certLightbox.addEventListener("click", (e) => {
      if (e.target === certLightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && certLightbox.classList.contains("active"))
        closeLightbox();
    });

    // Filters
    const filters = document.querySelectorAll(".cert-filter");
    const cards = document.querySelectorAll(".cert-card");

    filters.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.getAttribute("data-filter");
        filters.forEach((f) => f.classList.remove("active"));
        btn.classList.add("active");

        cards.forEach((card) => {
          const category = card.getAttribute("data-category");
          const show = filter === "all" || category === filter;

          if (show) {
            card.style.display = "flex";
            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "scale(1)";
            }, 10);
          } else {
            card.style.opacity = "0";
            card.style.transform = "scale(0.95)";
            setTimeout(() => {
              card.style.display = "none";
            }, 300);
          }
        });
      });
    });
  }

  // Hero pointer spotlight (moves the light + revealed grid)
  const heroEl = document.querySelector(".hero");
  if (
    heroEl &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    let ticking = false,
      px = 0,
      py = 0;
    heroEl.addEventListener(
      "pointermove",
      (e) => {
        const r = heroEl.getBoundingClientRect();
        px = e.clientX - r.left;
        py = e.clientY - r.top;
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          heroEl.style.setProperty("--mx", px + "px");
          heroEl.style.setProperty("--my", py + "px");
          ticking = false;
        });
      },
      { passive: true },
    );
  }

  // Hero Canvas
  const canvas = document.getElementById("hero-canvas");
  if (
    canvas &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const ctx = canvas.getContext("2d");
    let width = 0,
      height = 0,
      particles = [],
      rafId = null;
    const isMobile = window.innerWidth < 768;
    const PARTICLE_COUNT = isMobile ? 28 : 60;
    const MAX_DISTANCE = isMobile ? 110 : 140;

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
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r = Math.random() * 1.5 + 0.8;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }
    }

    function init() {
      resize();
      particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);
      const primaryColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--primary")
          .trim() || "#06b6d4";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < MAX_DISTANCE) {
            ctx.beginPath();
            ctx.strokeStyle = primaryColor;
            ctx.globalAlpha = (1 - dist / MAX_DISTANCE) * 0.35;
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

    init();
    animate();

    window.addEventListener("resize", () => {
      cancelAnimationFrame(rafId);
      init();
      animate();
    });
  }
})();
