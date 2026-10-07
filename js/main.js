(function () {
  const D = window.OLT,
    $ = (id) => document.getElementById(id);
  // ---- build content from data.js ----
  $("stats").innerHTML = D.stats
    .map(
      (s) =>
        `<div><b data-to="${s[0]}" data-suf="${s[1]}">${s[0].toLocaleString()}${
          s[1]
        }</b><span>${s[2]}</span></div>`
    )
    .join("");
  {
    const A = D.about,
      P = (ps) =>
        ps
          .map((p) => `<p${p.length < 70 ? ' class="em"' : ""}>${p}</p>`)
          .join("");
    $("storyT").textContent = A.story.title;
    $("storyQ").textContent = A.story.quote;
    $("storyB").innerHTML = P(A.story.paras);
    $("goalT").textContent = A.goal.title;
    $("goalL").innerHTML = A.goal.lead.map((l) => `<p>${l}</p>`).join("");
    $("goalB").innerHTML = P(A.goal.paras);
    $("aboutTag").textContent = A.tag;
  }
  {
    const set = D.countries.map((c) => `<span>${c.n}</span><i>◆</i>`).join("");
    const mq = document.createElement("section");
    mq.className = "mq";
    mq.setAttribute("aria-hidden", "true");
    mq.innerHTML = `<div class="mq-in"><div class="mq-set">${set}</div><div class="mq-set dup">${set}</div></div>`;
    $("about").before(mq);
  }
  $("track").innerHTML = D.countries
    .map(
      (c) =>
        `<article class="cty">${
          c.img
            ? `<img class="cty-img" src="${
                c.img
              }" alt="" style="position:static;display:block;flex:none;width:100%;height:190px;object-fit:cover;object-position:${
                c.pos || "center"
              }">`
            : `<div class="cty-img ph" style="position:static;display:block;flex:none;width:100%;height:190px;object-fit:cover;background:#3a3a3a"></div>`
        }<div class="cty-b"><div><h3>${c.n}</h3><p>${
          c.note
        }</p></div><dl><dt>Typical IELTS</dt><dd>${
          c.ielts
        }</dd><dt>Intakes</dt><dd>${c.intake}</dd></dl></div></article>`
    )
    .join("");
  $("track")
    .querySelectorAll("img.cty-img")
    .forEach(
      (i) =>
        (i.onerror = () => {
          const p = document.createElement("div");
          p.className = "cty-img ph";
          p.style.cssText =
            "position:static;display:block;flex:none;width:100%;height:190px;object-fit:cover;background:#3a3a3a";
          i.replaceWith(p);
        })
    );
  $("whyList").innerHTML = D.why
    .map((w) => `<div class="wrow"><h3>${w[0]}</h3><p>${w[1]}</p></div>`)
    .join("");
  $("steps").innerHTML =
    '<span class="fill"></span>' +
    D.steps.map((s) => `<li>${s[0]}<small>${s[1]}</small></li>`).join("");
  $("sgrid").innerHTML = D.stories
    .map((s) => `<blockquote>${s[0]}<cite>${s[1]}</cite></blockquote>`)
    .join("");
  const names = D.countries.map((c) => c.n),
    opt = names.map((n) => `<option>${n}</option>`).join("");
  $("vc").innerHTML = opt;
  $("c").innerHTML = '<option value="">Not sure yet</option>' + opt;
  function visa() {
    const items = D.visaBase.concat(D.visaExtra[$("vc").value] || []);
    $("vlist").innerHTML = items
      .map(
        (i) => `<li tabindex="0" role="checkbox" aria-checked="false">${i}</li>`
      )
      .join("");
    $("vlist")
      .querySelectorAll("li")
      .forEach((li) => {
        const t = () => {
          const on = li.classList.toggle("on");
          li.setAttribute("aria-checked", on);
        };
        li.onclick = t;
        li.onkeydown = (e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            t();
          }
        };
      });
  }
  $("vc").onchange = visa;
  visa();
  const acc = (box, rows, cls, head, body) => {
    rows.forEach((r, i) => {
      const d = document.createElement("div");
      d.className = cls;
      d.innerHTML = head(r, i) + body(r, i);
      const b = d.firstChild,
        m = d.lastChild;
      b.onclick = () => {
        const o = m.hidden;
        m.hidden = !o;
        b.setAttribute("aria-expanded", o);
      };
      box.appendChild(d);
    });
  };
  acc(
    $("mods"),
    Object.entries(D.mods),
    "mrow",
    ([k, v], i) =>
      `<button aria-expanded="${
        i == 0
      }"><span class="nm">${k}</span><span class="tt">${v[0]}</span></button>`,
    ([k, v], i) =>
      `<div class="more" ${i ? "hidden" : ""}><p>${v[1]}</p><ul>${v[2]
        .map((x) => `<li>${x}</li>`)
        .join("")}</ul></div>`
  );
  acc(
    $("faqs"),
    D.faqs,
    "frow",
    (f, i) => `<button aria-expanded="${i == 0}">${f[0]}</button>`,
    (f, i) => `<p ${i ? "hidden" : ""}>${f[1]}</p>`
  );

  // ---- OLTERA logo: on hover the letters turn into shapes, then change back by themselves ----
  (function () {
    const b = document.querySelector(".brand"),
      t = b.textContent.trim();
    let busy = false,
      timer;
    b.setAttribute("aria-label", t);
    b.innerHTML = [...t]
      .map(
        (c, k) =>
          `<span class="ch s${
            k % 6
          }" style="--i:${k}" aria-hidden="true"><i>${c}</i></span>`
      )
      .join("");
    const go = () => {
      if (busy) return;
      busy = true;
      b.classList.add("morph");
      clearTimeout(timer);
      timer = setTimeout(() => {
        b.classList.remove("morph");
        setTimeout(() => (busy = false), 900);
      }, 1200);
    };
    b.addEventListener("mouseenter", go);
    b.addEventListener("focus", go);
    b.addEventListener("touchstart", go, { passive: true });
  })();

  // ---- navigation: top bar with country dropdown, active-section highlight, hide on scroll down ----
  const nav = $("nav"),
    burger = $("burger"),
    links = $("links");
  const L = [
    ["About", "#about"],
    ["Destinations", "#destinations"],
    ["IELTS", "#ielts"],
    ["Tracker", "#tracker"],
    ["Visa", "#visa"],
    ["Stories", "#stories"],
    ["FAQ", "#faq"],
  ];
  links.innerHTML =
    "<ul>" +
    L.map(
      (l, i) =>
        `<li${i == 1 ? ' class="hasdd"' : ""}><a href="${l[1]}">${l[0]}</a>${
          i == 1
            ? '<div class="dd">' +
              D.countries
                .map((c, j) => `<button data-go="${j}">${c.n}</button>`)
                .join("") +
              "</div>"
            : ""
        }</li>`
    ).join("") +
    "</ul>";
  let destST = null,
    isOpen = false;
  function jump(el) {
    const g = el.dataset.go,
      href = el.getAttribute && el.getAttribute("href");
    if (g !== undefined) {
      const card = $("track").children[g];
      if (destST) {
        const dist = $("track").scrollWidth - innerWidth + 60,
          f = Math.min(1, Math.max(0, (card.offsetLeft - 28) / dist));
        scrollTo({
          top: destST.start + f * (destST.end - destST.start),
          behavior: "instant",
        });
      } else
        card.scrollIntoView({
          behavior: "instant",
          inline: "center",
          block: "center",
        });
    } else if (href && href !== "#")
      document.querySelector(href).scrollIntoView({ behavior: "instant" });
  }
  function setMenu(on) {
    isOpen = on;
    nav.classList.toggle("open", on);
    burger.setAttribute("aria-expanded", on);
    burger.setAttribute("aria-label", on ? "Close menu" : "Open menu");
    document.body.style.overflow = on ? "hidden" : "";
  }
  burger.onclick = () => setMenu(!isOpen);
  links.querySelectorAll("a,button").forEach(
    (el) =>
      (el.onclick = (e) => {
        e.preventDefault();
        jump(el);
        setMenu(false);
      })
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen) {
      setMenu(false);
      burger.focus();
    }
  });
  addEventListener("resize", () => {
    if (innerWidth > 1020 && isOpen) setMenu(false);
  });
  function setActive(id) {
    links
      .querySelectorAll("a")
      .forEach((a) =>
        a.classList.toggle("on", a.getAttribute("href") === "#" + id)
      );
  }
  addEventListener(
    "scroll",
    () => {
      const p =
        scrollY /
        Math.max(1, document.documentElement.scrollHeight - innerHeight);
      nav.style.setProperty("--p", Math.min(1, p));
    },
    { passive: true }
  );

  // ---- enquiry form: posts to the Node server, falls back to this device ----
  $("go").onclick = async () => {
    const n = $("n").value.trim(),
      e = $("e").value.trim(),
      c = $("c").value,
      m = $("msg");
    if (!n) {
      m.textContent = "Enter your name.";
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(e)) {
      m.textContent = "Enter a valid email, like name@example.com.";
      return;
    }
    try {
      const r = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, email: e, country: c }),
      });
      if (!r.ok) throw 0;
      m.textContent = `Thank you. We will email ${e} with a time to talk.`;
    } catch (x) {
      try {
        localStorage.setItem("oltera_enquiry", JSON.stringify({ n, e, c }));
      } catch (y) {}
      m.textContent =
        "The server is not connected, so your details are saved on this device only. Start the server to receive enquiries.";
    }
  };

  // ---- GSAP scroll animation ----
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const NAMES = {
    home: "Home",
    about: "About",
    destinations: "Destinations",
    why: "Why Oltera",
    ielts: "IELTS",
    tracker: "Offer tracker",
    visa: "Visa",
    stories: "Stories",
    faq: "Questions",
    counselling: "Counselling",
  };
  Object.keys(NAMES).forEach((id) =>
    ScrollTrigger.create({
      trigger: "#" + id,
      start: "top 55%",
      end: "bottom 55%",
      onToggle: (t) => t.isActive && setActive(id),
    })
  );
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // headline: words rise out of a mask
    const h = $("h1");
    h.innerHTML = h.textContent
      .split(" ")
      .map((w) => `<span class="ww"><i>${w}</i></span>`)
      .join(" ");
    gsap.from("#h1 i", {
      yPercent: 110,
      duration: 1,
      stagger: 0.12,
      ease: "power4.out",
    });
    gsap.from(".hero p,.hero .row", {
      y: 30,
      opacity: 0,
      duration: 0.9,
      delay: 0.7,
      stagger: 0.15,
    });
    gsap.to(".emblem", {
      yPercent: -18,
      rotate: 6,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
    // counters
    document.querySelectorAll("[data-to]").forEach((el) => {
      const o = { v: 0 },
        to = +el.dataset.to;
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () =>
          gsap.to(o, {
            v: to,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () =>
              (el.textContent =
                Math.round(o.v).toLocaleString() + el.dataset.suf),
          }),
      });
    });
    // destinations: pinned horizontal scroll on desktop
    gsap.matchMedia().add("(min-width: 801px)", () => {
      const t = $("track"),
        dist = () => t.scrollWidth - innerWidth + 60;
      destST = gsap.to(t, {
        x: () => -dist(),
        ease: "none",
        scrollTrigger: {
          trigger: ".dest",
          start: "top top",
          end: () => "+=" + dist(),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1,
        },
      }).scrollTrigger;
    });
    // generic reveals
    gsap.utils
      .toArray(".wrow,.mrow,.frow,.sgrid blockquote,h2")
      .forEach((el) =>
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        })
      );
    // offer tracker: line fills as you scroll, steps light up
    const lis = [...document.querySelectorAll(".steps li")];
    gsap.to(".steps .fill", {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".steps",
        start: "top 65%",
        end: "bottom 65%",
        scrub: true,
      },
    });
    lis.forEach((li) =>
      ScrollTrigger.create({
        trigger: li,
        start: "top 65%",
        onEnter: () => li.classList.add("on"),
        onLeaveBack: () => li.classList.remove("on"),
      })
    );
    // ---- extra animations ----
    const once = (trigger, start = "top 88%") => ({
      trigger,
      start,
      once: true,
    });
    // hero text drifts up and fades as you scroll away
    gsap.to(".hero .w", {
      y: -70,
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom 25%",
        scrub: true,
      },
    });
    // stats rise in one after another
    gsap.from(".stats .w>div", {
      y: 60,
      opacity: 0,
      duration: 0.8,
      stagger: 0.14,
      ease: "back.out(1.6)",
      scrollTrigger: once(".stats", "top 85%"),
    });
    // about: lead sentence lights up word by word as you scroll
    const al = document.querySelector(".about .al");
    if (al) {
      al.innerHTML = al.textContent
        .split(" ")
        .map((w) => `<span class="aw">${w}</span>`)
        .join(" ");
      gsap.fromTo(
        ".aw",
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: "none",
          scrollTrigger: {
            trigger: al,
            start: "top 82%",
            end: "bottom 50%",
            scrub: true,
          },
        }
      );
      gsap.utils
        .toArray(".ab-r")
        .forEach((r) =>
          gsap.from(r.querySelectorAll("p"), {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15,
            scrollTrigger: once(r),
          })
        );
    }
    gsap.from(".goal-l p", {
      x: -40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out",
      scrollTrigger: once(".goal-l", "top 85%"),
    });
    gsap.from(".about .tag", {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: once(".about .tag", "top 92%"),
    });
    // destination cards: lift on hover (mouse only)
    if (matchMedia("(pointer:fine)").matches)
      document.querySelectorAll(".cty").forEach((c) => {
        c.addEventListener("mouseenter", () =>
          gsap.to(c, {
            scale: 1.04,
            rotate: -1,
            duration: 0.35,
            ease: "back.out(2)",
          })
        );
        c.addEventListener("mouseleave", () =>
          gsap.to(c, { scale: 1, rotate: 0, duration: 0.4, ease: "power2.out" })
        );
      });
    // why Oltera: headings slide in from the left
    gsap.utils
      .toArray(".wrow h3")
      .forEach((h) =>
        gsap.from(h, {
          x: -60,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: once(h, "top 90%"),
        })
      );
    // IELTS: mock test box and writing area pop in
    gsap.from(".tbox", {
      y: 60,
      scale: 0.96,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: once(".tbox", "top 90%"),
    });
    gsap.from(".checks li", {
      x: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: once(".write .checks", "top 85%"),
    });
    // plan rows slide in alternately from left and right
    gsap.utils
      .toArray(".pl")
      .forEach((p, i) =>
        gsap.from(p, {
          x: i % 2 ? 90 : -90,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: once(p),
        })
      );
    // tracker steps slide in as the line reaches them
    lis.forEach((li) =>
      gsap.from(li, {
        x: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: once(li, "top 85%"),
      })
    );
    // stories tilt into place
    gsap.utils
      .toArray(".sgrid blockquote")
      .forEach((q, i) =>
        gsap.from(q, {
          rotate: [-4, 3, -3][i % 3],
          transformOrigin: "0 100%",
          duration: 1,
          ease: "back.out(1.4)",
          scrollTrigger: once(q),
        })
      );
    // enquiry form fields and footer
    gsap.from("#f p,#f button", {
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.12,
      clearProps: "transform,opacity",
      scrollTrigger: once("#f", "top 88%"),
    });
    gsap.from("footer .w", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: once("footer", "top 98%"),
    });
    // ---- even more animations ----
    // country ticker scrolls sideways and speeds up when you scroll the page
    const mqIn = document.querySelector(".mq-in");
    if (mqIn) {
      const loop = gsap.to(mqIn, {
        xPercent: -50,
        duration: 30,
        ease: "none",
        repeat: -1,
      });
      ScrollTrigger.create({
        onUpdate: (s) =>
          loop.timeScale(1 + Math.min(8, Math.abs(s.getVelocity()) / 250)),
      });
    }
    // nav links drop in on load
    gsap.from(".nav #links a,.nav .cta", {
      y: -24,
      opacity: 0,
      duration: 0.6,
      stagger: 0.07,
      delay: 0.3,
      ease: "power3.out",
      clearProps: "transform,opacity",
    });
    // accordion answers ease open
    document.querySelectorAll(".more,.frow p").forEach((el) =>
      new MutationObserver(() => {
        if (!el.hidden)
          gsap.from(el, {
            opacity: 0,
            y: -14,
            duration: 0.45,
            ease: "power2.out",
            clearProps: "transform,opacity",
          });
      }).observe(el, { attributes: true, attributeFilter: ["hidden"] })
    );
    // mock test timer pulses every second in the last 30 seconds
    const tmEl = $("timer");
    new MutationObserver(() => {
      const p = tmEl.textContent.split(":").map(Number);
      if (p[0] === 0 && p[1] > 0 && p[1] <= 30)
        gsap.fromTo(
          tmEl,
          { scale: 1.18, transformOrigin: "right center" },
          { scale: 1, duration: 0.4, ease: "back.out(3)" }
        );
    }).observe(tmEl, { childList: true, characterData: true, subtree: true });
    // mouse only: magnetic buttons
    if (matchMedia("(pointer:fine)").matches) {
      document
        .querySelectorAll(".hero .btn,.nav .cta,.plans .btn")
        .forEach((b) => {
          b.addEventListener("mousemove", (e) => {
            const r = b.getBoundingClientRect();
            gsap.to(b, {
              x: (e.clientX - r.left - r.width / 2) * 0.35,
              y: (e.clientY - r.top - r.height / 2) * 0.5,
              duration: 0.3,
            });
          });
          b.addEventListener("mouseleave", () =>
            gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,.4)" })
          );
        });
    }
    return () => {};
  });
  // without animation, light every tracker step
  if (matchMedia("(prefers-reduced-motion: reduce)").matches)
    document
      .querySelectorAll(".steps li")
      .forEach((l) => l.classList.add("on"));
  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
