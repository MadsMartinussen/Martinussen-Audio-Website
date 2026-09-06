(function () {
  const DATA_URL = "data/projects.json";
  const grid = document.getElementById("project-grid");
  const empty = document.getElementById("grid-empty");
  const overlay = document.getElementById("project-overlay");
  const overlayBody = document.getElementById("overlay-body");
  const header = document.getElementById("site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const year = document.getElementById("year");

  const ALLOWED_TAGS = [
    "Music",
    "SFX",
    "Game Audio",
    "Mix",
    "Master",
    "Recording",
    "Production",
  ];

  let projects = [];
  let activeTags = [];

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isSafeUrl(url) {
    try {
      const parsed = new URL(url, window.location.href);
      return ["http:", "https:", "blob:", "data:"].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  function youtubeId(url) {
    const match = String(url).match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
    );
    return match ? match[1] : null;
  }

  function vimeoId(url) {
    const match = String(url).match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return match ? match[1] : null;
  }

  function sortProjects(list) {
    return list.slice().sort((a, b) => {
      const orderA = Number(a.order);
      const orderB = Number(b.order);
      if (orderA !== orderB) return orderA - orderB;
      return String(a.title || "").localeCompare(String(b.title || ""));
    });
  }

  function visibleProjects() {
    const sorted = sortProjects(projects);
    if (!activeTags.length) return sorted;
    return sorted.filter((project) => {
      const tags = project.tags || [];
      return activeTags.every((tag) => tags.includes(tag));
    });
  }

  function currentUrl(hash) {
    const url = new URL(window.location.href);
    if (activeTags.length) {
      url.searchParams.set("tags", activeTags.join(","));
    } else {
      url.searchParams.delete("tags");
    }
    url.hash = hash || "";
    return url.pathname + url.search + url.hash;
  }

  function tagsFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("tags");
    if (!raw) return [];
    return raw
      .split(",")
      .map((tag) => decodeURIComponent(tag.trim()))
      .filter((tag) => ALLOWED_TAGS.includes(tag));
  }

  function updateFilterUrl(push) {
    const next = currentUrl(location.hash);
    if (push) {
      history.pushState({ tags: activeTags.slice() }, "", next);
    } else {
      history.replaceState({ tags: activeTags.slice() }, "", next);
    }
  }

  function renderGrid() {
    const list = visibleProjects();
    grid.innerHTML = "";
    empty.hidden = list.length > 0;

    list.forEach((project) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "project-card";
      card.dataset.slug = project.slug;
      card.setAttribute("aria-label", "Open project: " + project.title);

      const cover = project.cover
        ? `<img class="project-card-cover" src="${escapeHtml(project.cover)}" alt="" />`
        : `<div class="project-card-cover" aria-hidden="true"></div>`;

      const tags = (project.tags || [])
        .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
        .join("");

      card.innerHTML = `
        ${cover}
        <div class="project-card-body">
          <h3>${escapeHtml(project.title || "Untitled")}</h3>
          <p>${escapeHtml(project.summary || "")}</p>
          <div class="card-tags">${tags}</div>
        </div>
      `;
      card.addEventListener("click", () => openProject(project.slug, true));
      grid.appendChild(card);
    });
  }

  function syncFilterChips() {
    document.querySelectorAll(".filter-chip").forEach((chip) => {
      const tag = chip.dataset.filter;
      const on = tag === "All" ? activeTags.length === 0 : activeTags.includes(tag);
      chip.classList.toggle("is-active", on);
      chip.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setFilters(tags, updateHistory) {
    activeTags = ALLOWED_TAGS.filter((tag) => tags.includes(tag));
    syncFilterChips();
    renderGrid();
    if (updateHistory) updateFilterUrl(true);
  }

  function toggleFilter(filter) {
    if (filter === "All") {
      setFilters([], true);
      return;
    }
    const next = activeTags.includes(filter)
      ? activeTags.filter((tag) => tag !== filter)
      : activeTags.concat(filter);
    setFilters(next, true);
  }

  function renderBody(body) {
    if (!body) return "";
    if (/<[a-z][\s\S]*>/i.test(body)) return body;
    return String(body)
      .split(/\n{2,}/)
      .map((part) => `<p>${escapeHtml(part.trim()).replace(/\n/g, "<br>")}</p>`)
      .join("");
  }

  function renderVideos(videos) {
    if (!videos || !videos.length) return "";
    const frames = videos
      .map((item) => {
        const url = typeof item === "string" ? item : item.url || item.src || "";
        if (!url) return "";
        const yt = youtubeId(url);
        if (yt) {
          return `<iframe class="video-frame" src="https://www.youtube.com/embed/${yt}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
        }
        const vimeo = vimeoId(url);
        if (vimeo) {
          return `<iframe class="video-frame" src="https://player.vimeo.com/video/${vimeo}" title="Vimeo video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
        }
        if (!isSafeUrl(url) && !url.startsWith("assets/")) return "";
        return `<video controls preload="metadata" src="${escapeHtml(url)}"></video>`;
      })
      .filter(Boolean)
      .join("");
    return frames ? `<div class="media-block"><h3>Video</h3>${frames}</div>` : "";
  }

  function renderImages(images) {
    if (!images || !images.length) return "";
    const figs = images
      .map((src) => `<img src="${escapeHtml(src)}" alt="" />`)
      .join("");
    return `<div class="media-block"><h3>Images</h3><div class="image-gallery">${figs}</div></div>`;
  }

  function renderAudio(audio) {
    if (!audio || !audio.length) return "";
    const players = audio
      .map((src) => {
        const path = typeof src === "string" ? src : src.src || "";
        const label = typeof src === "object" && src.title ? escapeHtml(src.title) : "";
        return `<div class="audio-item">${label ? `<p>${label}</p>` : ""}<audio controls preload="metadata" src="${escapeHtml(path)}"></audio></div>`;
      })
      .join("");
    return `<div class="media-block"><h3>Audio</h3>${players}</div>`;
  }

  function findProject(slug) {
    return projects.find((project) => project.slug === slug);
  }

  function openProject(slug, updateHash) {
    const project = findProject(slug);
    if (!project) return;

    const tags = (project.tags || [])
      .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
      .join("");

    overlayBody.innerHTML = `
      <h2 id="overlay-title">${escapeHtml(project.title || "Untitled")}</h2>
      <div class="overlay-tags">${tags}</div>
      <div class="overlay-copy">${renderBody(project.body)}</div>
      ${renderImages(project.images)}
      ${renderVideos(project.videos)}
      ${renderAudio(project.audio)}
    `;

    overlay.hidden = false;
    document.body.classList.add("overlay-open");
    overlay.querySelector(".overlay-close")?.focus();
    if (updateHash) {
      history.pushState(
        { project: slug, tags: activeTags.slice() },
        "",
        currentUrl("#project/" + encodeURIComponent(slug))
      );
    }
  }

  function closeOverlay(updateHash) {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove("overlay-open");
    overlayBody.innerHTML = "";
    if (updateHash && location.hash.startsWith("#project/")) {
      history.pushState({ tags: activeTags.slice() }, "", currentUrl(""));
    }
  }

  function applyUrlState() {
    activeTags = tagsFromUrl();
    syncFilterChips();
    renderGrid();

    const hash = decodeURIComponent(location.hash || "");
    const match = hash.match(/^#project\/(.+)$/);
    if (match) {
      const project = findProject(match[1]);
      if (project) {
        openProject(project.slug, false);
        return;
      }
    }
    closeOverlay(false);
  }

  function showLoadError(message) {
    grid.innerHTML = `<p class="load-error">${escapeHtml(message)}</p>`;
  }

  navToggle?.addEventListener("click", () => {
    const open = header.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  document.querySelectorAll(".site-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });

  document.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.addEventListener("click", () => toggleFilter(chip.dataset.filter));
  });

  overlay.addEventListener("click", (event) => {
    if (event.target.closest("[data-overlay-close]")) {
      closeOverlay(true);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!overlay.hidden) closeOverlay(true);
      header.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("popstate", applyUrlState);

  fetch(DATA_URL)
    .then((response) => {
      if (!response.ok) throw new Error("Could not load projects.");
      return response.json();
    })
    .then((data) => {
      projects = Array.isArray(data) ? data : data.projects || [];
      applyUrlState();
    })
    .catch(() => {
      const protocol = window.location.protocol;
      if (protocol === "file:") {
        showLoadError(
          "This page needs a local server so project data can load. From the project folder run: python3 -m http.server 8080 — then open http://localhost:8080"
        );
      } else {
        showLoadError("Projects could not be loaded. Check data/projects.json.");
      }
    });
})();
