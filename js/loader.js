// Intro loader: the emblem draws itself, the name appears, then the curtain lifts.
// Shown once per browser session. Plain JS + CSS, so it does not depend on GSAP.
(function () {
  const root = document.documentElement,
    el = document.getElementById("loader");
  if (!el) return;
  if (!root.classList.contains("has-loader")) {
    el.remove();
    return;
  }
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches,
    MIN = RM ? 500 : 1900, // shortest time the loader stays up (ms)
    MAX = 6000, // never block the site longer than this
    t0 = performance.now();
  let done = false;
  function finish() {
    if (done) return;
    done = true;
    el.classList.add("ld-out");
    setTimeout(
      () => {
        root.classList.remove("has-loader");
        el.remove();
        try {
          sessionStorage.setItem("olt_loaded", "1");
        } catch (e) {}
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      },
      RM ? 0 : 1000
    );
  }
  function ready() {
    setTimeout(finish, Math.max(0, MIN - (performance.now() - t0)));
  }
  if (document.readyState === "complete") ready();
  else addEventListener("load", ready);
  setTimeout(finish, MAX);
})();
