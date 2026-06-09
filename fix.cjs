const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist') && !file.includes('.git')) {
            results = results.concat(walkDir(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkDir('./src');
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('16,185,129') || content.includes('#10b981') || content.includes('10b981') || content.includes('emerald')) {
        content = content.replace(/16,185,129/g, '23,241,209');
        content = content.replace(/10b981/g, '17f1d1');
        content = content.replace(/emerald/gi, 'stratos-accent');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
