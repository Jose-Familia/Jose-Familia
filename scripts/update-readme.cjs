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

    let projectSection = `## 💼 Experiencia\n\n<div style="display: flex; flex-wrap: wrap; gap: 20px;">\n`;

    // Generar tarjetas en formato de div
    latestProjects.forEach(repo => {
        projectSection += `<div style="flex: 1 1 calc(50% - 20px);"><a href="${repo.html_url}"><img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name}" alt="${repo.name} card" /></a></div>\n`;
    });

    projectSection += `<div style="flex: 1 1 calc(50% - 20px);"><a href="https://josefamilia.me/"><img src="https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=portfolio" alt="Portfolio card" /></a></div>\n`;

    projectSection += `</div>\n\n`;

    let readmeContent = fs.readFileSync('README.md', 'utf8');
    const updatedReadme = readmeContent.replace(/## 💼 Experiencia[\s\S]*?(?=## 📚 Educación)/, projectSection);

    fs.writeFileSync('README.md', updatedReadme);
}

getLatestProjects().catch(error => {
    console.error('Error updating README:', error);
});
