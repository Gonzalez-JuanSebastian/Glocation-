const fs = require('fs');
const path = require('path');

console.log('🛠️ Corrigiendo rutas de importación...');

// Corregir analysisController.js
const analysisControllerPath = path.join(__dirname, 'backend/src/controllers/analysisController.js');
let analysisControllerContent = fs.readFileSync(analysisControllerPath, 'utf8');
analysisControllerContent = analysisControllerContent.replace(
  "const aiService = require('../../utils/aiService.js');",
  "const aiService = require('../utils/aiService.js');"
);
analysisControllerContent = analysisControllerContent.replace(
  "const { FallbackStrategy } = require('../../utils/fallbackStrategies.js');",
  "const { FallbackStrategy } = require('../utils/fallbackStrategies.js');"
);
fs.writeFileSync(analysisControllerPath, analysisControllerContent, 'utf8');
console.log('✅ analysisController.js corregido');

// Corregir routes/analysis.js
const analysisRoutesPath = path.join(__dirname, 'backend/src/routes/analysis.js');
let analysisRoutesContent = fs.readFileSync(analysisRoutesPath, 'utf8');
analysisRoutesContent = analysisRoutesContent.replace(
  "const { analysisController } = require('../controllers/analysisController.js');",
  "const { analysisController } = require('./../controllers/analysisController.js');"
);
fs.writeFileSync(analysisRoutesPath, analysisRoutesContent, 'utf8');
console.log('✅ analysis.js (routes) corregido');

console.log('🎉 Rutas de importación corregidas!');
