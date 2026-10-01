(function () {
  "use strict";

  /* ---------------------------------------------------------------------
     Smooth redirect to TeePublic
     Every product card and banner CTA with [data-teepublic-url] gets
     intercepted: show a brief toast, then send the visitor to TeePublic.

     By default this redirects in the SAME TAB, which is what "smoothly
     redirected to TeePublic to purchase" usually means. If you'd rather
     keep your own site open and send the purchase to a NEW TAB instead,
     change REDIRECT_IN_NEW_TAB to true below.
  --------------------------------------------------------------------- */
  var REDIRECT_IN_NEW_TAB = false;
  var REDIRECT_DELAY_MS = 550;

  var toast = document.getElementById("redirectToast");
  var productLinks = document.querySelectorAll("[data-teepublic-url]");

  productLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var url = link.getAttribute("data-teepublic-url");

      if (!url || url.indexOf("REPLACE-WITH-YOUR") !== -1) {
        console.warn("Store: this product's TeePublic URL hasn't been set yet.", link);
        return;
      }

      if (toast) toast.classList.add("is-visible");

      setTimeout(function () {
        if (REDIRECT_IN_NEW_TAB) {
          window.open(url, "_blank", "noopener");
          if (toast) toast.classList.remove("is-visible");
        } else {
          window.location.href = url;
        }
      }, REDIRECT_DELAY_MS);
    });
  });
})();