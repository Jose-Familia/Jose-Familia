const fetch = require('node-fetch');
const fs = require('fs');

async function getLatestProjects() {
    const username = 'Jose-Familia';
    const url = `https://api.github.com/users/${username}/repos?sort=created&per_page=100`;

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'node-fetch'
        }
    });

    if (!response.ok) {
        throw new Error(`Error fetching repositories: ${response.statusText}`);
    }

    const repos = await response.json();

    // Filtrar repos que no son forks
    const nonForkRepos = repos.filter(repo => !repo.fork);

    // Obtener los 6 proyectos más recientes
    const latestProjects = nonForkRepos.slice(0, 6);

    // Encontrar el repositorio con más estrellas
    const repoWithMostStars = nonForkRepos.reduce((max, repo) => (repo.stargazers_count > max.stargazers_count ? repo : max), nonForkRepos[0]);

    // Evitar duplicados si el repositorio con más estrellas ya está en los proyectos más recientes
    if (!latestProjects.some(repo => repo.id === repoWithMostStars.id)) {
        latestProjects.push(repoWithMostStars);
    }

    // Generar sección de proyectos destacados en el formato de GitHub Readme Stats
    let projectSection = `## 💼 Proyectos Destacados\n\n<details>\n<summary>📁 Ver Proyectos</summary>\n\n`;

    latestProjects.forEach(repo => {
        projectSection += `[![${repo.name}](https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}&theme=react)](${repo.html_url})\n`;
    });

    projectSection += `\n</details>\n\n`;

    // Lee el README.md existente
    let readmeContent = fs.readFileSync('README.md', 'utf8');

    // Reemplaza la sección de proyectos destacados
    const updatedReadme = readmeContent.replace(/## 💼 Proyectos Destacados[\s\S]*?(?=## 📚 Educación)/, projectSection);

    // Escribe el nuevo contenido en el README.md
    fs.writeFileSync('README.md', updatedReadme);
}

getLatestProjects().catch(error => {
    console.error('Error updating README:', error);
});
