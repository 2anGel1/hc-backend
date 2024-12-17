const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

// Définir le dossier contenant vos fichiers .js
const inputDir = path.join(__dirname, 'public/bundle'); // Par exemple, 'public/js'
const outputDir = path.join(__dirname, 'public/obfuscated'); // Dossier pour les fichiers obfusqués

// Créez le dossier de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Obfusquer tous les fichiers .js dans le dossier
fs.readdirSync(inputDir).forEach(file => {
    if (file.endsWith('.js')) {
        const filePath = path.join(inputDir, file);
        const outputFilePath = path.join(outputDir, file);

        const code = fs.readFileSync(filePath, 'utf8');

        // Obfuscation du code
        const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true,
            numbersToExpressions: true,
            stringArray: true
        }).getObfuscatedCode();

        // Sauvegarder le code obfusqué dans un fichier
        fs.writeFileSync(outputFilePath, obfuscatedCode);

        console.log(`Obfuscated: ${file}`);
    }
});
