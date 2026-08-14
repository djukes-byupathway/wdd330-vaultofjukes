const STORAGE_KEY = "vaultCharacters";
const MAX_CHARACTERS = 5;

const savedCharacters = document.querySelector("#savedCharacters");
const savedCount = document.querySelector("#savedCount");
const newCharacterButton = document.querySelector("#newCharacter");

const characterEditor = document.querySelector("#characterEditor");
const editorTitle = document.querySelector("#editorTitle");
const closeEditorButton = document.querySelector("#closeEditor");

const characterName = document.querySelector("#characterName");
const gameSystem = document.querySelector("#gameSystem");

const ancestry = document.querySelector("#ancestry");
const ancestryLabel = document.querySelector("#ancestryLabel");

const characterClass = document.querySelector("#characterClass");
const classLabel = document.querySelector("#classLabel");

const classSuggestionBox = document.querySelector("#classSuggestionBox");
const classSuggestion = document.querySelector("#classSuggestion");
const useSuggestionButton = document.querySelector("#useSuggestion");

const attributeResults = document.querySelector("#attributeResults");
const rollAttributesButton = document.querySelector("#rollAttributes");

const saveCharacterButton = document.querySelector("#saveCharacter");
const editorMessage = document.querySelector("#editorMessage");

let systems = [];

let currentCharacterId = null;
let currentScores = {};

let currentSuggestion = null;
let currentHighestAttribute = null;
let currentHighestScore = null;

/**
 * Load character system data.
 */
async function getSystems() {
  const response = await fetch("/data/character-systems.json");

  if (!response.ok) {
    throw new Error("Unable to load character systems.");
  }

  const data = await response.json();

  return data.systems;
}

/**
 * Get saved characters from localStorage.
 */
function getSavedCharacters() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const characters = JSON.parse(saved);

    return Array.isArray(characters) ? characters : [];
  } catch {
    return [];
  }
}

/**
 * Save the entire character array to localStorage.
 */
