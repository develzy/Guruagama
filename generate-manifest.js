const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            // Get relative path from public/perangkat-ajar
            const relative = path.relative(path.resolve('public/perangkat-ajar'), file).replace(/\\/g, '/');
            results.push({
                path: relative,
                size: stat.size,
                name: path.basename(file)
            });
        }
    });
    return results;
}

const files = walk('public/perangkat-ajar');
fs.writeFileSync('src/lib/local-files.json', JSON.stringify(files, null, 2));
console.log(`Generated manifest with ${files.length} files.`);
