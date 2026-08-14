import { qs, renderListWithTemplate } from "./utils.mjs";

const gamesList = qs("#gamesList");

/**
 * Load the Games We Love data.
 */
async function getGames() {
  const response = await fetch("/data/games.json");

  if (!response.ok) {
    throw new Error("Unable to load games.");
  }

  const data = await response.json();

  return data.games;
}

/**
 * Return the HTML template for one game card.
 */
function gameCardTemplate(game) {
  return `
    <article
      class="feature-card overflow-hidden rounded-xl border border-slate-200 bg-white
             dark:border-slate-700 dark:bg-slate-900"
    >
      <a
        href="${game.website}"
        target="_blank"
        rel="noopener noreferrer"
        class="block"
      >
        <img
          src="../assets/images/${game.imgurl}"
          alt="${game.name}"
          class="aspect-square w-full object-contain p-4"
        />

        <div class="p-4">
          <h3
            class="text-center font-semibold text-slate-900 dark:text-white"
          >
            ${game.name}
          </h3>

          <p
            class="mt-1 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            ${game.publisher}
          </p>
        </div>
      </a>
    </article>
  `;
}

/**
 * Display all Games We Love cards.
 */
function displayGames(games) {
  renderListWithTemplate(
    gameCardTemplate,
    gamesList,
    games,
    "afterbegin",
    true,
  );
}

/**
 * Initialize the About page.
 */
async function init() {
  try {
    const games = await getGames();

    displayGames(games);
  } catch (error) {
    gamesList.innerHTML = `
      <p class="text-red-600 dark:text-red-400">
        ${error.message}
      </p>
    `;
  }
}

init();
