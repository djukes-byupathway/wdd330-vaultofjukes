const gameSystem = document.querySelector("#gameSystem");
// most system formerly called the next line race, but will go along with the times I guess
const ancestry = document.querySelector("#ancestry");
const ancestryLabel = document.querySelector("#ancestryLabel");
const attributeResults = document.querySelector("#attributeResults");
const rollAttributesButton = document.querySelector("#rollAttributes");
const gender = document.querySelector("#gender");
const characterName = document.querySelector("#characterName");
const generateNameButton = document.querySelector("#generateName");

let systems = [];

async function loadCharacterSystems() {
  const response = await fetch("/data/character-systems.json");

  if (!response.ok) {
    throw new Error("Unable to load character systems.");
  }

  const data = await response.json();
  systems = data.systems;
}

function getSelectedSystem() {
  return systems.find((system) => system.id === gameSystem.value);
}

function displayAncestries(system) {
  ancestry.innerHTML = '<option value="">Choose an option</option>';

  ancestryLabel.textContent = system.ancestryLabel;

  system.ancestries.forEach((item) => {
    const option = document.createElement("option");

    option.value = item.toLowerCase().replaceAll(" ", "-");
    option.textContent = item;

    ancestry.appendChild(option);
  });
}

function displayAttributes(system) {
  attributeResults.innerHTML = "";

  system.attributes.forEach((attribute) => {
    const container = document.createElement("div");

    container.className =
      "rounded-lg border border-slate-700 bg-slate-800 p-4 text-center";

    container.innerHTML = `
      <p class="font-semibold text-slate-300">${attribute.label}</p>
      <p
        id="${attribute.name}"
        class="mt-2 text-3xl font-bold text-purple-400"
      >
        --
      </p>
    `;

    attributeResults.appendChild(container);
  });
}

gameSystem.addEventListener("change", () => {
  const selectedSystem = getSelectedSystem();

  if (!selectedSystem) {
    ancestry.innerHTML = '<option value="">Choose an option</option>';
    attributeResults.innerHTML =
      '<p class="text-slate-400">Choose a game system to see its attributes.</p>';

    return;
  }

  displayAncestries(selectedSystem);
  displayAttributes(selectedSystem);
});

async function rollDice(formula) {
  // rolz.org is the source for the dice rolling api I selected
  //unfortunately I found an api that returns text and not json, but here we go
  const response = await fetch(`https://rolz.org/api/?${formula}.simple`);

  if (!response.ok) {
    throw new Error("Unable to roll dice.");
  }

  // use text and not json to grab the value out of response
  const result = await response.text();

  return Number(result.trim());
}

async function rollAttributes(system) {
  for (const attribute of system.attributes) {
    const result = await rollDice(system.diceFormula);

    const element = document.querySelector(`#${attribute.name}`);

    if (element) {
      element.textContent = result;
    }
  }
}

rollAttributesButton.addEventListener("click", async () => {
  const selectedSystem = getSelectedSystem();

  if (!selectedSystem) {
    return;
  }

  try {
    rollAttributesButton.disabled = true;
    rollAttributesButton.textContent = "Rolling...";

    await rollAttributes(selectedSystem);
  } catch (error) {
    alert(error.message);
  } finally {
    rollAttributesButton.disabled = false;
    rollAttributesButton.textContent = "Roll Attributes";
  }
});

function getNameAncestryCode() {
  const ancestryCodes = {
    human: "h",
    elf: "e",
    dwarf: "d",
    orc: "o",
  };

  return ancestryCodes[ancestry.value];
}

async function generateFantasyName() {
  const url = new URL("https://fantasyname.lukewh.com/");

  const ancestryCode = getNameAncestryCode();

  if (ancestryCode) {
    url.searchParams.set("ancestry", ancestryCode);
  }

  if (gender.value) {
    url.searchParams.set("gender", gender.value);
  }

  url.searchParams.set("family", "t");

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to generate a character name.");
  }

  const name = await response.text();

  return name.trim();
}

generateNameButton.addEventListener("click", async () => {
  try {
    generateNameButton.disabled = true;
    generateNameButton.textContent = "Generating...";

    const name = await generateFantasyName();

    characterName.value = name;
  } catch (error) {
    alert(error.message);
  } finally {
    generateNameButton.disabled = false;
    generateNameButton.textContent = "Generate Random Name";
  }
});

loadCharacterSystems();
