import { qs } from "./utils.mjs";

const primaryColor = qs("#primaryColor");
const selectedHex = qs("#selectedHex");
const paletteMode = qs("#paletteMode");
const generatePaletteButton = qs("#generatePalette");
const paletteResults = qs("#paletteResults");

/**
 * Keep the displayed hex value synced with the color picker.
 */
primaryColor.addEventListener("input", () => {
  selectedHex.textContent = primaryColor.value.toUpperCase();
});

/**
 * Request a five-color palette from The Color API.
 */
async function fetchPalette(color, mode) {
  const cleanHex = color.replace("#", "");

  const url = new URL("https://www.thecolorapi.com/scheme");

  url.searchParams.set("hex", cleanHex);
  url.searchParams.set("mode", mode);
  url.searchParams.set("count", "5");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to generate the color palette.");
  }

  return response.json();
}

/**
 * Create the conic-gradient string used for the palette wheel.
 */
function createGradient(colors) {
  const sliceSize = 100 / colors.length;

  return colors
    .map((color, index) => {
      const start = index * sliceSize;
      const end = (index + 1) * sliceSize;

      return `${color.hex.value} ${start}% ${end}%`;
    })
    .join(", ");
}

/**
 * Create the circular palette wheel.
 */
function createPaletteWheel(colors) {
  const paletteWheel = document.createElement("div");

  paletteWheel.className =
    "palette-wheel relative flex h-80 w-80 items-center justify-center rounded-full border-4 border-slate-200 dark:border-slate-700";

  paletteWheel.style.background = `conic-gradient(${createGradient(colors)})`;

  paletteWheel.setAttribute("role", "img");

  paletteWheel.setAttribute(
    "aria-label",
    `Color palette containing ${colors
      .map((color) => color.name.value)
      .join(", ")}`,
  );

  const center = document.createElement("div");

  center.className =
    "h-32 w-32 rounded-full border-4 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950";

  paletteWheel.appendChild(center);

  return paletteWheel;
}

/**
 * Create one color reference item.
 */
function createColorItem(color) {
  const colorItem = document.createElement("div");

  colorItem.className = "text-center";

  const swatch = document.createElement("div");

  swatch.className =
    "mx-auto mb-2 h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600";

  swatch.style.backgroundColor = color.hex.value;

  const colorName = document.createElement("p");

  colorName.className = "text-sm font-semibold text-slate-900 dark:text-white";

  colorName.textContent = color.name.value;

  const hexValue = document.createElement("p");

  hexValue.className = "text-sm text-slate-500 dark:text-slate-400";

  hexValue.textContent = color.hex.value;

  colorItem.appendChild(swatch);
  colorItem.appendChild(colorName);
  colorItem.appendChild(hexValue);

  return colorItem;
}

/**
 * Create the list of color names and hex values.
 */
function createColorList(colors) {
  const colorList = document.createElement("div");

  colorList.className =
    "grid w-full max-w-3xl gap-3 sm:grid-cols-2 md:grid-cols-5";

  colors.forEach((color) => {
    colorList.appendChild(createColorItem(color));
  });

  return colorList;
}

/**
 * Display the generated palette.
 */
function displayPalette(colors) {
  paletteResults.innerHTML = "";

  const paletteWheel = createPaletteWheel(colors);
  const colorList = createColorList(colors);

  paletteResults.appendChild(paletteWheel);
  paletteResults.appendChild(colorList);
}

/**
 * Generate a new palette.
 */
generatePaletteButton.addEventListener("click", async () => {
  try {
    generatePaletteButton.disabled = true;
    generatePaletteButton.textContent = "Generating...";

    const data = await fetchPalette(primaryColor.value, paletteMode.value);

    displayPalette(data.colors);
  } catch (error) {
    paletteResults.innerHTML = `
      <p class="text-red-600 dark:text-red-400">
        ${error.message}
      </p>
    `;
  } finally {
    generatePaletteButton.disabled = false;
    generatePaletteButton.textContent = "Generate Palette";
  }
});
