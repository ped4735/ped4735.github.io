const app = document.querySelector("#app");
const sidebarToggle = document.querySelector("#sidebar-toggle");
const mobileMenuButton = document.querySelector("#mobile-menu-button");
const sidebarBackdrop = document.querySelector("#sidebar-backdrop");
const menuElement = document.querySelector("#menu");
const menuTitle = document.querySelector("#menu-title");
const pageTitle = document.querySelector("#page-title");
const pageFrame = document.querySelector("#page-frame");
const viewerLoading = document.querySelector("#viewer-loading");
const viewerMessage = document.querySelector("#viewer-message");
const messageTitle = document.querySelector("#message-title");
const messageText = document.querySelector("#message-text");
const retryButton = document.querySelector("#retry-button");
const openPage = document.querySelector("#open-page");

let menuConfig = null;
let pagesById = new Map();
let currentPageId = "";

async function removeLegacyRootCacheEntries(appRoot) {
  if (!("caches" in window)) {
    return;
  }

  const legacyUrls = [appRoot, new URL("index.html", appRoot).href];
  const cacheNames = await window.caches.keys();

  await Promise.all(
    cacheNames
      .filter((cacheName) => cacheName.startsWith("jogo-matematica-"))
      .map(async (cacheName) => {
        const cache = await window.caches.open(cacheName);
        await Promise.all(legacyUrls.map((url) => cache.delete(url)));
      })
  );
}

async function cleanupLegacyRootServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const appRoot = new URL("./", document.baseURI).href;
    const registrations = await navigator.serviceWorker.getRegistrations();
    const rootRegistrations = registrations.filter(
      (registration) => registration.scope === appRoot
    );

    if (!rootRegistrations.length) {
      sessionStorage.removeItem("serviceWorkerLegadoRemovido");
      return false;
    }

    await Promise.all(rootRegistrations.map((registration) => registration.unregister()));
    await removeLegacyRootCacheEntries(appRoot);

    if (
      navigator.serviceWorker.controller &&
      sessionStorage.getItem("serviceWorkerLegadoRemovido") !== "true"
    ) {
      sessionStorage.setItem("serviceWorkerLegadoRemovido", "true");
      window.location.reload();
      return true;
    }

    sessionStorage.removeItem("serviceWorkerLegadoRemovido");
  } catch (error) {
    console.warn("Não foi possível remover o service worker legado:", error);
  }

  return false;
}

function isMobile() {
  return window.matchMedia("(max-width: 820px)").matches;
}

function getPageIdFromHash() {
  const params = new URLSearchParams(window.location.hash.slice(1));
  return params.get("pagina") || "";
}

function setSidebarCollapsed(collapsed) {
  app.classList.toggle("sidebar-collapsed", collapsed);
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
  sidebarToggle.setAttribute("aria-label", collapsed ? "Expandir menu" : "Recolher menu");
  localStorage.setItem("menuRecolhido", String(collapsed));
}

function setMobileMenu(open) {
  app.classList.toggle("mobile-menu-open", open);
  mobileMenuButton.setAttribute("aria-expanded", String(open));
}

function normalizeId(value, fallback) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || fallback;
}

