#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Paceo Android Release...\n');

// Vérifier que nous sommes dans le bon répertoire
if (!fs.existsSync('package.json')) {
  console.error('❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet.');
  process.exit(1);
}

// Vérifier que le keystore existe
const keystorePath = path.join(__dirname, '..', 'android', 'paceo-release-key.jks');
if (!fs.existsSync(keystorePath)) {
  console.log('⚠️  Keystore non trouvé. Veuillez d\'abord créer un keystore de production.');
  console.log('   Suivez les étapes dans GUIDE-PUBLICATION-ANDROID.md');
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

  // 3. Ouvrir Android Studio
  console.log('📱 Opening Android Studio...');
  console.log('   Dans Android Studio :');
  console.log('   1. Build → Generate Signed Bundle/APK');
  console.log('   2. Choisir Android App Bundle (.aab)');
  console.log('   3. Sélectionner le keystore paceo-release-key.jks');
  console.log('   4. Choisir release build variant');
  console.log('   5. Cliquer Create');
  console.log('');
  
  execSync('npx cap open android', { stdio: 'inherit' });
  console.log('✅ Android Studio opened');

  console.log('\n🎉 Build process completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Dans Android Studio, générer le fichier .aab');
  console.log('   2. Le fichier sera dans : android/app/build/outputs/bundle/release/');
  console.log('   3. Uploader le fichier .aab sur Google Play Console');
  console.log('   4. Suivre le guide : GUIDE-PUBLICATION-ANDROID.md');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
