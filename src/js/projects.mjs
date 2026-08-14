import { qs, renderListWithTemplate } from "./utils.mjs";

const projectList = qs("#projectList");

/**
 * Load upcoming project data.
 */
async function getProjects() {
  const response = await fetch("/data/projects.json");

  if (!response.ok) {
    throw new Error("Unable to load upcoming projects.");
  }

  const data = await response.json();

  return data.projects;
}

/**
 * Return the HTML template for one project card.
 */
function projectCardTemplate(project) {
  return `
    <article
      class="feature-card overflow-hidden rounded-xl border border-slate-200
             bg-white dark:border-slate-700 dark:bg-slate-900"
    >
      <img
        src="${project.image}"
        alt="${project.title}"
        class="aspect-[8/5] w-full object-cover"
      />

      <div class="p-6">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2
            class="text-2xl font-bold text-slate-900 dark:text-white"
          >
            ${project.title}
          </h2>

          <span
            class="rounded-full bg-purple-100 px-3 py-1 text-sm font-semibold
                   text-purple-700 dark:bg-purple-950 dark:text-purple-300"
          >
            ${project.status}
          </span>
        </div>

        <p
          class="mt-4 leading-7 text-slate-700 dark:text-slate-300"
        >
          ${project.description}
        </p>

        <dl
          class="mt-6 grid gap-4 border-t border-slate-200 pt-6
                 dark:border-slate-700 sm:grid-cols-3"
        >
          <div>
            <dt
              class="text-sm font-semibold text-slate-500 dark:text-slate-400"
            >
              Category
            </dt>

            <dd
              class="mt-1 text-slate-900 dark:text-white"
            >
              ${project.category}
            </dd>
          </div>

          <div>
            <dt
              class="text-sm font-semibold text-slate-500 dark:text-slate-400"
            >
              Game / System
            </dt>

            <dd
              class="mt-1 text-slate-900 dark:text-white"
            >
              ${project.gameSystem}
            </dd>
          </div>

          <div>
            <dt
              class="text-sm font-semibold text-slate-500 dark:text-slate-400"
            >
              Target
            </dt>

            <dd
              class="mt-1 text-slate-900 dark:text-white"
            >
              ${project.targetDate}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  `;
}

/**
 * Display all upcoming project cards.
 */
function displayProjects(projects) {
  renderListWithTemplate(
    projectCardTemplate,
    projectList,
    projects,
    "afterbegin",
    true,
  );
}

/**
 * Initialize the Projects page.
 */
async function init() {
  try {
    const projects = await getProjects();

    displayProjects(projects);
  } catch (error) {
    projectList.innerHTML = `
      <p class="text-red-600 dark:text-red-400">
        ${error.message}
      </p>
    `;
  }
}

init();
