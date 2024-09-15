require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

// Obtener las estadísticas de Wakatime
async function getLanguageStats() {
    const WAKATIME_USER_ID = process.env.WAKATIME_USER_ID;
    const apiKey = process.env.WAKATIME_API_KEY;

    const url = `https://wakatime.com/api/v1/users/${WAKATIME_USER_ID}/stats/last_7_days`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!response.ok) {
        throw new Error(`Error fetching Wakatime data: ${response.statusText}`);
    }

    const data = await response.json();

    return data.data.languages.map(lang => ({
        name: lang.name,
        time: lang.total_seconds,
        percentage: (lang.total_seconds / data.data.total_seconds * 100).toFixed(2) + '%'
    }));
}

// Obtener los proyectos más recientes de GitHub
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

    return latestProjects;
}

// Actualizar el README.md con Wakatime y proyectos recientes
async function updateReadme() {
    // Obtener estadísticas de Wakatime
    const languages = await getLanguageStats();

    // Generar la sección de lenguajes
    let languageSection = `## 📊 Estadísticas de GitHub\n\n`;
    languageSection += `### Lenguajes de Programación\n`;
    languages.forEach(lang => {
        const hours = Math.floor(lang.time / 3600);
        const minutes = Math.floor((lang.time % 3600) / 60);
        languageSection += `- **${lang.name}**: ${hours} hrs ${minutes} mins (${lang.percentage})\n`;
    });

    // Obtener proyectos recientes
    const latestProjects = await getLatestProjects();

    // Generar la sección de proyectos recientes
    let projectSection = `## 💼 Experiencia\n\n`;

    latestProjects.forEach(repo => {
        projectSection += `- **${repo.name}**: ${repo.description || 'Sin descripción'}\n`;
        projectSection += `  - **Tecnologías**: ${repo.language || 'No especificada'}\n`;
        projectSection += `  - **URL**: [${repo.html_url}](${repo.html_url})\n\n`;
    });

    // Lee el README.md existente
    let readmeContent = fs.readFileSync('README.md', 'utf8');

    // Reemplaza la sección de Wakatime y la de experiencia
    const updatedReadme = readmeContent
        .replace(/## 📊 Estadísticas de GitHub[\s\S]*?(?=## 📚 Educación)/, languageSection)
        .replace(/## 💼 Experiencia[\s\S]*?(?=## 📚 Educación)/, projectSection);

    // Escribe el nuevo contenido en el README.md
    fs.writeFileSync('README.md', updatedReadme);
}

// Ejecutar la actualización
updateReadme().catch(error => {
    console.error('Error updating README:', error);
});
