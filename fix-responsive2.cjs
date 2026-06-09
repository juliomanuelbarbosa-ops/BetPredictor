const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/**/*.tsx');
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    content = content.replace(/(?<!md:|sm:|lg:|xl:)\bgrid-cols-2\b/g, 'grid-cols-1 md:grid-cols-2');
    content = content.replace(/(?<!md:|sm:|lg:|xl:)\bgrid-cols-3\b/g, 'grid-cols-1 md:grid-cols-3');
    content = content.replace(/(?<!md:|sm:|lg:|xl:)\bgrid-cols-4\b/g, 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4');
    content = content.replace(/(?<!md:|sm:|lg:|xl:)\bgrid-cols-5\b/g, 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5');
    content = content.replace(/(?<!md:|sm:|lg:|xl:)\bgrid-cols-6\b/g, 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated grid-cols in ' + file);
        count++;
    }
});

console.log('Total files updated: ' + count);