function saveCharacters(characters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

/**
 * Find the currently selected system.
 */
function getSelectedSystem() {
  return systems.find((system) => system.id === gameSystem.value);
}

/**
 * Display available game systems.
 */
function displaySystems() {
  gameSystem.innerHTML = `
    <option value="">
      Choose a game system
    </option>
  `;

  systems.forEach((system) => {
    const option = document.createElement("option");

    option.value = system.id;
    option.textContent = system.name;

    gameSystem.appendChild(option);
  });
}

/**
 * Display ancestry, species, or character-type options.
 */
function displayAncestries(system) {
  ancestry.innerHTML = "";

  ancestryLabel.textContent = system.ancestryLabel;

  const defaultOption = document.createElement("option");

  defaultOption.value = "";
  defaultOption.textContent = `Choose ${system.ancestryLabel.toLowerCase()}`;

  ancestry.appendChild(defaultOption);

  system.ancestries.forEach((item) => {
    const option = document.createElement("option");

    option.value = item;
    option.textContent = item;

    ancestry.appendChild(option);
  });

  ancestry.disabled = false;
}

/**
 * Display class or hero-style options.
 */
function displayClasses(system) {
  characterClass.innerHTML = "";

  const label = system.classLabel ?? "Class";

  classLabel.textContent = label;

  const defaultOption = document.createElement("option");

  defaultOption.value = "";
  defaultOption.textContent = `Choose ${label.toLowerCase()}`;

  characterClass.appendChild(defaultOption);

  system.classes.forEach((item) => {
    const option = document.createElement("option");

    option.value = item;
    option.textContent = item;

    characterClass.appendChild(option);
  });

  characterClass.disabled = false;
}

/**
 * Display attribute cards.
 */
function displayAttributes(system) {
  attributeResults.innerHTML = "";

  system.attributes.forEach((attribute) => {
    const card = document.createElement("div");

    card.className =
      "rounded-lg border border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800";

    const label = document.createElement("p");

    label.className =
      "text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

    label.textContent = attribute.label;

    const score = document.createElement("p");

    score.id = attribute.name;
    score.className =
      "mt-2 text-4xl font-bold text-purple-600 dark:text-purple-400";
    score.textContent = "-";

    card.appendChild(label);
    card.appendChild(score);

    attributeResults.appendChild(card);
  });
}

/**
 * Reset ancestry.
 */
function resetAncestry() {
  ancestryLabel.textContent = "Ancestry";

  ancestry.innerHTML = `
    <option value="">
      Choose a game system first
    </option>
  `;

  ancestry.disabled = true;
}

/**
 * Reset class or hero style.
 */
function resetClasses() {
  classLabel.textContent = "Class";

  characterClass.innerHTML = `
    <option value="">
      Choose a game system first
    </option>
  `;

  characterClass.disabled = true;
}

/**
 * Reset attribute area.
 */
function resetAttributes() {
  currentScores = {};

  attributeResults.innerHTML = `
    <p class="text-slate-500 dark:text-slate-400">
      Choose a game system to see its attributes.
    </p>
  `;

  rollAttributesButton.disabled = true;
  rollAttributesButton.textContent = "Roll Attributes";

  saveCharacterButton.disabled = true;
}

/**
 * Reset the Vault suggestion.
 */
function resetSuggestion() {
  currentSuggestion = null;
  currentHighestAttribute = null;
  currentHighestScore = null;

  classSuggestion.textContent = "";
  useSuggestionButton.textContent = "Use Suggestion";

  classSuggestionBox.classList.add("hidden");
}

/**
 * Display a message beneath the save area.
 */
function showMessage(message, type = "error") {
  editorMessage.textContent = message;

  if (type === "success") {
    editorMessage.className =
      "mt-4 text-sm font-semibold text-green-700 dark:text-green-400";
  } else {
    editorMessage.className =
      "mt-4 text-sm font-semibold text-red-700 dark:text-red-400";
  }
}

/**
 * Clear editor messages.
 */
function clearMessage() {
  editorMessage.textContent = "";
  editorMessage.className = "mt-4 hidden text-sm font-semibold";
}

/**
 * Reset the entire character editor.
 */
function resetEditor() {
  currentCharacterId = null;
  currentScores = {};

  characterName.value = "";
  gameSystem.value = "";

  editorTitle.textContent = "Create New Character";

  resetAncestry();
  resetClasses();
  resetAttributes();
  resetSuggestion();
  clearMessage();
}

/**
 * Open the editor.
 */
function showEditor() {
  characterEditor.classList.remove("hidden");

  characterEditor.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/**
 * Close the editor.
 */
function closeEditor() {
  characterEditor.classList.add("hidden");

  resetEditor();
}

/**
 * Create a new character.
 */
function createNewCharacter() {
  const characters = getSavedCharacters();

  if (characters.length >= MAX_CHARACTERS) {
    return;
  }

  resetEditor();
  showEditor();
}

/**
 * Create one saved-character card.
 */
function createSavedCharacterCard(character) {
  const system = systems.find((item) => item.id === character.systemId);

  const card = document.createElement("article");

  card.className =
    "rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800";

  const title = document.createElement("h3");

  title.className = "text-xl font-bold text-purple-600 dark:text-purple-400";
  title.textContent = character.name || "Unnamed Character";

  const systemName = document.createElement("p");

  systemName.className =
    "mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300";
  systemName.textContent = system?.name ?? "Unknown System";

  const ancestryText = document.createElement("p");

  ancestryText.className = "mt-1 text-sm text-slate-500 dark:text-slate-400";
  ancestryText.textContent = character.ancestry || "No ancestry selected";

  const classText = document.createElement("p");

  classText.className = "mt-1 text-sm text-slate-500 dark:text-slate-400";
  classText.textContent = character.characterClass || "No class selected";

  const actions = document.createElement("div");

  actions.className = "mt-5 flex flex-wrap gap-3";

  const openButton = document.createElement("button");

  openButton.type = "button";
  openButton.dataset.action = "open";
  openButton.dataset.characterId = character.id;

  openButton.className =
    "rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500";

  openButton.textContent = "Open Character";

  const deleteButton = document.createElement("button");

  deleteButton.type = "button";
  deleteButton.dataset.action = "delete";
  deleteButton.dataset.characterId = character.id;

  deleteButton.className =
    "rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/40";

  deleteButton.textContent = "Delete";

  actions.appendChild(openButton);
  actions.appendChild(deleteButton);

  card.appendChild(title);
  card.appendChild(systemName);
  card.appendChild(ancestryText);
  card.appendChild(classText);
  card.appendChild(actions);

  return card;
}

/**
 * Display all saved characters.
 */
function displaySavedCharacters() {
  const characters = getSavedCharacters();

  savedCharacters.innerHTML = "";

  savedCount.textContent = `${characters.length} of ${MAX_CHARACTERS} saved`;

  newCharacterButton.disabled = characters.length >= MAX_CHARACTERS;

  if (characters.length === 0) {
    const message = document.createElement("p");

    message.className = "text-slate-500 dark:text-slate-400";
    message.textContent = "You haven't saved any characters yet.";

    savedCharacters.appendChild(message);

    return;
  }

  characters.forEach((character) => {
    savedCharacters.appendChild(createSavedCharacterCard(character));
  });
}

/**
 * Roll dice using the Rolz API.
 */
async function rollDice(formula) {
  const response = await fetch(`https://rolz.org/api/?${formula}.simple`);

  if (!response.ok) {
    throw new Error("Unable to roll dice.");
  }

  const result = await response.text();
  const value = Number(result.trim());

  if (Number.isNaN(value)) {
    throw new Error("Invalid dice result.");
  }

  return value;
}

/**
 * Find the highest character attribute.
 */
function getHighestAttribute(scores) {
  return Object.entries(scores).reduce((highest, current) =>
    current[1] > highest[1] ? current : highest,
  );
}

/**
 * Display the current Vault suggestion.
 */
function displaySuggestion(system) {
  if (!currentSuggestion || !currentHighestAttribute) {
    classSuggestionBox.classList.add("hidden");
    return;
  }

  const attribute = system.attributes.find(
    (item) => item.name === currentHighestAttribute,
  );

  const attributeLabel = attribute?.label ?? currentHighestAttribute;

  const suggestionType = system.suggestionLabel ?? "Vault Suggests";

  classSuggestion.textContent =
    `${suggestionType}: ${currentSuggestion}. ` +
    `Your strongest attribute is ${attributeLabel} (${currentHighestScore}).`;

  useSuggestionButton.textContent = `Use ${currentSuggestion}`;

  classSuggestionBox.classList.remove("hidden");
}

/**
 * Suggest a class or hero style based on the highest attribute.
 */
function suggestClass(system, scores) {
  const [highestAttribute, highestScore] = getHighestAttribute(scores);

  const choices = system.archetypes?.[highestAttribute];

  if (!choices || choices.length === 0) {
    resetSuggestion();
    return;
  }

  const randomIndex = Math.floor(Math.random() * choices.length);

  currentSuggestion = choices[randomIndex];
  currentHighestAttribute = highestAttribute;
  currentHighestScore = highestScore;

  displaySuggestion(system);
}

/**
 * Roll all attributes.
 */
async function rollAttributes(system) {
  currentScores = {};

  for (const attribute of system.attributes) {
    const result = await rollDice(system.diceFormula);

    currentScores[attribute.name] = result;

    const output = document.querySelector(`#${attribute.name}`);

    if (output) {
      output.textContent = result;
    }
  }

  suggestClass(system, currentScores);

  saveCharacterButton.disabled = false;
}

/**
 * Save a new character or update an existing one.
 */
function storeCharacter(character) {
  const characters = getSavedCharacters();

  const existingIndex = characters.findIndex(
    (item) => item.id === character.id,
  );

  if (existingIndex >= 0) {
    characters[existingIndex] = character;
  } else {
    if (characters.length >= MAX_CHARACTERS) {
      return false;
    }

    characters.push(character);
  }

  saveCharacters(characters);

  return true;
}

/**
 * Save the character currently in the editor.
 */
function saveCurrentCharacter() {
  const system = getSelectedSystem();
  const name = characterName.value.trim();

  clearMessage();

  if (!name) {
    showMessage("Please enter a character name.");
    characterName.focus();
    return;
  }

  if (!system) {
    showMessage("Please choose a game system.");
    gameSystem.focus();
    return;
  }

  if (!ancestry.value) {
    showMessage(`Please choose a ${system.ancestryLabel.toLowerCase()}.`);
    ancestry.focus();
    return;
  }

  if (!characterClass.value) {
    showMessage(
      `Please choose a ${(system.classLabel ?? "class").toLowerCase()}.`,
    );
    characterClass.focus();
    return;
  }

  if (Object.keys(currentScores).length === 0) {
    showMessage("Please roll your character attributes before saving.");
    return;
  }

  const character = {
    id: currentCharacterId ?? Date.now(),
    name,
    systemId: system.id,
    ancestry: ancestry.value,
    characterClass: characterClass.value,
    scores: currentScores,
    suggestion: currentSuggestion,
    highestAttribute: currentHighestAttribute,
    highestScore: currentHighestScore,
  };

  const saved = storeCharacter(character);

  if (!saved) {
    showMessage(
      "You already have five saved characters. Delete one before creating another.",
    );
    return;
  }

  currentCharacterId = character.id;

  editorTitle.textContent = `Edit ${character.name}`;

  displaySavedCharacters();

  showMessage(`${character.name} has been saved.`, "success");
}

/**
 * Open an existing saved character.
 */
function openCharacter(id) {
  const characters = getSavedCharacters();

  const character = characters.find((item) => item.id === id);

  if (!character) {
    return;
  }

  const system = systems.find((item) => item.id === character.systemId);

  if (!system) {
    return;
  }

  resetEditor();

  currentCharacterId = character.id;
  currentScores = { ...character.scores };

  currentSuggestion = character.suggestion ?? null;
  currentHighestAttribute = character.highestAttribute ?? null;
  currentHighestScore = character.highestScore ?? null;

  editorTitle.textContent = `Edit ${character.name}`;

  characterName.value = character.name;

  gameSystem.value = system.id;

  displayAncestries(system);
  displayClasses(system);
  displayAttributes(system);

  ancestry.value = character.ancestry;
  characterClass.value = character.characterClass;

  Object.entries(currentScores).forEach(([attribute, score]) => {
    const output = document.querySelector(`#${attribute}`);

    if (output) {
      output.textContent = score;
    }
  });

  rollAttributesButton.disabled = false;
  rollAttributesButton.textContent = "Roll Again";

  saveCharacterButton.disabled = false;

  displaySuggestion(system);

  showEditor();
}

/**
 * Delete a saved character.
 */
function deleteCharacter(id) {
  const characters = getSavedCharacters();

  const character = characters.find((item) => item.id === id);

  if (!character) {
    return;
  }

  const confirmed = window.confirm(`Delete ${character.name}?`);

  if (!confirmed) {
    return;
  }

  const updatedCharacters = characters.filter((item) => item.id !== id);

  saveCharacters(updatedCharacters);

  if (currentCharacterId === id) {
    closeEditor();
  }

  displaySavedCharacters();
}

/**
 * Game system changed.
 */
gameSystem.addEventListener("change", () => {
  const system = getSelectedSystem();

  resetSuggestion();
  currentScores = {};

  saveCharacterButton.disabled = true;

  if (!system) {
    resetAncestry();
    resetClasses();
    resetAttributes();

    return;
  }

  displayAncestries(system);
  displayClasses(system);
  displayAttributes(system);

  rollAttributesButton.disabled = false;
  rollAttributesButton.textContent = "Roll Attributes";
});

/**
 * Roll Attributes clicked.
 */
rollAttributesButton.addEventListener("click", async () => {
  const system = getSelectedSystem();

  if (!system) {
    return;
  }

  clearMessage();
  resetSuggestion();

  rollAttributesButton.disabled = true;
  rollAttributesButton.textContent = "Rolling...";
  rollAttributesButton.classList.add("dice-rolling");

  saveCharacterButton.disabled = true;

  try {
    await rollAttributes(system);
  } catch {
    showMessage(
      "Something went wrong while rolling your attributes. Please try again.",
    );
  } finally {
    rollAttributesButton.disabled = false;
    rollAttributesButton.textContent = "Roll Again";
  }
});

/**
 * Remove the dice animation.
 */
rollAttributesButton.addEventListener("animationend", () => {
  rollAttributesButton.classList.remove("dice-rolling");
});

/**
 * Use the Vault's suggestion.
 */
useSuggestionButton.addEventListener("click", () => {
  if (!currentSuggestion) {
    return;
  }

  const matchingOption = Array.from(characterClass.options).some(
    (option) => option.value === currentSuggestion,
  );

  if (matchingOption) {
    characterClass.value = currentSuggestion;
  }
});

/**
 * Create new character.
 */
newCharacterButton.addEventListener("click", createNewCharacter);

/**
 * Close editor.
 */
closeEditorButton.addEventListener("click", closeEditor);

/**
 * Save character.
 */
saveCharacterButton.addEventListener("click", saveCurrentCharacter);

/**
 * Handle Open and Delete buttons using event delegation.
 */
savedCharacters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-character-id]");

  if (!button) {
    return;
  }

  const id = Number(button.dataset.characterId);
  const action = button.dataset.action;

  if (action === "open") {
    openCharacter(id);
  }

  if (action === "delete") {
    deleteCharacter(id);
  }
});

/**
 * Initialize the page.
 */
async function init() {
  try {
    systems = await getSystems();

    displaySystems();
    displaySavedCharacters();

    newCharacterButton.disabled = getSavedCharacters().length >= MAX_CHARACTERS;
  } catch {
    gameSystem.innerHTML = `
      <option value="">
        Unable to load game systems
      </option>
    `;

    gameSystem.disabled = true;
    newCharacterButton.disabled = true;

    savedCharacters.innerHTML = `
      <p class="text-red-600 dark:text-red-400">
        Character system data could not be loaded.
      </p>
    `;
  }
}

init();
