(function () {
  "use strict";

  const config = Object.assign({
    blogUrl: "https://stepkobetsublog.blogspot.com",
    maxResults: 6,
    newDays: 5,
    summaryLength: 100,
    timeoutMs: 15000,
    importantLabels: ["重要", "重要なお知らせ"],
    hiddenLabels: []
  }, window.STEP_NEWS_CONFIG || {});

  const list = document.getElementById("news-list");
  const status = document.getElementById("news-status");
  const mobileTabs = document.getElementById("mobile-news-tabs");
  const mobileDetail = document.getElementById("mobile-news-detail");
  let completed = false;

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
    return (parseHtml(html).body.textContent || "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function truncate(text, maxLength) {
    const value = String(text || "").trim();
    return value.length > maxLength ? value.slice(0, maxLength) + "…" : value;
  }

  function entryHtml(entry) {
    return (entry.content && entry.content.$t) ||
      (entry.summary && entry.summary.$t) || "";
  }

  function upgradeImageUrl(url) {
    return String(url || "")
      .replace(/\/s72-c\//, "/s1200/")
      .replace(/\/s[0-9]+(?:-c)?\//, "/s1200/")
      .replace(/=s[0-9]+(?:-c)?(?:-[a-z]+)?$/, "=s1200");
  }

  function imageUrl(entry) {
    if (entry.media$thumbnail && entry.media$thumbnail.url) {
      return upgradeImageUrl(entry.media$thumbnail.url);
    }

    const document = parseHtml(entryHtml(entry));
    const image = document.querySelector("img");
    if (!image) return "";

    return upgradeImageUrl(
      image.getAttribute("data-original") ||
      image.getAttribute("data-src") ||
      image.getAttribute("src") ||
      ""
    );
  }

  function articleUrl(entry) {
    const links = Array.isArray(entry.link) ? entry.link : [];
    const alternate = links.find(function (link) {
      return link && link.rel === "alternate";
    });
    return alternate && alternate.href ? alternate.href : config.blogUrl;
  }

  function labels(entry) {
    const categories = Array.isArray(entry.category) ? entry.category : [];
    return categories
      .map(function (item) { return item && item.term ? String(item.term) : ""; })
      .filter(Boolean);
  }

  function hasIntersection(values, targets) {
    return values.some(function (value) { return targets.includes(value); });
  }

  function dateValue(entry) {
    return (entry.published && entry.published.$t) ||
      (entry.updated && entry.updated.$t) || "";
  }

  function dateText(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(date).replaceAll("/", ".");
  }

  function isNew(value) {
    const time = new Date(value).getTime();
    return Number.isFinite(time) &&
      Date.now() - time >= 0 &&
      Date.now() - time <= config.newDays * 86400000;
  }

  function visibleEntries(entries) {
    return entries.filter(function (entry) {
      return !hasIntersection(labels(entry), config.hiddenLabels);
    });
  }

  function sortEntries(entries) {
    return entries.slice().sort(function (a, b) {
      const aImportant = hasIntersection(labels(a), config.importantLabels) ? 1 : 0;
      const bImportant = hasIntersection(labels(b), config.importantLabels) ? 1 : 0;

      if (aImportant !== bImportant) return bImportant - aImportant;
      return new Date(dateValue(b)).getTime() - new Date(dateValue(a)).getTime();
    });
  }

  function imageMarkup(url, title) {
    if (!url) {
      return '<div class="card__fallback" aria-hidden="true">STEP NEWS</div>';
    }

    return '<img class="card__image" src="' + escapeHtml(url) +
      '" alt="' + escapeHtml(title) +
      '" loading="lazy" decoding="async" referrerpolicy="no-referrer">';
  }

  function card(entry) {
    const title = (entry.title && entry.title.$t) || "お知らせ";
    const published = dateValue(entry);
    const entryLabels = labels(entry);
    const important = hasIntersection(entryLabels, config.importantLabels);
    const category = entryLabels.find(function (label) {
      return !config.importantLabels.includes(label);
    }) || "";
    const summary = truncate(plainText(entryHtml(entry)), config.summaryLength);
    const url = articleUrl(entry);
    const image = imageUrl(entry);

    const flags = [];
    if (important) {
      flags.push('<span class="card__badge card__badge--important">重要</span>');
    }
    if (isNew(published)) {
      flags.push('<span class="card__badge card__badge--new">NEW</span>');
    }

    return [
      '<article class="card', important ? ' card--important' : '', '">',
      '<a class="card__link" href="', escapeHtml(url),
      '" target="_blank" rel="noopener noreferrer">',
      '<div class="card__media">',
      imageMarkup(image, title),
      flags.length ? '<div class="card__flags">' + flags.join("") + '</div>' : '',
      '</div>',
      '<div class="card__body">',
      '<div class="card__meta">',
      '<time class="card__date" datetime="', escapeHtml(published), '">',
      escapeHtml(dateText(published)),
      '</time>',
      category ? '<span class="card__category">' + escapeHtml(category) + '</span>' : '',
      '</div>',
      '<h2 class="card__title">', escapeHtml(title), '</h2>',
      '<p class="card__summary">',
      escapeHtml(summary || "詳しい内容は記事をご覧ください。"),
      '</p>',
      '<div class="card__more">詳しく見る</div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }


  function entryViewModel(entry) {
    const title = (entry.title && entry.title.$t) || "お知らせ";
    const published = dateValue(entry);
    const entryLabels = labels(entry);
    const category = entryLabels.find(function (label) {
      return !config.importantLabels.includes(label);
    }) || "";
    return {
      title: title,
      published: published,
      category: category,
      summary: truncate(plainText(entryHtml(entry)), config.summaryLength + 30),
      url: articleUrl(entry),
      image: imageUrl(entry)
    };
  }

  function mobileTabMarkup(item, index) {
    const media = item.image
      ? '<img class="mobile-news__tab-image" src="' + escapeHtml(item.image) +
        '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">'
      : '<span class="mobile-news__tab-fallback">STEP<br>NEWS</span>';

    return [
      '<button class="mobile-news__tab" type="button" role="tab" ',
      'id="mobile-news-tab-', index, '" ',
      'aria-controls="mobile-news-panel" ',
      'aria-selected="', index === 0 ? 'true' : 'false', '" ',
      'data-index="', index, '">',
      media,
      '<span class="mobile-news__tab-title">', escapeHtml(item.title), '</span>',
      '</button>'
    ].join("");
  }

  function mobileDetailMarkup(item) {
    const media = item.image
      ? '<img class="mobile-feature__image" src="' + escapeHtml(item.image) +
        '" alt="' + escapeHtml(item.title) +
        '" loading="eager" decoding="async" referrerpolicy="no-referrer">'
      : '<div class="mobile-feature__fallback">STEP NEWS</div>';

    return [
      '<article id="mobile-news-panel" class="mobile-feature" role="tabpanel">',
      '<div class="mobile-feature__media">', media, '</div>',
      '<div class="mobile-feature__body">',
      '<div class="mobile-feature__meta">',
      '<time class="mobile-feature__date" datetime="', escapeHtml(item.published), '">',
      escapeHtml(dateText(item.published)), '</time>',
      item.category
        ? '<span class="mobile-feature__category">' + escapeHtml(item.category) + '</span>'
        : '',
      '</div>',
      '<h2 class="mobile-feature__title">', escapeHtml(item.title), '</h2>',
      '<p class="mobile-feature__summary">',
      escapeHtml(item.summary || "詳しい内容は記事をご覧ください。"),
      '</p>',
      '<a class="mobile-feature__link" href="', escapeHtml(item.url),
      '" target="_blank" rel="noopener noreferrer">詳しく見る</a>',
      '</div>',
      '</article>'
    ].join("");
  }

  function renderMobile(entries) {
    if (!mobileTabs || !mobileDetail) return;

    const items = entries.slice(0, 4).map(entryViewModel);
    if (!items.length) return;

    mobileTabs.innerHTML = items.map(mobileTabMarkup).join("");
    mobileDetail.innerHTML = mobileDetailMarkup(items[0]);

    mobileTabs.addEventListener("click", function (event) {
      const button = event.target.closest(".mobile-news__tab");
      if (!button) return;

      const index = Number(button.dataset.index);
      if (!Number.isInteger(index) || !items[index]) return;

      mobileTabs.querySelectorAll(".mobile-news__tab").forEach(function (tab) {
        tab.setAttribute("aria-selected", tab === button ? "true" : "false");
      });
      mobileDetail.innerHTML = mobileDetailMarkup(items[index]);
    });
  }

  function showMessage(message) {
    if (!status) return;
    status.hidden = false;
    status.innerHTML = "";
    status.textContent = message;
  }

  function finish(entries) {
    if (completed) return;
    completed = true;

    const prepared = sortEntries(visibleEntries(entries)).slice(0, config.maxResults);

    if (!prepared.length) {
      showMessage("現在、表示できるお知らせはありません。");
      return;
    }

    list.innerHTML = prepared.map(card).join("");
    renderMobile(prepared);
    status.hidden = true;
  }

  window.stepNewsCallback = function (data) {
    const entries = data && data.feed && Array.isArray(data.feed.entry)
      ? data.feed.entry
      : [];
    finish(entries);
  };

  const base = String(config.blogUrl).replace(/\/$/, "");
  const callbackName = "stepNewsCallback";
  const script = document.createElement("script");
  script.src = base +
    "/feeds/posts/default?alt=json-in-script&callback=" +
    encodeURIComponent(callbackName) +
    "&max-results=" + encodeURIComponent(Math.max(config.maxResults * 2, 12));
  script.async = true;
  script.referrerPolicy = "no-referrer";

  script.onerror = function () {
    if (!completed) {
      completed = true;
      showMessage("お知らせを読み込めませんでした。少し時間をおいて再読み込みしてください。");
    }
  };

  window.setTimeout(function () {
    if (!completed) {
      completed = true;
      showMessage("読み込みに時間がかかっています。ページを再読み込みしてください。");
    }
  }, config.timeoutMs);

  document.head.appendChild(script);
})();
