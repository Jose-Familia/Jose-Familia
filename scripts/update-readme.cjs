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
    const nonForkRepos = repos.filter(repo => !repo.fork);
    const latestProjects = nonForkRepos.slice(0, 3);

    let projectSection = `## 💼 Experiencia\n\n`;

    // Generar las tarjetas en bloques de dos
    latestProjects.forEach((repo, index) => {
        if (index % 2 === 0) projectSection += `<div>\n`; // Inicia el bloque de dos
        projectSection += `
            <a href="${repo.html_url}">
                <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}" alt="${repo.name} card" />
            </a>
        `;
        if (index % 2 === 1 || index === latestProjects.length - 1) projectSection += `</div>\n`; // Cierra el bloque de dos
    });

    // Añadir el portafolio en una fila separada
    projectSection += `
        <div>
            <a href="https://josefamilia.me/">
                <img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=portfolio" alt="Portfolio card" />
            </a>
        </div>
    `;

    let readmeContent = fs.readFileSync('README.md', 'utf8');
    const updatedReadme = readmeContent.replace(/## 💼 Experiencia[\s\S]*?(?=## 📚 Educación)/, projectSection);

    fs.writeFileSync('README.md', updatedReadme);
}

getLatestProjects().catch(error => {
    console.error('Error updating README:', error);
});
