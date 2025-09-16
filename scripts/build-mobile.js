#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building Paceo Mobile Applications...\n');

// Vérifier que nous sommes dans le bon répertoire
if (!fs.existsSync('package.json')) {
  console.error('❌ Erreur: package.json non trouvé. Exécutez ce script depuis la racine du projet.');
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

  // 3. Ouvrir les projets natifs
  console.log('📱 Opening native projects...');
  console.log('   - Android Studio will open for Android development');
  console.log('   - Xcode will open for iOS development (on macOS)');
  
  // Ouvrir Android Studio
  try {
    execSync('npx cap open android', { stdio: 'inherit' });
    console.log('✅ Android Studio opened');
  } catch (error) {
    console.log('⚠️  Android Studio could not be opened:', error.message);
  }

  // Ouvrir Xcode (seulement sur macOS)
  if (process.platform === 'darwin') {
    try {
      execSync('npx cap open ios', { stdio: 'inherit' });
      console.log('✅ Xcode opened');
    } catch (error) {
      console.log('⚠️  Xcode could not be opened:', error.message);
    }
  } else {
    console.log('ℹ️  Xcode is only available on macOS');
  }

  console.log('\n🎉 Build process completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Test your app in the emulators');
  console.log('   2. Generate signed APK/AAB for Android');
  console.log('   3. Archive and upload to App Store for iOS');
  console.log('   4. Follow the store configuration guides in store-config/');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
