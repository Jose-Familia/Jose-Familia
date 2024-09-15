require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

// Reemplaza con tu ID de usuario Wakatime
const WAKATIME_USER_ID = 'YOUR_USER_ID'; // Cambia 'YOUR_USER_ID' a tu ID real de Wakatime

async function getLanguageStats() {
    const url = `https://wakatime.com/api/v1/users/${WAKATIME_USER_ID}/stats/last_7_days`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${process.env.WAKATIME_API_KEY}`
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

    let languageSection = `## 📊 Estadísticas de GitHub\n\n`;
    languageSection += `### Lenguajes de Programación\n`;
    languages.forEach(lang => {
        const hours = Math.floor(lang.time / 3600);
        const minutes = Math.floor((lang.time % 3600) / 60);
        languageSection += `- **${lang.name}**: ${hours} hrs ${minutes} mins (${lang.percentage})\n`;
    });

    let readmeContent = fs.readFileSync('README.md', 'utf8');

    // Reemplaza la sección de Estadísticas de GitHub
    const updatedReadme = readmeContent
        .replace(/## 📊 Estadísticas de GitHub[\s\S]*?(?=## 📚 Educación)/, languageSection);

    fs.writeFileSync('README.md', updatedReadme);
}

updateReadme().catch(error => {
    console.error('Error updating README:', error);
});
