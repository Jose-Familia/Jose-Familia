const fetch = require('node-fetch');
const fs = require('fs');

async function getLanguageStats() {
    const WAKATIME_API_KEY = process.env.WAKATIME_API_KEY;
    const WAKATIME_USER_ID = 'JoseFamilia'; // Asegúrate de que este ID es correcto
    const url = `https://wakatime.com/api/v1/users/${WAKATIME_USER_ID}/stats/last_7_days`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${WAKATIME_API_KEY}`
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

async function updateReadme() {
    const languages = await getLanguageStats();

    let languageSection = `## 📊 Estadísticas de Wakatime\n\n`;
    languageSection += `### Lenguajes de Programación\n`;
    languages.forEach(lang => {
        const hours = Math.floor(lang.time / 3600);
        const minutes = Math.floor((lang.time % 3600) / 60);
        languageSection += `- **${lang.name}**: ${hours} hrs ${minutes} mins (${lang.percentage})\n`;
    });

    let readmeContent = fs.readFileSync('README.md', 'utf8');

    // Reemplaza la sección de Estadísticas de Wakatime
    const updatedReadme = readmeContent.replace(/## 📊 Estadísticas de Wakatime[\s\S]*?(?=## 📊 Estadísticas de GitHub)/, languageSection);

    // Verifica si hay cambios antes de escribir en el archivo
    if (updatedReadme === readmeContent) {
        console.log('No changes detected in README.md');
        return;
    }

    fs.writeFileSync('README.md', updatedReadme);
    console.log('README.md updated successfully');
}

updateReadme().catch(error => {
    console.error('Error updating README:', error);
});


// Obtener los proyectos más recientes de GitHub
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
    console.log('GitHub repos data:', repos); // Para verificar los datos

    // Filtrar repos que no son forks
    const nonForkRepos = repos.filter(repo => !repo.fork);

    // Obtener los 3 proyectos más recientes
    const latestProjects = nonForkRepos.slice(0, 3);

    // Encontrar el repositorio con más estrellas
    const repoWithMostStars = nonForkRepos.reduce((max, repo) => (repo.stargazers_count > max.stargazers_count ? repo : max), nonForkRepos[0]);

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

    let readmeContent = fs.readFileSync('README.md', 'utf8');

    console.log('Old README:', readmeContent); // Imprimir el contenido del README antes de la modificación

    // Reemplaza la sección de Wakatime y la de experiencia
    const updatedReadme = readmeContent
        .replace(/## 📊 Estadísticas de GitHub[\s\S]*?(?=## 📚 Educación)/, languageSection)
        .replace(/## 💼 Experiencia[\s\S]*?(?=## 📚 Educación)/, projectSection);

    console.log('New README:', updatedReadme); // Verificar cómo se verá el nuevo README

    fs.writeFileSync('README.md', updatedReadme);
}

// Ejecutar la actualización
updateReadme().catch(error => {
    console.error('Error updating README:', error);
});
