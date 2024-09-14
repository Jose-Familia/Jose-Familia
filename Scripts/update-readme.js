const fetch = require('node-fetch');
const fs = require('fs');

async function getLatestProjects() {
    const username = 'Jose-Familia'; // Cambia por tu username de GitHub
    const url = `https://api.github.com/users/${username}/repos?sort=created&per_page=3`;

    const response = await fetch(url);
    const repos = await response.json();

    let projectSection = `## 💼 Experiencia\n\n`;
    
    repos.forEach(repo => {
        projectSection += `- **${repo.name}**: ${repo.description || 'Sin descripción'}\n  - **Tecnologías**: ${repo.language || 'No especificada'}\n\n`;
    });

    // Lee el README.md existente
    let readmeContent = fs.readFileSync('README.md', 'utf8');

    // Reemplaza la sección de experiencia
    const updatedReadme = readmeContent.replace(/## 💼 Experiencia[\s\S]*?(?=## 📚 Educación)/, projectSection);

    // Escribe el nuevo contenido en el README.md
    fs.writeFileSync('README.md', updatedReadme);
}

getLatestProjects();
