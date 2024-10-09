const fs = require('fs');

async function getLatestProjects() {
    const username = 'Jose-Familia'; // Cambia por tu username de GitHub
    const url = `https://api.github.com/users/${username}/repos?sort=created&per_page=100`;

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Node.js',
        },
    });

    const repos = await response.json();
    const nonForkRepos = repos.filter(repo => !repo.fork);
    const latestProjects = nonForkRepos.slice(0, 3);

    // Modificar la sección de proyectos para usar Flexbox
    let projectSection = `## 💼 Experiencia\n\n`;
    projectSection += `<div style="display: flex; flex-wrap: wrap; gap: 16px;">\n`; // Agregar un contenedor Flex

    latestProjects.forEach(repo => {
        projectSection += `<div style="flex: 1 0 45%;"><a href="${repo.html_url}">` +
            `[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=${repo.name})]</a></div>\n`;
    });

    // Añadir tarjeta para el portafolio
    projectSection += `<div style="flex: 1 0 45%;"><a href="https://josefamilia.me/">` +
        `[![Readme Card](https://github-readme-stats.vercel.app/api/pin/?username=${username}&repo=portfolio)]</a></div>\n`;
    
    projectSection += `</div>\n`; // Cerrar el contenedor Flex

    let readmeContent = fs.readFileSync('README.md', 'utf8');
    const updatedReadme = readmeContent.replace(/## 💼 Experiencia[\s\S]*?(?=## 📚 Educación)/, projectSection);

    fs.writeFileSync('README.md', updatedReadme);
}

getLatestProjects().catch(error => {
    console.error('Error updating README:', error);
});