function isSafePagePath(path) {
  if (typeof path !== "string" || !path.trim()) {
    return false;
  }

  try {
    const target = new URL(path, window.location.href);
    return target.origin === window.location.origin && /\.html?(?:$|[?#])/i.test(target.href);
  } catch (error) {
    return false;
  }
}

function pageIcon(item) {
  const requestedIcon = String(item.icone || "").trim();
  return (requestedIcon || String(item.nome || "P").charAt(0)).slice(0, 2).toUpperCase();
}

function groupIcon(item, level) {
  const requestedIcon = String(item.icone || "").trim();
  return requestedIcon || (level === 0 ? "◇" : "·");
}

function collectPages(items, path = []) {
  items.forEach((item, index) => {
    if (Array.isArray(item.itens)) {
      collectPages(item.itens, path.concat(item.nome || `grupo-${index + 1}`));
      return;
    }

    if (!item.nome || !isSafePagePath(item.arquivo)) {
      return;
    }

    const baseId = normalizeId(item.id || item.nome, `pagina-${pagesById.size + 1}`);
    let uniqueId = baseId;
    let suffix = 2;

    while (pagesById.has(uniqueId)) {
      uniqueId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    pagesById.set(uniqueId, { ...item, id: uniqueId, caminho: path });
  });
}

function createPageItem(item) {
  const page = pagesById.get(item.__resolvedId);
  const listItem = document.createElement("li");
  listItem.className = "menu-page";

  const link = document.createElement("a");
  link.className = "menu-link";
  link.href = `#pagina=${encodeURIComponent(page.id)}`;
  link.dataset.pageId = page.id;
  link.title = page.nome;

  const icon = document.createElement("span");
  icon.className = "menu-icon";
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = pageIcon(page);

  const label = document.createElement("span");
  label.className = "menu-link-text";
  label.textContent = page.nome;

  link.append(icon, label);
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo(page.id, true);
  });
  listItem.appendChild(link);
  return listItem;
}

function createGroupItem(item, level) {
  const listItem = document.createElement("li");
  listItem.className = "menu-group";

  const button = document.createElement("button");
  button.className = "group-button";
  button.type = "button";
  button.title = item.nome || "Grupo";

  const symbol = document.createElement("span");
  symbol.className = "group-symbol";
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = groupIcon(item, level);

  const label = document.createElement("span");
  label.className = "group-label";
  label.textContent = item.nome || "Grupo";

  const chevron = document.createElement("span");
  chevron.className = "group-chevron";
  chevron.setAttribute("aria-hidden", "true");

  const submenu = document.createElement("ul");
  submenu.className = "submenu";
  const groupId = `grupo-${normalizeId(item.nome, "menu")}-${Math.random().toString(36).slice(2, 7)}`;
  submenu.id = groupId;

  const expanded = item.aberto !== false;
  button.setAttribute("aria-expanded", String(expanded));
  button.setAttribute("aria-controls", groupId);
  submenu.hidden = !expanded;

  button.append(symbol, label, chevron);
  button.addEventListener("click", () => {
    const willExpand = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(willExpand));
    submenu.hidden = !willExpand;
  });

  buildMenuItems(item.itens, submenu, level + 1);
  listItem.append(button, submenu);
  return listItem;
}

function buildMenuItems(items, container, level = 0) {
  items.forEach((item) => {
    if (Array.isArray(item.itens)) {
      container.appendChild(createGroupItem(item, level));
      return;
    }

    if (item.__resolvedId && pagesById.has(item.__resolvedId)) {
      container.appendChild(createPageItem(item));
    }
  });
}

function resolveMenuPageIds(items) {
  const unmatchedPages = Array.from(pagesById.values());

  function visit(nodes) {
    nodes.forEach((item) => {
      if (Array.isArray(item.itens)) {
        visit(item.itens);
        return;
      }

      const matchIndex = unmatchedPages.findIndex(
        (page) => page.nome === item.nome && page.arquivo === item.arquivo
      );

      if (matchIndex >= 0) {
        item.__resolvedId = unmatchedPages[matchIndex].id;
        unmatchedPages.splice(matchIndex, 1);
      }
    });
  }

  visit(items);
}

function renderMenu(config) {
  menuElement.replaceChildren();
  const list = document.createElement("ul");
  list.className = "menu-list";
  buildMenuItems(config.itens, list);
  menuElement.appendChild(list);
}

