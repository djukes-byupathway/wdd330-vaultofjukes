const primaryColor = document.querySelector("#primaryColor");
const selectedHex = document.querySelector("#selectedHex");
const paletteMode = document.querySelector("#paletteMode");
const generatePaletteButton = document.querySelector("#generatePalette");
const paletteResults = document.querySelector("#paletteResults");

primaryColor.addEventListener("input", () => {
  selectedHex.textContent = primaryColor.value;
});

selectedHex.addEventListener("change", () => {
  primaryColor.value = selectedHex.value;
});

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

function displayPalette(colors) {
  paletteResults.innerHTML = "";

  const paletteWheel = document.createElement("div");

  const sliceSize = 100 / colors.length;

  const gradientColors = colors
    .map((color, index) => {
      const start = index * sliceSize;
      const end = (index + 1) * sliceSize;

      return `${color.hex.value} ${start}% ${end}%`;
    })
    .join(", ");

  paletteWheel.className =
    "palette-wheel h-80 w-80 rounded-full border-4 border-slate-200 dark:border-slate-700";

  paletteWheel.style.background = `conic-gradient(${gradientColors})`;

  paletteWheel.classList.add(
    "relative",
    "flex",
    "items-center",
    "justify-center",
  );

  const center = document.createElement("div");

  center.className =
    "h-32 w-32 rounded-full bg-slate-950 border-4 border-slate-200 dark:border-slate-700";

  paletteWheel.appendChild(center);

  const colorList = document.createElement("div");

  colorList.className =
    "grid w-full max-w-3xl gap-3 sm:grid-cols-2 md:grid-cols-5";

  colors.forEach((color) => {
    const colorItem = document.createElement("div");

    colorItem.className = "text-center";

    colorItem.innerHTML = `
      <div
        class="mx-auto mb-2 h-8 w-8 rounded-full border border-slate-600"
        style="background-color: ${color.hex.value}"
      ></div>

      <p class="text-sm font-semibold text-slate-900 dark:text-white">
        ${color.name.value}
      </p>

      <p class="text-sm text-slate-500 dark:text-slate-400">
        ${color.hex.value}
      </p>
    `;

    colorList.appendChild(colorItem);
  });

  paletteResults.appendChild(paletteWheel);
  paletteResults.appendChild(colorList);
}

generatePaletteButton.addEventListener("click", async () => {
  try {
    generatePaletteButton.disabled = true;
    generatePaletteButton.textContent = "Generating...";

    const data = await fetchPalette(primaryColor.value, paletteMode.value);

    displayPalette(data.colors);
  } catch (error) {
    paletteResults.innerHTML = `
      <p class="text-red-400">
        ${error.message}
      </p>
    `;
  } finally {
    generatePaletteButton.disabled = false;
    generatePaletteButton.textContent = "Generate Palette";
  }
});
