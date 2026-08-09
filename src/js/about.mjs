const gamesList = document.querySelector("#gamesList");

async function getGames() {
  const response = await fetch("/data/games.json");

  if (!response.ok) {
    throw new Error("Unable to load games.");
  }

  const data = await response.json();

  return data.games;
}

function createGameCard(game) {
  const card = document.createElement("article");

  card.className =
    "overflow-hidden rounded-xl border border-slate-700 bg-slate-900";

  card.innerHTML = `
    <a
      href="${game.website}"
      target="_blank"
      rel="noopener noreferrer"
      class="block"
    >
      <img
        src="/assets/images/${game.imgurl}"
        alt="${game.name}"
        class="aspect-square w-full object-contain p-4"
      />

      <div class="p-4">
        <h3 class="text-center font-semibold text-white">
          ${game.name}
        </h3>

        <p class="mt-1 text-center text-sm text-slate-400">
          ${game.publisher}
        </p>
      </div>
    </a>
  `;

  return card;
}

function displayGames(games) {
  gamesList.innerHTML = "";

  games.forEach((game) => {
    gamesList.appendChild(createGameCard(game));
  });
}
async function init() {
  try {
    const games = await getGames();

    displayGames(games);
  } catch (error) {
    gamesList.innerHTML = `
      <p class="text-red-400">
        ${error.message}
      </p>
    `;
  }
}

init();
