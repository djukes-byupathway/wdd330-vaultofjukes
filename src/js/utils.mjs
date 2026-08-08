async function loadTemplate(path) {
  const res = await fetch(path);

  // check to make sure we get a result back
  if (!res.ok) {
    throw new Error(`Unable to load ${path}`);
  }
  const template = await res.text();
  return template;
}

export async function loadHeaderFooter() {
  const header = document.querySelector("#main-header");
  const footer = document.querySelector("#main-footer");

  if (header) {
    header.innerHTML = await loadTemplate("/partials/header.html");
  }

  if (footer) {
    footer.innerHTML = await loadTemplate("/partials/footer.html");
  }
}
