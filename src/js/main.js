import "../css/style.css";
import { loadHeaderFooter } from "./utils.mjs";

function setupMobileMenu() {
  const menuButton = document.querySelector("#menuButton");
  const mobileMenu = document.querySelector("#mobileMenu");

  if (!menuButton || !mobileMenu) {
    return;
  }

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute("aria-expanded", String(!isOpen));
    mobileMenu.classList.toggle("hidden");
  });
}

async function init() {
  const savedTheme = localStorage.getItem("theme") || "dark";

  applyTheme(savedTheme);

  await loadHeaderFooter();

  setupMobileMenu();
  setupFooter();
  setupThemePicker();
}

function setupFooter() {
  const copyrightYear = document.querySelector("#copyrightYear");

  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function setupThemePicker() {
  const themePicker = document.querySelector("#themePicker");

  if (!themePicker) {
    return;
  }

  const savedTheme = localStorage.getItem("theme") || "dark";

  themePicker.value = savedTheme;

  themePicker.addEventListener("change", () => {
    const selectedTheme = themePicker.value;

    applyTheme(selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });
}

init();
