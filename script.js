/* ============================================================
   JOEVER L. SAYSON — PORTFOLIO SCRIPT
   Handles: sidebar iframe navigation, theme toggle, mobile menu,
            typing effect, reveal animations, cursor glow, tilt.
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
        link.classList.toggle("active", target === page);
      });
    }

    /* ---- Load a page inside iframe ---- */
    function loadPage(page, pushState = true) {
      if (!page) return;
      currentPage = page;

      // Fade effect
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
        // Sync theme into iframe
        const theme =
          document.documentElement.getAttribute("data-theme") || "dark";
        frame.contentWindow.postMessage({ type: "theme-sync", theme }, "*");
      }

      // Update sidebar active state if user clicked a link inside the iframe
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

      // Update icons and text dynamically
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

      // Broadcast to iframe
      if (broadcast && frame.contentWindow) {
        frame.contentWindow.postMessage({ type: "theme-sync", theme }, "*");
      }
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "light" ? "dark" : "light";
      applyTheme(next);

      // Spin animation
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

    // Tell parent which page just loaded so sidebar can highlight correctly
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

  /* ---- Fade-in on first load (hero) ---- */
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

    /* ============================================================
           3D PARALLAX TILT EFFECT (Hero Image)
           ============================================================ */
    const heroContent = document.querySelector(".hero-content");
    const heroCard = document.querySelector(".hero-image-card");

    // Only run if elements exist and device supports hover (desktop)
    if (
      heroContent &&
      heroCard &&
      window.matchMedia("(hover: hover)").matches
    ) {
      // We apply the 3D rotation to the heroCard when moving mouse over heroContent
      heroContent.addEventListener("mousemove", (e) => {
        // Calculate mouse position relative to the center of the container
        const xAxis = (window.innerWidth / 2 - e.pageX) / 30;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 30;

        // Override the floating animation temporarily with the 3D tilt
        heroCard.style.animation = "none";
        heroCard.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      // Reset when mouse leaves
      heroContent.addEventListener("mouseleave", () => {
        heroCard.style.transform = "";
        // Re-apply the CSS animation for floating
        heroCard.style.animation = "floatImage 6s ease-in-out infinite";
      });
    }
  });
})();
