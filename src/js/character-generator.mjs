import { qs, getLocalStorage, setLocalStorage } from "./utils.mjs";

const STORAGE_KEY = "vaultCharacters";
const MAX_CHARACTERS = 5;

// Saved character section
const savedCharacters = qs("#savedCharacters");
const savedCount = qs("#savedCount");
const newCharacterButton = qs("#newCharacter");

// Character editor
const characterEditor = qs("#characterEditor");
const editorTitle = qs("#editorTitle");
const closeEditorButton = qs("#closeEditor");

// Character fields
const characterName = qs("#characterName");
const gameSystem = qs("#gameSystem");

const ancestry = qs("#ancestry");
const ancestryLabel = qs("#ancestryLabel");

const characterClass = qs("#characterClass");
const classLabel = qs("#classLabel");

// Vault suggestion
const classSuggestionBox = qs("#classSuggestionBox");
const classSuggestion = qs("#classSuggestion");
const useSuggestionButton = qs("#useSuggestion");

// Attributes
const attributeResults = qs("#attributeResults");
const rollAttributesButton = qs("#rollAttributes");

// Save area
const saveCharacterButton = qs("#saveCharacter");
const editorMessage = qs("#editorMessage");

let systems = [];

let currentCharacterId = null;
let currentScores = {};

let currentSuggestion = null;
let currentHighestAttribute = null;
let currentHighestScore = null;

/**
 * Load game system information from JSON.
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
 * Retrieve saved characters from localStorage.
 */
function getSavedCharacters() {
  const characters = getLocalStorage(STORAGE_KEY);

  return Array.isArray(characters) ? characters : [];
}

/**
 * Save the character array to localStorage.
 */
function saveCharacters(characters) {
  setLocalStorage(STORAGE_KEY, characters);
}

/**
 * Return the currently selected game system.
 */
function getSelectedSystem() {
  return systems.find((system) => system.id === gameSystem.value);
}

/**
 * Populate the Game System select.
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
 * Populate ancestry, species, or character type choices.
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
 * Populate class or hero-style choices.
 */
function displayClasses(system) {
  characterClass.innerHTML = "";

  const label = system.classLabel ?? "Class";
  const classes = system.classes ?? [];

  classLabel.textContent = label;

  const defaultOption = document.createElement("option");

  defaultOption.value = "";
  defaultOption.textContent = `Choose ${label.toLowerCase()}`;

  characterClass.appendChild(defaultOption);

  classes.forEach((item) => {
    const option = document.createElement("option");

    option.value = item;
    option.textContent = item;

    characterClass.appendChild(option);
  });

  characterClass.disabled = false;
}

/**
 * Create attribute cards for the selected system.
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
 * Reset ancestry field.
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
 * Reset class or hero-style field.
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
 * Reset character attributes.
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
 * Display a message in the character editor.
 */
function showMessage(message, type = "error") {
  editorMessage.textContent = message;

  if (type === "success") {
    editorMessage.className =
      "mt-4 text-sm font-semibold text-green-700 dark:text-green-400";

    return;
  }

  editorMessage.className =
    "mt-4 text-sm font-semibold text-red-700 dark:text-red-400";
}

/**
 * Clear editor messages.
 */
function clearMessage() {
  editorMessage.textContent = "";

  editorMessage.className = "mt-4 hidden text-sm font-semibold";
}

/**
 * Reset the complete character editor.
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
 * Show the character editor.
 */
function showEditor() {
  characterEditor.classList.remove("hidden");

  characterEditor.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

/**
 * Close and reset the character editor.
 */
function closeEditor() {
  characterEditor.classList.add("hidden");

  resetEditor();
}

/**
 * Start a new character.
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
 * Build one saved-character card.
 *
 * We use createElement and textContent here instead of inserting
 * user-entered character names with innerHTML.
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
 * Display saved characters.
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
    const card = createSavedCharacterCard(character);

    savedCharacters.appendChild(card);
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
 * Find the highest attribute in the scores object.
 */
function getHighestAttribute(scores) {
  return Object.entries(scores).reduce((highest, current) =>
    current[1] > highest[1] ? current : highest,
  );
}

/**
 * Display the current Vault class or hero-style suggestion.
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
    `Your strongest attribute is ${attributeLabel} ` +
    `(${currentHighestScore}).`;

  useSuggestionButton.textContent = `Use ${currentSuggestion}`;

  classSuggestionBox.classList.remove("hidden");
}

/**
 * Suggest a class or hero style based on the
 * character's highest attribute.
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
 * Roll each character attribute.
 */
async function rollAttributes(system) {
  currentScores = {};

  for (const attribute of system.attributes) {
    const result = await rollDice(system.diceFormula);

    currentScores[attribute.name] = result;

    const output = qs(`#${attribute.name}`);

    if (output) {
      output.textContent = result;
    }
  }

  suggestClass(system, currentScores);

  saveCharacterButton.disabled = false;
}

/**
 * Add or update one saved character.
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
 * Validate and save the currently displayed character.
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
    const label = system.classLabel ?? "class";

    showMessage(`Please choose a ${label.toLowerCase()}.`);

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
      "You already have five saved characters. " +
        "Delete one before creating another.",
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

  currentScores = {
    ...(character.scores ?? {}),
  };

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
    const output = qs(`#${attribute}`);

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
 * Respond to a new game-system selection.
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
 * Roll character attributes.
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
 * Remove dice animation class when complete.
 */
rollAttributesButton.addEventListener("animationend", () => {
  rollAttributesButton.classList.remove("dice-rolling");
});

/**
 * Apply the Vault's suggested class or hero style.
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
 * Begin a new character.
 */
newCharacterButton.addEventListener("click", createNewCharacter);

/**
 * Close the character editor.
 */
closeEditorButton.addEventListener("click", closeEditor);

/**
 * Save the current character.
 */
saveCharacterButton.addEventListener("click", saveCurrentCharacter);

/**
 * Handle Open and Delete buttons on saved
 * character cards with event delegation.
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
 * Initialize Character Generator.
 */
async function init() {
  try {
    systems = await getSystems();

    displaySystems();
    displaySavedCharacters();
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
