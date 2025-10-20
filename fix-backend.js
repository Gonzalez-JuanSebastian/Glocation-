const fs = require('fs');
const path = require('path');

// Archivos a convertir de ES6 a CommonJS
const filesToConvert = [
  'backend/src/controllers/analysisController.js',
  'backend/src/routes/analysis.js', 
  'backend/src/utils/aiService.js',
  'backend/src/utils/fallbackStrategies.js',
  'backend/prisma/seed.js'
];

console.log('🛠️ Reparando archivos del backend...');

filesToConvert.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Reemplazar imports
    content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"];/g, 'const $1 = require(\'$2\');');
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];/g, 'const {$1} = require(\'$2\');');
    content = content.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"];/g, 'const $1 = require(\'$2\');');
    
    // Reemplazar exports
    content = content.replace(/export\s+default\s+(\w+);/g, 'module.exports = $1;');
    content = content.replace(/export\s+(class|function|const)\s+(\w+)/g, '$1 $2');
    content = content.replace(/export\s+\{([^}]+)\};/g, 'module.exports = {$1};');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Reparado: ${file}`);
  } else {
    console.log(`❌ Archivo no encontrado: ${file}`);
  }
});

console.log('🎉 Reparación completada!');