const fs = require('fs');
const path = require('path');

const colorMap = {
    '#800020': '#1e40af',
    '#400010': '#1e3a8a',
    '#600010': '#1d4ed8',
    '#a00030': '#3b82f6',
    '#FFD700': '#60a5fa',
    '#FFC700': '#3b82f6',
    '#FFA500': '#93c5fd',
    '[#800020]': '[#1e40af]',
    '[#400010]': '[#1e3a8a]',
    '[#600010]': '[#1d4ed8]',
    '[#a00030]': '[#3b82f6]',
    '[#FFD700]': '[#60a5fa]',
    '[#FFC700]': '[#3b82f6]',
    '[#FFA500]': '[#93c5fd]'
};

function replaceInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        for (const [oldColor, newColor] of Object.entries(colorMap)) {
            if (content.includes(oldColor)) {
                content = content.split(oldColor).join(newColor);
                modified = true;
            }
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err.message);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') {
                walkDir(filePath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            replaceInFile(filePath);
        }
    }
}

console.log('Starting color replacement...');
walkDir('./app');
walkDir('./components');
console.log('Color replacement complete!');
