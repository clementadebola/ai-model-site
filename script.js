(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Google Sheet endpoint
     Paste the "Web app URL" you get from Apps Script > Deploy here.
  --------------------------------------------------------------------- */
  var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbzdfDwjJ5PevrzDJOQt5PETp4GG2g-dNhx2KYx9YfNQYYS2n1R4TY1QYfF_24w7EgN09A/exec";

  async function submitEmail(email, source) {
    if (!SHEET_ENDPOINT || SHEET_ENDPOINT.indexOf("PASTE_YOUR") === 0) {
      console.warn("Subscribe form: SHEET_ENDPOINT is not set yet in script.js — nothing was sent.");
      return Promise.resolve();
    }
    console.log("Subscribe form: sending", email, "to sheet endpoint...");
    try {
          await fetch(SHEET_ENDPOINT, {
              method: "POST",
              mode: "no-cors", // Apps Script web apps don't return CORS headers; response can't be read, but the write still happens
              headers: { "Content-Type": "text/plain" }, // avoids a CORS preflight
              body: JSON.stringify({ email: email, source: source })
          });
          // With mode: "no-cors" the response is always opaque, so this only
          // confirms the request went out, not that the sheet accepted it.
          console.log("Subscribe form: request sent (check the sheet, or Apps Script > Executions, to confirm it landed).");
      } catch (err) {
          console.error("Subscribe form: request failed to send.", err);
      }
  }

  // Dev helper: run resetFGSubscribeState() in the browser console to make
  // the popup eligible to show again while you're testing.
  window.resetFGSubscribeState = function () {
    try {
      localStorage.removeItem("fg_popup_state");
      console.log("Popup state cleared. Reload the page to see it again.");
    } catch (e) {
      console.warn("Could not access localStorage.", e);
    }
  };

  /* ---------------------------------------------------------------------
     Header state on scroll + progress bar
  --------------------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  var progressBar = document.getElementById("progressBar");

  function onScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", scrollY > 40);

    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");

  navToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  mainNav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      mainNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ---------------------------------------------------------------------
     Scroll reveal (IntersectionObserver)
  --------------------------------------------------------------------- */
  var revealTargets = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------------------------------------------------------------------
     Subscribe popup
  --------------------------------------------------------------------- */
  var overlay = document.getElementById("popupOverlay");
  var closeBtn = document.getElementById("popupClose");
  var dismissBtn = document.getElementById("popupDismiss");
  var popupForm = document.getElementById("popupForm");
  var popupEmail = document.getElementById("popupEmail");
  var popupSuccess = document.getElementById("popupSuccess");

  var STORAGE_KEY = "fg_popup_state";

  function getPopupState() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }
  function setPopupState(value) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {
      /* storage unavailable, ignore */
    }
  }

  function openPopup() {
    if (getPopupState()) return;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    setTimeout(function () { popupEmail.focus(); }, 350);
  }
  function closePopup(remember) {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    if (remember) setPopupState("dismissed");
  }

  closeBtn.addEventListener("click", function () { closePopup(true); });
  dismissBtn.addEventListener("click", function () { closePopup(true); });
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closePopup(true);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("is-open")) closePopup(true);
  });

  popupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!popupEmail.value) return;
    submitEmail(popupEmail.value, "popup");
    popupForm.setAttribute("hidden", "");
    popupSuccess.removeAttribute("hidden");
    setPopupState("subscribed");
    setTimeout(function () { closePopup(false); }, 2200);
  });

  // Trigger: after a short delay, or once the visitor scrolls a bit — whichever comes first.
  var popupTimer = setTimeout(openPopup, 12000);
  var popupScrollTriggered = false;
  window.addEventListener(
    "scroll",
    function () {
      if (popupScrollTriggered) return;
      var scrollPct =
        (window.scrollY) / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrollPct > 0.55) {
        popupScrollTriggered = true;
        clearTimeout(popupTimer);
        openPopup();
      }
    },
    { passive: true }
  );

  /* ---------------------------------------------------------------------
     Inline newsletter form (community section)
  --------------------------------------------------------------------- */
  var inlineForm = document.getElementById("inlineForm");
  var inlineNote = document.getElementById("inlineNote");

  inlineForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("inlineEmail");
    if (!input.value) return;
    submitEmail(input.value, "inline");
    inlineNote.textContent = "You're in. Check your inbox for the guide.";
    input.value = "";
    setPopupState("subscribed");
  });
})();