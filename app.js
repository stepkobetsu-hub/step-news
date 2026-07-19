(function () {
  "use strict";

  const config = Object.assign({
    blogUrl: "https://stepkobetsublog.blogspot.com",
    maxResults: 6,
    newDays: 5,
    summaryLength: 92
  }, window.STEP_NEWS_CONFIG || {});

  const list = document.getElementById("news-list");
  const status = document.getElementById("news-status");

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function parseHtml(html) {
    return new DOMParser().parseFromString(String(html || ""), "text/html");
  }

  function plainText(html) {
    return (parseHtml(html).body.textContent || "").replace(/\s+/g, " ").trim();
  }

  function entryHtml(entry) {
    return (entry.content && entry.content.$t) || (entry.summary && entry.summary.$t) || "";
  }

  function imageUrl(entry) {
    if (entry.media$thumbnail && entry.media$thumbnail.url) {
      return entry.media$thumbnail.url
        .replace(/\/s72-c\//, "/s1200/")
        .replace(/=s72-c(?:-[a-z]+)?$/, "=s1200");
    }
    const image = parseHtml(entryHtml(entry)).querySelector("img");
    return image ? image.getAttribute("src") || "" : "";
  }

  function articleUrl(entry) {
    const links = Array.isArray(entry.link) ? entry.link : [];
    const alternate = links.find(function (link) { return link.rel === "alternate"; });
    return alternate ? alternate.href : config.blogUrl;
  }

  function dateText(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric", month: "2-digit", day: "2-digit"
    }).format(date).replaceAll("/", ".");
  }

  function isNew(value) {
    const time = new Date(value).getTime();
    return Number.isFinite(time) && Date.now() - time <= config.newDays * 86400000;
  }

  function card(entry) {
    const title = (entry.title && entry.title.$t) || "お知らせ";
    const published = (entry.published && entry.published.$t) || "";
    const summary = plainText(entryHtml(entry)).slice(0, config.summaryLength);
    const image = imageUrl(entry);
    const media = image
      ? '<img class="card__image" src="' + escapeHtml(image) + '" alt="" loading="lazy" referrerpolicy="no-referrer">'
      : '<div class="card__fallback" aria-hidden="true">STEP NEWS</div>';
    const badge = isNew(published) ? '<span class="card__badge">NEW</span>' : "";

    return [
      '<article class="card">',
      '<a class="card__link" href="', escapeHtml(articleUrl(entry)), '" target="_blank" rel="noopener noreferrer">',
      '<div class="card__media">', media, badge, '</div>',
      '<div class="card__body">',
      '<div class="card__date">', escapeHtml(dateText(published)), '</div>',
      '<h2 class="card__title">', escapeHtml(title), '</h2>',
      '<p class="card__summary">', escapeHtml(summary || "詳しい内容は記事をご覧ください。"), '</p>',
      '<div class="card__more">詳しく見る</div>',
      '</div></a></article>'
    ].join("");
  }

  function fail(message) {
    if (status) {
      status.hidden = false;
      status.textContent = message;
    }
  }

  window.stepNewsCallback = function (data) {
    const entries = data && data.feed && Array.isArray(data.feed.entry) ? data.feed.entry : [];
    if (!entries.length) {
      fail("現在、表示できるお知らせはありません。");
      return;
    }
    list.innerHTML = entries.map(card).join("");
    status.hidden = true;
    delete window.stepNewsCallback;
  };

  const script = document.createElement("script");
  const base = String(config.blogUrl).replace(/\/$/, "");
  script.src = base + "/feeds/posts/default?alt=json-in-script&callback=stepNewsCallback&max-results=" + encodeURIComponent(config.maxResults);
  script.async = true;
  script.onerror = function () {
    fail("お知らせを読み込めませんでした。しばらくしてから再読み込みしてください。");
  };
  document.head.appendChild(script);
})();
