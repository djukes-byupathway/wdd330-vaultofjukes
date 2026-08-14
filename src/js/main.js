import "../css/style.css";

import {
  getLocalStorage,
  loadHeaderFooter,
  qs,
  setLocalStorage,
} from "./utils.mjs";

const THEME_KEY = "theme";
const DEFAULT_THEME = "dark";

/**
 * Apply the selected theme to the document.
 */
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

/**
 * Get the saved theme or use dark mode by default.
 */
function getSavedTheme() {
  const theme = getLocalStorage(THEME_KEY, DEFAULT_THEME);

  if (theme === "light" || theme === "dark") {
    return theme;
  }

  return DEFAULT_THEME;
}

/**
 * Set up the light/dark theme picker.
 */
function setupThemePicker(savedTheme) {
  const themePicker = qs("#themePicker");

  if (!themePicker) {
    return;
  }

  themePicker.value = savedTheme;

  themePicker.addEventListener("change", () => {
    const selectedTheme = themePicker.value;

    applyTheme(selectedTheme);
    setLocalStorage(THEME_KEY, selectedTheme);
  });
}

/**
 * Set up the mobile navigation menu.
 */
function setupMobileMenu() {
  const menuButton = qs("#menuButton");
  const mobileMenu = qs("#mobileMenu");

  if (!menuButton || !mobileMenu) {
    return;
  }

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";

    menuButton.setAttribute("aria-expanded", String(!isOpen));

    mobileMenu.classList.toggle("hidden");
  });
}

/**
 * Add the current year to the footer.
 */
function setupFooter() {
  const copyrightYear = qs("#copyrightYear");

  if (copyrightYear) {
    copyrightYear.textContent = new Date().getFullYear();
  }
}

/**
 * Initialize shared site features.
 */
async function init() {
  const savedTheme = getSavedTheme();

  /*
   * Apply the theme before loading the header/footer
   * so the page begins in the correct theme.
   */
  applyTheme(savedTheme);

  await loadHeaderFooter();

  /*
   * These elements are inside the loaded partials,
   * so they must be set up after loadHeaderFooter().
   */
  setupMobileMenu();
  setupFooter();
  setupThemePicker(savedTheme);
}

init();
