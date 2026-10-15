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
