(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var scroller = document.querySelector(".pricing-grid");
  var dots = Array.prototype.slice.call(document.querySelectorAll(".plan-dot"));
  if (!scroller || !dots.length) return;

  function cards() {
    return Array.prototype.slice.call(scroller.querySelectorAll(".card")).sort(function (a, b) {
      return a.getBoundingClientRect().left - b.getBoundingClientRect().left;
    });
  }

  function activeIndex() {
    var origin = scroller.getBoundingClientRect().left;
    var index = 0;
    var best = Infinity;
    cards().forEach(function (card, i) {
      var distance = Math.abs(card.getBoundingClientRect().left - origin);
      if (distance < best) {
        best = distance;
        index = i;
      }
    });
    return index;
  }

  function update() {
    var index = activeIndex();
    dots.forEach(function (dot, i) {
      var on = i === index;
      dot.classList.toggle("is-active", on);
      if (on) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  }

  scroller.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      var card = cards()[i];
      if (!card) return;
      scroller.scrollTo({
        left: scroller.scrollLeft + (card.getBoundingClientRect().left - scroller.getBoundingClientRect().left),
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    });
  });
  update();
})();

(function () {
  var dialog = document.getElementById("order");
  var form = document.getElementById("order-form");
  if (!dialog || !form) return;

  var step = 1;
  var checkout = "";
  var timer = 0;
  var panels = Array.prototype.slice.call(form.querySelectorAll(".order-panel"));
  var marks = Array.prototype.slice.call(form.querySelectorAll(".order-progress li"));
  var back = form.querySelector("[data-back]");
  var next = form.querySelector("[data-next]");
  var error = form.querySelector(".order-error");
  var loading = form.querySelector(".order-loading");

  function show(nextStep, direction) {
    step = nextStep;
    dialog.classList.toggle("is-back", direction < 0);
    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", Number(panel.getAttribute("data-step")) === step);
    });
    marks.forEach(function (mark, index) {
      mark.classList.toggle("is-current", index === step - 1);
      mark.classList.toggle("is-done", index < step - 1);
    });
    back.hidden = step === 1;
    next.textContent = step === 4 ? "Continue to payment" : "Continue";
    error.textContent = "";
  }

  function selected(name) {
    var field = form.querySelector('input[name="' + name + '"]:checked');
    return field ? field.value : "";
  }

  function checkoutFor(size) {
    var card = document.querySelector('.card[data-balance="' + size + '"] .cta');
    return card ? card.getAttribute("data-checkout") : "";
  }

  function valid() {
    if (step === 1) return true;
    if (step === 2) {
      if (selected("size")) return true;
      error.textContent = "Select an account size.";
      return false;
    }
    if (step === 3) {
      if (selected("platform")) return true;
      error.textContent = "Select MetaTrader 4 or MetaTrader 5.";
      return false;
    }
    var required = ["first", "last", "email", "phone", "country"];
    for (var i = 0; i < required.length; i += 1) {
      var input = form.elements[required[i]];
      if (!input.value.trim() || !input.checkValidity()) {
        error.textContent = "Fill in every required field.";
        input.reportValidity();
        return false;
      }
    }
    if (!form.elements.agree.checked) {
      error.textContent = "Agree to the terms to continue.";
      return false;
    }
    return true;
  }

  document.querySelectorAll(".cta[data-checkout]").forEach(function (button) {
    button.addEventListener("click", function () {
      var card = button.closest(".card");
      var size = card ? card.getAttribute("data-balance") : "";
      checkout = button.getAttribute("data-checkout") || "";
      form.reset();
      form.elements.challenge.checked = true;
      if (size) {
        var sizeField = form.querySelector('input[name="size"][value="' + size + '"]');
        if (sizeField) sizeField.checked = true;
      }
      loading.hidden = true;
      show(1, 1);
      if (typeof dialog.showModal === "function") dialog.showModal();
    });
  });

  next.addEventListener("click", function () {
    if (!valid()) return;
    if (step < 4) {
      show(step + 1, 1);
      return;
    }
    var size = selected("size");
    checkout = checkoutFor(size) || checkout;
    if (!checkout) {
      error.textContent = "This account size is not ready for checkout.";
      return;
    }
    loading.hidden = false;
    window.clearTimeout(timer);
    timer = window.setTimeout(function () {
      window.location.href = checkout;
    }, 1400);
  });

  back.addEventListener("click", function () {
    if (step > 1) show(step - 1, -1);
  });

  form.querySelector("[data-close]").addEventListener("click", function () {
    window.clearTimeout(timer);
    loading.hidden = true;
    dialog.close();
  });

  dialog.addEventListener("close", function () {
    window.clearTimeout(timer);
    loading.hidden = true;
  });
})();

(function () {
  var track = document.querySelector(".reviews-track");
  if (!track) return;
  var prev = document.querySelector("[data-reviews-prev]");
  var next = document.querySelector("[data-reviews-next]");

  function distance() {
    var card = track.querySelector(".review");
    if (!card) return track.clientWidth;
    var styles = getComputedStyle(track);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  function move(direction) {
    track.scrollBy({
      left: distance() * direction,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }

  if (prev) prev.addEventListener("click", function () { move(-1); });
  if (next) next.addEventListener("click", function () { move(1); });
})();
