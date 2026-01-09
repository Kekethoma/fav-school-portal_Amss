const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'app');
const componentsDir = path.join(__dirname, 'components');

const replacements = [
    { old: '#1e40af', new: '#16a34a' }, // Blue -> Green (Primary)
    { old: '#60a5fa', new: '#facc15' }, // Light Blue -> Yellow (Secondary)
    { old: '#3b82f6', new: '#15803d' }, // Brighter Blue -> Darker Green
    { old: 'bg-blue-600', new: 'bg-green-600' },
    { old: 'bg-blue-500', new: 'bg-green-600' },
    { old: 'text-blue-600', new: 'text-green-600' },
    { old: 'text-blue-500', new: 'text-green-600' },
];

function replaceColorsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    replacements.forEach(rep => {
        const regex = new RegExp(rep.old, 'gi');
        content = content.replace(regex, rep.new);
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseDirectory(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            traverseDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
            replaceColorsInFile(fullPath);
        }
    });
}

console.log('Starting color replacement...');
traverseDirectory(targetDir);
traverseDirectory(componentsDir);
console.log('Color replacement complete.');
