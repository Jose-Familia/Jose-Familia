const fetch = require('node-fetch');
const fs = require('fs');

async function getLatestProjects() {
    const username = 'Jose-Familia'; // Cambia por tu username de GitHub
    const url = `https://api.github.com/users/${username}/repos?sort=created&per_page=3`;

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

    let projectSection = `## 💼 Experiencia\n\n`;

    repos.forEach(repo => {
        if (!repo.fork) { // Excluir proyectos que son forks
            // Obtén las tecnologías utilizadas en el repositorio
            projectSection += `- **${repo.name}**: ${repo.description || 'Sin descripción'}\n`;
            projectSection += `  - **Tecnologías**: ${repo.language || 'No especificada'}\n`;
            projectSection += `  - **URL**: [${repo.html_url}](${repo.html_url})\n\n`;
        }
    });

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
