(function () {
  "use strict";

  var container = document.getElementById("testimonialbox-widget");
  if (!container) return;

  var widgetId = container.getAttribute("data-widget-id");
  if (!widgetId) return;

  // Derive API URL from the script src
  var scripts = document.querySelectorAll("script[src]");
  var apiBase = "";
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute("src") || "";
    if (src.indexOf("widget.js") !== -1) {
      var url = new URL(src, window.location.href);
      apiBase = url.origin;
      break;
    }
  }

  function fetchData() {
    var endpoint = apiBase + "/api/widgets/embed/" + widgetId;
    return fetch(endpoint)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load widget");
        return res.json();
      });
  }

  function formatDate(dateStr) {
    var d = new Date(dateStr);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  }

  function renderStars(rating, color) {
    var html = "";
    for (var i = 0; i < 5; i++) {
      var filled = i < rating;
      html += '<svg width="14" height="14" viewBox="0 0 24 24" fill="' +
        (filled ? color : "none") +
        '" stroke="' + color + '" stroke-width="2" style="opacity:' +
        (filled ? "1" : "0.3") +
        ';display:inline-block;vertical-align:middle;margin-right:1px;">' +
        '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' +
        "</svg>";
    }
    return '<div style="margin-bottom:8px;">' + html + "</div>";
  }

  function renderAvatar(t, cfg) {
    if (!cfg.showAvatar) return "";
    var size = "36px";
    if (t.avatar) {
      return '<img src="' + t.avatar + '" alt="' + t.name +
        '" style="width:' + size + ";height:" + size +
        ';border-radius:50%;object-fit:cover;flex-shrink:0;" />';
    }
    return '<div style="width:' + size + ";height:" + size +
      ";border-radius:50%;background:" + cfg.starColor +
      ";color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:14px;flex-shrink:0;" +
      '">' + t.name.charAt(0).toUpperCase() + "</div>";
  }

  function renderAuthor(t, cfg) {
    var html = '<div style="display:flex;align-items:center;gap:10px;">';
    html += renderAvatar(t, cfg);
    html += "<div>";
    html += '<div style="font-weight:600;font-size:14px;">' + t.name + "</div>";
    if (cfg.showCompany && t.company) {
      html += '<div style="font-size:12px;opacity:0.6;">' + t.company + "</div>";
    }
    if (cfg.showDate) {
      html += '<div style="font-size:11px;opacity:0.4;">' + formatDate(t.createdAt) + "</div>";
    }
    html += "</div></div>";
    return html;
  }

  function getThemeStyles(cfg) {
    if (cfg.theme === "DARK") {
      return { bg: "#1f2937", text: "#f9fafb", border: "rgba(255,255,255,0.1)" };
    }
    if (cfg.theme === "CUSTOM") {
      return { bg: cfg.bgColor, text: cfg.textColor, border: "rgba(0,0,0,0.1)" };
    }
    return { bg: "#ffffff", text: "#111827", border: "rgba(0,0,0,0.1)" };
  }

  function renderCard(t, cfg, styles) {
    var html = '<div style="background:' + styles.bg + ";color:" + styles.text +
      ";border:1px solid " + styles.border + ";border-radius:" + cfg.borderRadius +
      'px;padding:20px;box-sizing:border-box;">';
    if (cfg.showRating) html += renderStars(t.rating, cfg.starColor);
    html += '<p style="font-size:14px;line-height:1.6;margin:0 0 12px 0;">' + t.text + "</p>";
    html += renderAuthor(t, cfg);
    html += "</div>";
    return html;
  }

  // ===== CAROUSEL =====
  function renderCarousel(data, root) {
    var cfg = data.widget;
    var ts = data.testimonials;
    var styles = getThemeStyles(cfg);
    if (ts.length === 0) {
      root.innerHTML = '<div style="text-align:center;padding:32px;opacity:0.5;">No testimonials</div>';
      return;
    }

    var currentIndex = 0;

    function render() {
      var t = ts[currentIndex];
      var html = '<div class="tb-carousel" style="position:relative;overflow:hidden;background:' +
        styles.bg + ";color:" + styles.text + ";border-radius:" + cfg.borderRadius + 'px;">';

      html += '<div class="tb-slide" style="padding:24px;transition:opacity 0.4s ease;">';
      html += '<svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.15;margin-bottom:8px;"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z"/></svg>';
      html += '<p style="font-size:15px;line-height:1.6;margin:0 0 12px 0;">' + t.text + "</p>";
      if (cfg.showRating) html += renderStars(t.rating, cfg.starColor);
      html += renderAuthor(t, cfg);
      html += "</div>";

      // Arrows
      if (ts.length > 1) {
        html += '<button class="tb-prev" aria-label="Previous" style="position:absolute;left:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.1);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg></button>';
        html += '<button class="tb-next" aria-label="Next" style="position:absolute;right:8px;top:50%;transform:translateY(-50%);width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.1);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.2s;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></button>';
      }

      // Dots
      if (ts.length > 1) {
        html += '<div style="display:flex;justify-content:center;gap:6px;padding-bottom:16px;">';
        for (var i = 0; i < ts.length; i++) {
          html += '<button class="tb-dot" data-index="' + i + '" style="width:8px;height:8px;border-radius:50%;border:none;cursor:pointer;background:' +
            (i === currentIndex ? cfg.starColor : styles.text) +
            ";opacity:" + (i === currentIndex ? "1" : "0.2") +
            ';transition:all 0.2s;padding:0;"></button>';
        }
        html += "</div>";
      }

      html += "</div>";
      root.innerHTML = html;

      // Events
      var carousel = root.querySelector(".tb-carousel");
      if (carousel && ts.length > 1) {
        carousel.addEventListener("mouseenter", function () {
          var prev = root.querySelector(".tb-prev");
          var next = root.querySelector(".tb-next");
          if (prev) prev.style.opacity = "1";
          if (next) next.style.opacity = "1";
          clearAutoplay();
        });
        carousel.addEventListener("mouseleave", function () {
          var prev = root.querySelector(".tb-prev");
          var next = root.querySelector(".tb-next");
          if (prev) prev.style.opacity = "0";
          if (next) next.style.opacity = "0";
          startAutoplay();
        });
      }

      var prevBtn = root.querySelector(".tb-prev");
      var nextBtn = root.querySelector(".tb-next");
      if (prevBtn) prevBtn.addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + ts.length) % ts.length;
        render();
      });
      if (nextBtn) nextBtn.addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % ts.length;
        render();
      });

      var dots = root.querySelectorAll(".tb-dot");
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          currentIndex = parseInt(dot.getAttribute("data-index"), 10);
          render();
        });
      });
    }

    var autoplayTimer = null;
    function startAutoplay() {
      if (!cfg.autoplay || ts.length <= 1) return;
      clearAutoplay();
      autoplayTimer = setInterval(function () {
        currentIndex = (currentIndex + 1) % ts.length;
        render();
      }, cfg.autoplaySpeed * 1000);
    }
    function clearAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    render();
    startAutoplay();
  }

  // ===== GRID =====
  function renderGrid(data, root) {
    var cfg = data.widget;
    var ts = data.testimonials;
    var styles = getThemeStyles(cfg);
    if (ts.length === 0) {
      root.innerHTML = '<div style="text-align:center;padding:32px;opacity:0.5;">No testimonials</div>';
      return;
    }
    var html = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">';
    for (var i = 0; i < ts.length; i++) {
      html += renderCard(ts[i], cfg, styles);
    }
    html += "</div>";
    root.innerHTML = html;
  }

  // ===== LIST =====
  function renderList(data, root) {
    var cfg = data.widget;
    var ts = data.testimonials;
    var styles = getThemeStyles(cfg);
    if (ts.length === 0) {
      root.innerHTML = '<div style="text-align:center;padding:32px;opacity:0.5;">No testimonials</div>';
      return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:16px;">';
    for (var i = 0; i < ts.length; i++) {
      html += renderCard(ts[i], cfg, styles);
    }
    html += "</div>";
    root.innerHTML = html;
  }

  // ===== WALL OF LOVE (Masonry) =====
  function renderWallOfLove(data, root) {
    var cfg = data.widget;
    var ts = data.testimonials;
    var styles = getThemeStyles(cfg);
    if (ts.length === 0) {
      root.innerHTML = '<div style="text-align:center;padding:32px;opacity:0.5;">No testimonials</div>';
      return;
    }
    var html = '<div style="column-count:3;column-gap:16px;">';
    for (var i = 0; i < ts.length; i++) {
      html += '<div style="break-inside:avoid;margin-bottom:16px;">';
      html += renderCard(ts[i], cfg, styles);
      html += "</div>";
    }
    html += "</div>";

    // Responsive: add a style tag for smaller screens
    html += "<style>";
    html += "@media(max-width:768px){.tb-wall{column-count:2!important;}}";
    html += "@media(max-width:480px){.tb-wall{column-count:1!important;}}";
    html += "</style>";

    // Wrap with class
    root.innerHTML = html.replace('style="column-count:3', 'class="tb-wall" style="column-count:3');
  }

  // ===== MINIMAL =====
  function renderMinimal(data, root) {
    var cfg = data.widget;
    var ts = data.testimonials;
    var styles = getThemeStyles(cfg);
    if (ts.length === 0) {
      root.innerHTML = '<div style="text-align:center;padding:32px;opacity:0.5;">No testimonials</div>';
      return;
    }

    var currentIndex = 0;

    function render() {
      var t = ts[currentIndex];
      var html = '<div style="text-align:center;padding:32px;background:' + styles.bg +
        ";color:" + styles.text + ";border-radius:" + cfg.borderRadius + 'px;">';

      // Quote
      html += '<svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" style="opacity:0.12;margin:0 auto 16px auto;display:block;"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983z"/></svg>';

      html += '<blockquote style="font-size:18px;font-style:italic;line-height:1.6;margin:0 0 20px 0;font-weight:500;">&ldquo;' + t.text + '&rdquo;</blockquote>';

      if (cfg.showRating) {
        html += '<div style="display:flex;justify-content:center;margin-bottom:16px;">';
        html += renderStars(t.rating, cfg.starColor);
        html += "</div>";
      }

      // Avatar centered
      if (cfg.showAvatar) {
        var size = "48px";
        if (t.avatar) {
          html += '<img src="' + t.avatar + '" alt="' + t.name +
            '" style="width:' + size + ";height:" + size +
            ';border-radius:50%;object-fit:cover;margin:0 auto 12px auto;display:block;" />';
        } else {
          html += '<div style="width:' + size + ";height:" + size +
            ";border-radius:50%;background:" + cfg.starColor +
            ";color:#fff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px;margin:0 auto 12px auto;" +
            '">' + t.name.charAt(0).toUpperCase() + "</div>";
        }
      }

      html += '<div style="font-weight:600;font-size:15px;">' + t.name + "</div>";
      if (cfg.showCompany && t.company) {
        html += '<div style="font-size:13px;opacity:0.6;margin-top:2px;">' + t.company + "</div>";
      }
      if (cfg.showDate) {
        html += '<div style="font-size:12px;opacity:0.4;margin-top:4px;">' + formatDate(t.createdAt) + "</div>";
      }

      // Dots
      if (ts.length > 1) {
        html += '<div style="display:flex;justify-content:center;gap:6px;margin-top:20px;">';
        for (var i = 0; i < ts.length; i++) {
          html += '<button class="tb-dot" data-index="' + i + '" style="width:8px;height:8px;border-radius:50%;border:none;cursor:pointer;background:' +
            (i === currentIndex ? cfg.starColor : styles.text) +
            ";opacity:" + (i === currentIndex ? "1" : "0.2") +
            ';transition:all 0.2s;padding:0;"></button>';
        }
        html += "</div>";
      }

      html += "</div>";
      root.innerHTML = html;

      // Dot events
      var dots = root.querySelectorAll(".tb-dot");
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          currentIndex = parseInt(dot.getAttribute("data-index"), 10);
          render();
        });
      });
    }

    var autoplayTimer = null;
    function startAutoplay() {
      if (!cfg.autoplay || ts.length <= 1) return;
      autoplayTimer = setInterval(function () {
        currentIndex = (currentIndex + 1) % ts.length;
        render();
      }, cfg.autoplaySpeed * 1000);
    }

    render();
    startAutoplay();
  }

  // ===== BRANDING =====
  function renderBranding(data, root) {
    if (!data.branding.showWatermark) return;
    var html = '<div style="text-align:center;padding:12px 0 4px 0;font-size:11px;opacity:0.5;">';
    html += '<a href="' + data.branding.url + '" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;">Powered by TestimonialBox</a>';
    html += "</div>";
    root.innerHTML += html;
  }

  // ===== MAIN =====
  fetchData().then(function (data) {
    // Create Shadow DOM for style isolation
    var shadow = container.attachShadow({ mode: "open" });

    // Reset styles inside shadow
    var style = document.createElement("style");
    style.textContent = [
      ":host { display: block; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; }",
      "*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }",
      "img { max-width: 100%; }",
      "button { font-family: inherit; }",
      "@media(max-width:768px) { .tb-wall { column-count: 2 !important; } }",
      "@media(max-width:480px) { .tb-wall { column-count: 1 !important; } }",
    ].join("\n");
    shadow.appendChild(style);

    var wrapper = document.createElement("div");
    shadow.appendChild(wrapper);

    var layout = data.widget.layout;

    switch (layout) {
      case "CAROUSEL":
        renderCarousel(data, wrapper);
        break;
      case "GRID":
        renderGrid(data, wrapper);
        break;
      case "LIST":
        renderList(data, wrapper);
        break;
      case "MASONRY":
        renderWallOfLove(data, wrapper);
        break;
      case "WALL_OF_LOVE":
        renderWallOfLove(data, wrapper);
        break;
      case "MINIMAL":
        renderMinimal(data, wrapper);
        break;
      default:
        renderCarousel(data, wrapper);
    }

    renderBranding(data, wrapper);
  }).catch(function (err) {
    console.error("TestimonialBox Widget Error:", err);
  });
})();
