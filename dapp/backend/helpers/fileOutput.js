const fs = require('fs');
const path = require('path');

const writeOutputFile = (outputPaths, filename, object) => {

    for (let outputPath of outputPaths) {

        if (!filename.endsWith('.js')) {
            filename += '.js';
        }
    
        const fullPath = path.join(outputPath, filename);
    
        const exportString = `module.exports = ${JSON.stringify(object, null, 2)};`;
    
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }
    
        fs.writeFileSync(fullPath, exportString);

    }
}

module.exports = { writeOutputFile };