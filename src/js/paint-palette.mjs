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

  colors.forEach((color) => {
    const swatch = document.createElement("article");

    swatch.className =
      "overflow-hidden rounded-xl border border-slate-700 bg-slate-900";

    swatch.innerHTML = `
      <div
        class="h-40 w-full"
        style="background-color: ${color.hex.value}"
      ></div>

      <div class="p-4">
        <h3 class="font-bold text-white">
          ${color.name.value}
        </h3>

        <p class="mt-1 text-sm text-slate-300">
          ${color.hex.value}
        </p>

        <p class="mt-1 text-sm text-slate-400">
          ${color.rgb.value}
        </p>
      </div>
    `;

    paletteResults.appendChild(swatch);
  });
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
