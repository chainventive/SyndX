const fs = require('fs');
const path = require('path');

const extractArtifactABI = (jsonFilePath) => {

    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    
    const artifact = JSON.parse(fileContent);

    return artifact.abi;
}

module.exports = { extractArtifactABI };