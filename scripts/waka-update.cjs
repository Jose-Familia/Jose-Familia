require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

const WAKATIME_USER_ID = 'Jose Familia';

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

    let languageSection = `## 📊 Estadísticas de Wakatime\n\n`;
    languages.forEach(lang => {
        const hours = Math.floor(lang.time / 3600);
        const minutes = Math.floor((lang.time % 3600) / 60);
        languageSection += `- **${lang.name}**: ${hours} hrs ${minutes} mins (${lang.percentage})\n`;
    });

    let readmeContent = fs.readFileSync('README.md', 'utf8');

    const updatedReadme = readmeContent
        .replace(/## 📊 Estadísticas de Wakatime[\s\S]*?(?=## 📊 Estadísticas de GitHub)/, languageSection);

    fs.writeFileSync('README.md', updatedReadme);
}

updateReadme().catch(error => {
    console.error('Error updating README:', error);
});