function updateActiveLink(pageId) {
  document.querySelectorAll(".menu-link").forEach((link) => {
    const isActive = link.dataset.pageId === pageId;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
      let parent = link.closest(".submenu");
      while (parent) {
        parent.hidden = false;
        const button = document.querySelector(`[aria-controls="${parent.id}"]`);
        if (button) {
          button.setAttribute("aria-expanded", "true");
        }
        parent = parent.parentElement.closest(".submenu");
      }
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function showMessage(title, text) {
  viewerLoading.hidden = true;
  pageFrame.hidden = true;
  viewerMessage.hidden = false;
  messageTitle.textContent = title;
  messageText.textContent = text;
}

function navigateTo(pageId, updateHash) {
  const page = pagesById.get(pageId);
  if (!page) {
    const fallbackId = menuConfig && pagesById.has(menuConfig.paginaInicial)
      ? menuConfig.paginaInicial
      : pagesById.keys().next().value;

    if (fallbackId) {
      navigateTo(fallbackId, true);
    } else {
      showMessage("Nenhuma página configurada", "Adicione ao menos um item válido no arquivo menu.json.");
    }
    return;
  }

  currentPageId = page.id;
  updateActiveLink(page.id);
  pageTitle.textContent = page.nome;
  document.title = `${page.nome} — ${menuConfig.titulo}`;
  openPage.href = page.arquivo;
  pageFrame.title = page.nome;
  viewerMessage.hidden = true;
  viewerLoading.hidden = false;
  pageFrame.hidden = true;

  if (pageFrame.getAttribute("src") !== page.arquivo) {
    pageFrame.src = page.arquivo;
  } else {
    viewerLoading.hidden = true;
    pageFrame.hidden = false;
  }

  if (updateHash && getPageIdFromHash() !== page.id) {
    window.location.hash = `pagina=${encodeURIComponent(page.id)}`;
  }

  if (isMobile()) {
    setMobileMenu(false);
  }
}

async function loadMenu() {
  try {
    viewerMessage.hidden = true;
    viewerLoading.hidden = false;

    const response = await fetch("menu.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`menu.json respondeu com status ${response.status}`);
    }

    const config = await response.json();
    if (!config || !Array.isArray(config.itens)) {
      throw new Error("A propriedade itens não foi encontrada");
    }

    menuConfig = {
      titulo: String(config.titulo || "Meus projetos"),
      paginaInicial: normalizeId(config.paginaInicial || "", ""),
      itens: config.itens,
    };

    pagesById = new Map();
    collectPages(menuConfig.itens);
    resolveMenuPageIds(menuConfig.itens);

    if (!pagesById.size) {
      throw new Error("Nenhuma página HTML válida foi configurada");
    }

    menuTitle.textContent = menuConfig.titulo;
    renderMenu(menuConfig);
    navigateTo(getPageIdFromHash() || menuConfig.paginaInicial, false);
  } catch (error) {
    console.error("Erro ao carregar menu.json:", error);
    menuElement.replaceChildren();
    pageTitle.textContent = "Menu indisponível";
    showMessage(
      "Não foi possível carregar o menu",
      window.location.protocol === "file:"
        ? "Abra este projeto por um servidor local ou pelo GitHub Pages; navegadores bloqueiam a leitura do menu.json quando o index.html é aberto diretamente."
        : "Confira a sintaxe e os caminhos informados no arquivo menu.json."
    );
  }
}

pageFrame.addEventListener("load", () => {
  if (!currentPageId) {
    return;
  }
  viewerLoading.hidden = true;
  pageFrame.hidden = false;
});

sidebarToggle.addEventListener("click", () => {
  setSidebarCollapsed(!app.classList.contains("sidebar-collapsed"));
});

mobileMenuButton.addEventListener("click", () => {
  setMobileMenu(!app.classList.contains("mobile-menu-open"));
});

sidebarBackdrop.addEventListener("click", () => setMobileMenu(false));
retryButton.addEventListener("click", loadMenu);

window.addEventListener("hashchange", () => {
  const requestedPage = getPageIdFromHash();
  if (requestedPage && requestedPage !== currentPageId) {
    navigateTo(requestedPage, false);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMobileMenu(false);
  }
});

async function startApp() {
  const reloadingAfterCleanup = await cleanupLegacyRootServiceWorker();
  if (reloadingAfterCleanup) {
    return;
  }

  if (!isMobile() && localStorage.getItem("menuRecolhido") === "true") {
    setSidebarCollapsed(true);
  }

  loadMenu();
}

startApp();
