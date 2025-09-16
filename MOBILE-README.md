# Paceo Mobile - Applications iOS et Android

Ce document explique comment construire, tester et publier les applications mobiles Paceo.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ installé
- Android Studio (pour Android)
- Xcode (pour iOS, macOS uniquement)
- Capacitor CLI installé globalement : `npm install -g @capacitor/cli`

### Construction et test
```bash
# Construire et ouvrir les projets natifs
npm run mobile:build

# Ou manuellement :
npm run build
npx cap sync
npx cap open android  # Pour Android
npx cap open ios      # Pour iOS (macOS uniquement)
```

## 📱 Plateformes supportées

### Android
- **Version minimale** : Android 7.0 (API 24)
- **Version cible** : Android 14 (API 34)
- **Architecture** : ARM64, x86_64

### iOS
- **Version minimale** : iOS 13.0
- **Version cible** : iOS 17.0
- **Appareils** : iPhone, iPad

## 🛠️ Développement

### Structure du projet
```
├── android/                 # Projet Android natif
├── ios/                     # Projet iOS natif
├── resources/               # Icônes et splash screens
├── store-config/           # Configuration pour les stores
├── scripts/                # Scripts de build
└── capacitor.config.ts     # Configuration Capacitor
```

### Commandes utiles
```bash
# Synchroniser les changements web vers les apps natives
npx cap sync

# Construire l'application web
npm run build

# Ouvrir Android Studio
npx cap open android

# Ouvrir Xcode
npx cap open ios

# Lancer sur émulateur Android
npx cap run android

# Lancer sur émulateur iOS
npx cap run ios
```

## 🎨 Personnalisation

### Icônes
Les icônes sont stockées dans `resources/` :
- `icon.png` : Icône principale (1024x1024px)
- `splash.png` : Splash screen (2732x2732px)

### Configuration
Modifiez `capacitor.config.ts` pour :
- Changer l'ID de l'application
- Modifier le nom de l'application
- Configurer les plugins
- Ajuster les paramètres de splash screen

## 📦 Publication

### Android (Google Play)
1. Suivez le guide dans `store-config/android-store.md`
2. Construisez un Android App Bundle (.aab)
3. Uploadez sur Google Play Console

### iOS (App Store)
1. Suivez le guide dans `store-config/ios-store.md`
2. Archivez l'application dans Xcode
3. Uploadez sur App Store Connect

## 🔧 Dépannage

### Problèmes courants

#### Android
- **Gradle sync failed** : Vérifiez que Android Studio est à jour
- **Build failed** : Nettoyez le projet : `cd android && ./gradlew clean`
- **Emulateur ne démarre pas** : Vérifiez que l'émulateur est configuré correctement

#### iOS
- **Build failed** : Vérifiez que Xcode est à jour
- **Pod install failed** : Exécutez `cd ios/App && pod install`
- **Simulator ne démarre pas** : Vérifiez que le simulateur est installé

### Logs de débogage
```bash
# Android
npx cap run android --livereload --external

# iOS
npx cap run ios --livereload --external
```

## 📋 Checklist de publication

### Avant la publication
- [ ] Tester sur différents appareils
- [ ] Vérifier les icônes et splash screens
- [ ] Tester toutes les fonctionnalités
- [ ] Vérifier les performances
- [ ] Lire les guidelines des stores

### Android
- [ ] Générer un keystore de production
- [ ] Signer l'APK/AAB
- [ ] Tester l'APK sur un appareil physique
- [ ] Remplir les métadonnées Google Play

### iOS
- [ ] Configurer les certificats de distribution
- [ ] Tester sur un appareil physique
- [ ] Remplir les métadonnées App Store
- [ ] Soumettre pour révision Apple

## 🆘 Support

Pour toute question ou problème :
1. Vérifiez la documentation Capacitor : https://capacitorjs.com/docs
2. Consultez les guides de dépannage des stores
3. Vérifiez les logs de débogage

## 📄 Licence

Cette application est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
