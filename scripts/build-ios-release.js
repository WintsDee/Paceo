#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍎 Building Paceo iOS Release...\n');

// Vérifier que nous sommes sur macOS
if (process.platform !== 'darwin') {
  console.error('❌ Erreur: La publication iOS nécessite macOS et Xcode.');
  console.log('   Vous devez utiliser un Mac pour publier sur l\'App Store.');
  process.exit(1);
}

// Vérifier que nous sommes dans le bon répertoire
if (!fs.existsSync('package.json')) {
  console.error('❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet.');
  process.exit(1);
}

// Vérifier que Xcode est installé
try {
  execSync('xcodebuild -version', { stdio: 'pipe' });
} catch (error) {
  console.error('❌ Erreur: Xcode n\'est pas installé ou non trouvé.');
  console.log('   Installez Xcode depuis l\'App Store.');
  process.exit(1);
}

try {
  // 1. Nettoyer et construire l'application web
  console.log('📦 Building web application...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Web application built successfully\n');

  // 2. Synchroniser avec Capacitor
  console.log('🔄 Syncing with Capacitor...');
  execSync('npx cap sync', { stdio: 'inherit' });
  console.log('✅ Capacitor sync completed\n');

  // 3. Installer les dépendances CocoaPods
  console.log('📦 Installing CocoaPods dependencies...');
  execSync('cd ios/App && pod install', { stdio: 'inherit' });
  console.log('✅ CocoaPods dependencies installed\n');

  // 4. Ouvrir Xcode
  console.log('🍎 Opening Xcode...');
  console.log('   Dans Xcode :');
  console.log('   1. Sélectionner le projet "App"');
  console.log('   2. Choisir "Any iOS Device" comme destination');
  console.log('   3. Product → Archive');
  console.log('   4. Distribute App → App Store Connect');
  console.log('   5. Upload');
  console.log('');
  
  execSync('npx cap open ios', { stdio: 'inherit' });
  console.log('✅ Xcode opened');

  console.log('\n🎉 Build process completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Dans Xcode, archiver l\'application');
  console.log('   2. Uploader vers App Store Connect');
  console.log('   3. Configurer dans App Store Connect');
  console.log('   4. Suivre le guide : GUIDE-PUBLICATION-IOS.md');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
