const fetch = require('node-fetch');
const fs = require('fs');

async function getLatestProjects() {
    const username = 'Jose-Familia'; // Cambia por tu username de GitHub
    const url = `https://api.github.com/users/${username}/repos?sort=created&per_page=100`; // Obtén más repos para el análisis

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

    // Obtener los 3 proyectos más recientes
    const latestProjects = nonForkRepos.slice(0, 3);

    // Encontrar el repositorio con más estrellas
    const repoWithMostStars = nonForkRepos.reduce((max, repo) => (repo.stargazers_count > max.stargazers_count ? repo : max), nonForkRepos[0]);

    // Evitar duplicados si el repositorio con más estrellas ya está en los proyectos más recientes
    if (!latestProjects.some(repo => repo.id === repoWithMostStars.id)) {
        latestProjects.push(repoWithMostStars);
    }

    // Sección de experiencia con link al portfolio
    let projectSection = `## 💼 Experiencia\n\n`;

    latestProjects.forEach(repo => {
        projectSection += `- **${repo.name}**: ${repo.description || 'Sin descripción'}\n`;
        projectSection += `  - **Tecnologías**: ${repo.language || 'No especificada'}\n`;
        projectSection += `  - **URL**: [${repo.html_url}](${repo.html_url})\n\n`;
    });

    // Añadir el link al portfolio
    projectSection += `- **Mi Portfolio**: [portfolio-josefamilia.vercel.app](https://portfolio-josefamilia.vercel.app/)\n\n`;

    // Lee el README.md existente
    let readmeContent = fs.readFileSync('README.md', 'utf8');

    // Reemplaza la sección de experiencia
    const updatedReadme = readmeContent.replace(/## 💼 Experiencia[\s\S]*?(?=## 📚 Educación)/, projectSection);

    // Escribe el nuevo contenido en el README.md
    fs.writeFileSync('README.md', updatedReadme);
}

getLatestProjects().catch(error => {
    console.error('Error updating README:', error);
});
