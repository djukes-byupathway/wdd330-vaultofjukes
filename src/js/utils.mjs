// Wrapper for querySelector
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// Retrieve JSON data from localStorage
export function getLocalStorage(key, fallback = null) {
  const data = localStorage.getItem(key);

  if (!data) {
    return fallback;
  }

  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

// Save JSON data to localStorage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Remove an item from localStorage
export function removeLocalStorage(key) {
  localStorage.removeItem(key);
}

// Render a list using a template function
export function renderListWithTemplate(
  template,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  const htmlStrings = list.map(template);

  if (clear) {
    parentElement.innerHTML = "";
  }

  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

// Render a single template
export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;

  if (callback) {
    callback(data);
  }
}

// Load an HTML partial
async function loadTemplate(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Unable to load template: ${path}`);
  }

  return response.text();
}

// Load shared header and footer
export async function loadHeaderFooter() {
  const headerElement = qs("#main-header");
  const footerElement = qs("#main-footer");

  const [headerTemplate, footerTemplate] = await Promise.all([
    loadTemplate("/partials/header.html"),
    loadTemplate("/partials/footer.html"),
  ]);

  if (headerElement) {
    renderWithTemplate(headerTemplate, headerElement);
  }

  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
}
